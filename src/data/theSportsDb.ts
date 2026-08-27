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
// whole competition, so we query each and keep every match (not just our
// team's) — the full list is also what lets us compute a standings table for
// competitions TheSportsDB doesn't supply one for (see fetchCompetitionTables).
const COMPETITIONS: { id: number; name: string }[] = [
  { id: LEAGUE_ID, name: 'Süper Lig' },
  { id: 4960, name: 'Turkish Cup' },
  { id: 4480, name: 'UEFA Champions League' },
  { id: 4481, name: 'UEFA Europa League' },
  { id: 5071, name: 'UEFA Conference League' },
]

// Fetch every match of every candidate competition for a season, once. Shared
// by fetchSeasonFixtures (filters to our team) and fetchCompetitionTables
// (uses the full list to compute a table) so neither refetches the other's data.
export async function fetchCompetitionEvents(season: string): Promise<Map<number, Fixture[]>> {
  const lists = await Promise.all(
    COMPETITIONS.map(({ id }) =>
      request('eventsseason.php', { id, s: season })
        .then((r) => ((r.events ?? []) as any[]).map(toFixture))
        .catch(() => [] as Fixture[]),
    ),
  )
  return new Map(COMPETITIONS.map(({ id }, i) => [id, lists[i]]))
}

// A season "2025-2026" runs ~Jul 2025 → Jun 2026. Used to attribute rolling
// events (which include friendlies) to the selected season by date.
function seasonRange(season: string): [number, number] {
  const start = parseInt(season, 10)
  return [Date.UTC(start, 6, 1), Date.UTC(start + 1, 5, 30, 23, 59, 59)]
}

// Full season across every competition (league, cup, European) plus friendlies.
// Friendlies aren't reliably in eventsseason, so we fold in the team's rolling
// events that fall inside the season window and dedupe by id.
export async function fetchSeasonFixtures(
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const team = String(TEAM_ID)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(season))

  const rollingRaw = await Promise.all(
    [
      request('eventslast.php', { id: TEAM_ID }).then((r) => (r.results ?? r.events ?? []) as any[]),
      request('eventsnext.php', { id: TEAM_ID }).then((r) => (r.events ?? []) as any[]),
    ].map((p) => p.catch(() => [] as any[])),
  )

  const byId = new Map<string, Fixture>()
  for (const list of events.values())
    for (const f of list) if (f.home.id === team || f.away.id === team) byId.set(f.id, f)

  // Rolling events (all competitions incl. friendlies) within the season window.
  const [from, to] = seasonRange(season)
  for (const raw of rollingRaw)
    for (const x of raw) {
      const f = toFixture(x)
      if (byId.has(f.id) || (f.home.id !== team && f.away.id !== team)) continue
      const t = +new Date(f.date)
      if (t >= from && t <= to) byId.set(f.id, f)
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

// Builds a standings table from a set of finished matches. Used where
// TheSportsDB doesn't supply an official table (UEFA's Swiss-format single
// table) — real results, but tiebreakers are simplified (points → goal
// difference → goals scored) rather than UEFA's full tiebreak rules.
function computeStandingsFromFixtures(fixtures: Fixture[]): Standing[] {
  interface Row {
    team: Team
    played: number
    won: number
    drawn: number
    lost: number
    gf: number
    ga: number
    points: number
  }
  const rows = new Map<string, Row>()
  const row = (team: Team): Row => {
    let r = rows.get(team.id)
    if (!r) {
      r = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
      rows.set(team.id, r)
    }
    return r
  }

  for (const f of fixtures) {
    if (f.status !== 'finished' || f.homeScore === null || f.awayScore === null) continue
    const home = row(f.home)
    const away = row(f.away)
    home.played++
    away.played++
    home.gf += f.homeScore
    home.ga += f.awayScore
    away.gf += f.awayScore
    away.ga += f.homeScore
    if (f.homeScore > f.awayScore) {
      home.won++
      away.lost++
      home.points += 3
    } else if (f.homeScore < f.awayScore) {
      away.won++
      home.lost++
      away.points += 3
    } else {
      home.drawn++
      away.drawn++
      home.points++
      away.points++
    }
  }

  return [...rows.values()]
    .sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf)
    .map((r, i) => ({ rank: i + 1, ...r }))
}

export interface KnockoutStage {
  label: string
  fixtures: Fixture[]
}

export interface CompetitionStandings {
  competitionId: number
  competitionName: string
  source: 'official' | 'computed' | 'unavailable'
  standings: Standing[]
  knockout: KnockoutStage[]
  note?: string
}

// First season UEFA's club competitions used a single Swiss-format table
// instead of groups — a standalone table is only meaningful from here on.
const EURO_SINGLE_TABLE_FROM_YEAR = 2024

const TURKISH_CUP_ID = 4960

// eventsseason returns every stage of the competition together — qualifying
// rounds, the 8-match Swiss league phase, and the knockout rounds — all in one
// list. TheSportsDB codes the league-phase matchdays as intRound 1-8; every
// knockout/qualifying stage uses a distinct, larger code (16, 32, 125, 150,
// 200, 400, ...). Only the league-phase matches make up the single table.
function isLeaguePhase(f: Fixture): boolean {
  const round = Number(f.round)
  return Number.isFinite(round) && round >= 1 && round <= 8
}

