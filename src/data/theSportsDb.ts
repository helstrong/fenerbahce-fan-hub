import { LEAGUE_ID, SEASON, SPORTSDB_BASE, TEAM_ID } from './config'
import type { ClubProfile, Fixture, FixtureStatus, Kit, Player, Position, Standing, Team } from './types'

// Thin client for TheSportsDB (https://www.thesportsdb.com/), JSON API v1.
// Each exported function maps a raw response into our own domain types so the
// rest of the app never sees the provider's shape.
//
// Requests go to the same-origin proxy (SPORTSDB_BASE); the server injects the
// API key and forwards to TheSportsDB, so no key is ever present in the browser.

async function request(path: string, params: Record<string, string | number>): Promise<any> {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) qs.set(key, String(value))
  const url = `${SPORTSDB_BASE}/${path}?${qs.toString()}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

const shortCode = (name: string) => name.replace(/[^\p{L}]/gu, '').slice(0, 3).toUpperCase() || '???'

const toTeam = (id: unknown, name: string, badge?: string): Team => ({
  id: String(id ?? ''),
  name,
  short: shortCode(name),
  badge: badge || undefined,
})

// TheSportsDB returns most numbers as strings; normalise safely.
const num = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const score = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : num(v)
const clean = (v: unknown): string | undefined => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s || undefined
}

// ---- Standings (top 5 on the free tier) ---------------------------------
export async function fetchStandings(season: string = SEASON): Promise<Standing[]> {
  const { table } = await request('lookuptable.php', { l: LEAGUE_ID, s: season })
  const rows: any[] = table ?? []
  return rows.map((r) => ({
    rank: num(r.intRank),
    team: toTeam(r.idTeam, r.strTeam, r.strBadge),
    played: num(r.intPlayed),
    won: num(r.intWin),
    drawn: num(r.intDraw),
    lost: num(r.intLoss),
    gf: num(r.intGoalsFor),
    ga: num(r.intGoalsAgainst),
    points: num(r.intPoints),
    form: clean(r.strForm),
  }))
}

// ---- Fixtures (rolling ~5 last + ~5 next on the free tier) ---------------
function toFixture(x: any): Fixture {
  const homeScore = score(x.intHomeScore)
  const awayScore = score(x.intAwayScore)
  // "Match Finished" / "FT" or both scores present ⇒ finished; otherwise upcoming.
  const finished =
    /finished|ft|aet|pen/i.test(String(x.strStatus ?? '')) ||
    (homeScore !== null && awayScore !== null)
  const status: FixtureStatus = finished ? 'finished' : 'upcoming'
  const date = x.strTimestamp || `${x.dateEvent ?? ''}T${x.strTime ?? '00:00:00'}`
  return {
    id: String(x.idEvent),
    competition: x.strLeague ?? 'Süper Lig',
    date,
    home: toTeam(x.idHomeTeam, x.strHomeTeam, x.strHomeTeamBadge),
    away: toTeam(x.idAwayTeam, x.strAwayTeam, x.strAwayTeamBadge),
    homeScore,
    awayScore,
    status,
    venue: x.strVenue ?? '',
    round: clean(x.intRound),
    thumb: clean(x.strThumb),
  }
}

export async function fetchFixtures(): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const [last, next] = await Promise.all([
    request('eventslast.php', { id: TEAM_ID }), // returns { results: [...] }
    request('eventsnext.php', { id: TEAM_ID }), // returns { events: [...] }
  ])

  const results = ((last.results ?? last.events ?? []) as any[])
    .map(toFixture)
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const upcoming = ((next.events ?? []) as any[])
    .map(toFixture)
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  return { results, upcoming }
}

// Competitions Fenerbahçe may play in a given season. eventsseason returns the
// whole competition, so we query each, filter to our team, and merge. Only the
// leagues the club actually featured in return matches; the rest come back empty.
const SEASON_COMPETITIONS = [
  LEAGUE_ID, // Süper Lig
  4960, // Turkish Cup
  4480, // UEFA Champions League
  4481, // UEFA Europa League
  5071, // UEFA Conference League
]

// A season "2025-2026" runs ~Jul 2025 → Jun 2026. Used to attribute rolling
// events (which include friendlies) to the selected season by date.
function seasonRange(season: string): [number, number] {
  const start = parseInt(season, 10)
  return [Date.UTC(start, 6, 1), Date.UTC(start + 1, 5, 30, 23, 59, 59)]
}

const involvesTeam = (x: any, team: string) =>
  String(x.idHomeTeam) === team || String(x.idAwayTeam) === team

// Full season across every competition (league, cup, European) plus friendlies,
// via premium. Friendlies aren't reliably in eventsseason, so we fold in the
// team's rolling events that fall inside the season window and dedupe by id.
export async function fetchSeasonFixtures(
  season: string = SEASON,
): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const team = String(TEAM_ID)

  const competitions = Promise.all(
    SEASON_COMPETITIONS.map((id) =>
      request('eventsseason.php', { id, s: season })
        .then((r) => (r.events ?? []) as any[])
        .catch(() => []),
    ),
  )
  const rolling = Promise.all(
    [
      request('eventslast.php', { id: TEAM_ID }).then((r) => (r.results ?? r.events ?? []) as any[]),
      request('eventsnext.php', { id: TEAM_ID }).then((r) => (r.events ?? []) as any[]),
    ].map((p) => p.catch(() => [] as any[])),
  )

  const [competitionLists, rollingLists] = await Promise.all([competitions, rolling])

  const byId = new Map<string, Fixture>()
  for (const list of competitionLists)
    for (const x of list) if (involvesTeam(x, team)) byId.set(String(x.idEvent), toFixture(x))

  // Rolling events (all competitions incl. friendlies) within the season window.
  const [from, to] = seasonRange(season)
  for (const list of rollingLists)
    for (const x of list) {
      if (!involvesTeam(x, team) || byId.has(String(x.idEvent))) continue
      const t = +new Date(x.strTimestamp || x.dateEvent || 0)
      if (t >= from && t <= to) byId.set(String(x.idEvent), toFixture(x))
    }

  const all = [...byId.values()]
  const results = all
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const upcoming = all
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  return { results, upcoming }
}

// ---- Squad (bio only, ~10 players on the free tier) ---------------------
const mapPosition = (p?: string): Position => {
  const s = (p ?? '').toLowerCase()
  if (s.includes('keeper') || s.includes('goal')) return 'Goalkeeper'
  // Check midfield first: "Defensive Midfield" contains "defen" but is a midfielder.
  if (s.includes('midfield')) return 'Midfielder'
  if (s.includes('back') || s.includes('defen') || s.includes('centre-b')) return 'Defender'
  if (s.includes('forward') || s.includes('wing') || s.includes('strik') || s.includes('attack'))
    return 'Forward'
  return 'Midfielder'
}

function ageFrom(dateBorn?: string): number {
  if (!dateBorn) return 0
  const born = new Date(dateBorn)
  if (Number.isNaN(+born)) return 0
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return age > 0 ? age : 0
}

export async function fetchPlayers(): Promise<Player[]> {
  const { player } = await request('lookup_all_players.php', { id: TEAM_ID })
  const roster: any[] = player ?? []
  return roster.map((p) => ({
    id: String(p.idPlayer),
    name: p.strPlayer,
    number: num(p.strNumber),
    position: mapPosition(p.strPosition),
    nationality: clean(p.strNationality) ?? '',
    age: ageFrom(p.dateBorn),
    photo: clean(p.strCutout) ?? clean(p.strThumb),
    foot: clean(p.strSide),
    height: clean(p.strHeight),
    weight: clean(p.strWeight),
    birthplace: clean(p.strBirthLocation),
    signing: clean(p.strSigning),
  }))
}

// ---- Club profile -------------------------------------------------------
export async function fetchClub(): Promise<ClubProfile> {
  const { teams } = await request('lookupteam.php', { id: TEAM_ID })
  const t = teams?.[0]
  if (!t) throw new Error('lookupteam: no team returned')

  const competitions = [t.strLeague, t.strLeague2, t.strLeague3].map(clean).filter(Boolean) as string[]
  const fanart = [t.strFanart1, t.strFanart2, t.strFanart3, t.strFanart4].map(clean).filter(Boolean) as string[]

  return {
    name: t.strTeam,
    altName: clean(t.strTeamAlternate),
    nicknames: clean(t.strKeywords),
    formedYear: clean(t.intFormedYear),
    stadium: clean(t.strStadium),
    capacity: clean(t.intStadiumCapacity),
    location: clean(t.strLocation),
    country: clean(t.strCountry),
    description: clean(t.strDescriptionEN),
    competitions,
    badge: clean(t.strBadge),
    logo: clean(t.strLogo),
    banner: clean(t.strBanner),
    fanart,
    website: clean(t.strWebsite),
    facebook: clean(t.strFacebook),
    twitter: clean(t.strTwitter),
    instagram: clean(t.strInstagram),
    youtube: clean(t.strYoutube),
  }
}

// ---- Kits / jerseys -----------------------------------------------------
export async function fetchKits(): Promise<Kit[]> {
  const { equipment } = await request('lookupequipment.php', { id: TEAM_ID })
  const rows: any[] = equipment ?? []
  return rows
    .map((e) => ({
      season: clean(e.strSeason) ?? '',
      type: clean(e.strType) ?? '',
      image: clean(e.strEquipment) ?? '',
    }))
    .filter((k) => k.image)
}