// Maps TheSportsDB's knockout round codes to a human stage name. Verified
// live across both the pre-2024 group-stage era and the post-2024 Swiss
// format — the codes for the business end (Ro16 onward) are stable across
// both, but the play-off round before it uses a different code per era
// (160 pre-2024, 32 post-2024), so both are mapped defensively.
const KNOCKOUT_STAGE_LABELS: Record<string, string> = {
  '400': 'Qualifying',
  '160': 'Knockout Play-off',
  '32': 'Knockout Play-off',
  '16': 'Round of 16',
  '125': 'Quarter-final',
  '150': 'Semi-final',
  '200': 'Final',
}

// Resolves a fixture's round code into a human label appropriate to its
// competition: the Swiss-format league-phase matchday for UEFA competitions'
// rounds 1-8, a named knockout stage for UEFA/Turkish Cup knockout rounds, or
// a literal round number for anything else (domestic league, friendlies).
export function roundLabel(fixture: Fixture): string | undefined {
  const round = fixture.round
  // '0' consistently means "not set" in this data (seen on friendlies and on
  // at least one cup fixture that was clearly a later round) — never show it.
  if (!round || round === '0') return undefined

  if (fixture.competition.startsWith('UEFA ')) {
    const n = Number(round)
    if (Number.isFinite(n) && n >= 1 && n <= 8) return `Matchday ${round}`
    return KNOCKOUT_STAGE_LABELS[round] ?? 'Knockout stage'
  }

  if (fixture.competition === 'Turkish Cup') {
    if (KNOCKOUT_STAGE_LABELS[round]) return KNOCKOUT_STAGE_LABELS[round]
    if (/^\d+$/.test(round)) return `Round ${round}`
    return 'Knockout stage'
  }

  return `Round ${round}`
}

// Groups a team's own matches into knockout stages (Qualifying, Play-off,
// Round of 16, ...), ordered by when each stage was actually played.
function buildKnockoutStages(fixtures: Fixture[]): KnockoutStage[] {
  const byLabel = new Map<string, Fixture[]>()
  for (const f of fixtures) {
    const label = roundLabel(f) ?? 'Knockout stage'
    const list = byLabel.get(label) ?? []
    list.push(f)
    byLabel.set(label, list)
  }

  const stages = [...byLabel.entries()].map(([label, fixtures]) => {
    fixtures.sort((a, b) => +new Date(a.date) - +new Date(b.date))
    return { label, fixtures }
  })
  stages.sort((a, b) => +new Date(a.fixtures[0].date) - +new Date(b.fixtures[0].date))
  return stages
}

// One entry per competition Fenerbahçe actually played in the given season:
// the official Süper Lig table, a computed table for post-2024 UEFA
// competitions, or a short explanatory note where no table is possible
// (Turkish Cup is always a knockout; pre-2024 UEFA group stages can't be
// reconstructed from fixtures alone) — paired in both cases with Fenerbahçe's
// actual knockout-stage results, since those are real regardless of format era.
export async function fetchCompetitionTables(
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<CompetitionStandings[]> {
  const team = String(TEAM_ID)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(season))
  const seasonStartYear = parseInt(season, 10)
  const out: CompetitionStandings[] = []

  for (const { id, name } of COMPETITIONS) {
    const list = events.get(id) ?? []
    const own = list.filter((f) => f.home.id === team || f.away.id === team)
    if (!own.length) continue // Fenerbahçe didn't play this one this season

    if (id === LEAGUE_ID) {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'official',
        standings: await fetchStandings(season),
        knockout: [],
      })
      continue
    }

    if (id === TURKISH_CUP_ID) {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'unavailable',
        standings: [],
        knockout: buildKnockoutStages(own),
        note: 'Knockout competition — there is no league table.',
      })
      continue
    }

    const knockout = buildKnockoutStages(own.filter((f) => !isLeaguePhase(f)))

    if (Number.isFinite(seasonStartYear) && seasonStartYear >= EURO_SINGLE_TABLE_FROM_YEAR) {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'computed',
        standings: computeStandingsFromFixtures(list.filter(isLeaguePhase)),
        knockout,
        note: 'Computed from match results — not supplied by the data source. Tiebreakers are simplified (points, then goal difference, then goals scored) and may differ slightly from the official UEFA table.',
      })
    } else {
      out.push({
        competitionId: id,
        competitionName: name,
        source: 'unavailable',
        standings: [],
        knockout,
        note: 'Group-stage era — a single table isn’t available from this data source.',
      })
    }
  }

  return out
}

// ---- Squad (bio only, ~10 players on the free tier) ---------------------
// lookup_all_players.php mixes coaching staff into the roster (e.g. Ismail
// Kartal, Dirk Kuyt) with no real strPosition, so they'd otherwise fall
// through to the Midfielder default below. Filter them out by role instead.
const isCoachingStaff = (p?: string): boolean => {
  const s = (p ?? '').toLowerCase()
  return s.includes('coach') || s.includes('manager')
}

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
  const roster: any[] = (player ?? []).filter((p: any) => !isCoachingStaff(p.strPosition))
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
