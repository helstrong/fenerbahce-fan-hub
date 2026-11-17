import { SEASON, SPORTSDB_BASE } from './config'
import { countryTag } from './broadcasts'
import type { Competition, SportConfig } from './sports'
import type {
  BasketballPosition,
  Broadcast,
  ClubProfile,
  Fixture,
  FixtureStatus,
  Kit,
  Player,
  PlayerCareer,
  PlayerHonour,
  PlayerSpell,
  Position,
  Standing,
  Team,
} from './types'

// Thin client for TheSportsDB (https://www.thesportsdb.com/), JSON API v1.
// Each exported function maps a raw response into our own domain types so the
// rest of the app never sees the provider's shape.
//
// Every team- or league-scoped call takes a SportConfig (see ./sports), so the
// same code serves Fenerbahçe football and Fenerbahçe Beko basketball.
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
async function fetchOfficialTable(cfg: SportConfig, season: string): Promise<Standing[]> {
  const { table } = await request('lookuptable.php', { l: cfg.leagueId, s: season })
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

export interface LeagueTable {
  standings: Standing[]
  source: 'official' | 'computed'
  note?: string
}

const LEAGUE_COMPUTED_NOTE =
  'Computed from results — the published table hadn’t caught up with the latest matches yet. Tiebreakers are simplified (points, then goal difference, then goals scored) and may differ from the official table.'

const BASKETBALL_COMPUTED_NOTE =
  'Computed from regular-season results — the data source publishes no basketball tables. Ranked on wins, then point difference, then points scored; the official tiebreakers (head-to-head first) may order tied teams differently.'

// TheSportsDB recomputes lookuptable.php on its own schedule and can sit days
// behind the results it is already serving: after a matchday the table still
// shows the pre-match standings. Rather than show a table the app's own results
// contradict, compare the two and recompute from the fixtures when the
// published one is behind.
//
// Basketball has no published table at all, so it is always computed — and
// only from the regular season, since playoff series aren't table games.
export async function fetchLeagueTable(
  cfg: SportConfig,
  season: string = SEASON,
  leagueEvents?: Fixture[],
): Promise<LeagueTable> {
  if (!cfg.officialTable) {
    const events = leagueEvents ?? (await fetchSeasonEvents(cfg.leagueId, season))
    return {
      standings: computeStandingsFromFixtures(events.filter(isRegularSeason), cfg.scoring),
      source: 'computed',
      note: BASKETBALL_COMPUTED_NOTE,
    }
  }

  const [official, events] = await Promise.all([
    fetchOfficialTable(cfg, season).catch(() => [] as Standing[]),
    leagueEvents ? Promise.resolve(leagueEvents) : fetchSeasonEvents(cfg.leagueId, season),
  ])

  const computed = computeStandingsFromFixtures(events, cfg.scoring)
  if (!computed.length) return { standings: official, source: 'official' }
  if (!official.length) return { standings: computed, source: 'computed', note: LEAGUE_COMPUTED_NOTE }

  // Compared per team rather than in aggregate, so a table truncated by the
  // free tier (top 5 only) isn't mistaken for a stale one.
  const playedByTeam = new Map(computed.map((r) => [r.team.id, r.played]))
  const behind = official.some((o) => (playedByTeam.get(o.team.id) ?? 0) > o.played)

  return behind
    ? { standings: computed, source: 'computed', note: LEAGUE_COMPUTED_NOTE }
    : { standings: official, source: 'official' }
}

export async function fetchStandings(cfg: SportConfig, season: string = SEASON): Promise<Standing[]> {
  return (await fetchLeagueTable(cfg, season)).standings
}

// ---- Fixtures (rolling ~5 last + ~5 next on the free tier) ---------------

// TheSportsDB gives kick-off times in UTC but writes them without a timezone
// designator ("2026-08-30T18:30:00"). JavaScript reads a bare date-time as
// LOCAL time, so that 18:30 UTC kick-off rendered as 18:30 for a viewer in
// UTC+2 instead of 20:30 — and the countdown was wrong by the same offset.
// Marking it as UTC lets toLocaleString put it in whatever zone the viewer is
// actually in. (strTimeLocal exists but is local to the venue, not the viewer.)
function toUtcIso(x: any): string {
  const raw: string = x.strTimestamp || (x.dateEvent ? `${x.dateEvent}T${x.strTime || '00:00:00'}` : '')
  if (!raw) return ''
  const s = raw.trim().replace(' ', 'T')
  // Leave it alone if the feed ever does include a zone, so this can't double up.
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(s) ? s : `${s}Z`
}

function toFixture(x: any): Fixture {
  const homeScore = score(x.intHomeScore)
  const awayScore = score(x.intAwayScore)
  // "Match Finished" / "FT" or both scores present ⇒ finished; otherwise upcoming.
  const finished =
    /finished|ft|aet|pen/i.test(String(x.strStatus ?? '')) ||
    (homeScore !== null && awayScore !== null)
  const status: FixtureStatus = finished ? 'finished' : 'upcoming'
  const date = toUtcIso(x)
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

// Cancelled, postponed and abandoned games are dropped rather than shown:
// without a score they'd otherwise sit in "upcoming" forever with a date that
// has already passed (the EuroLeague feed has cancelled games in it).
const isCalledOff = (x: any): boolean => /^(canc|pst|postp|abd|aban)/i.test(String(x.strStatus ?? '').trim())

const toFixtures = (raw: any[]): Fixture[] => raw.filter((x) => !isCalledOff(x)).map(toFixture)

export async function fetchFixtures(cfg: SportConfig): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const [last, next] = await Promise.all([
    request('eventslast.php', { id: cfg.teamId }), // returns { results: [...] }
    request('eventsnext.php', { id: cfg.teamId }), // returns { events: [...] }
  ])

  const lastList = toFixtures(last.results ?? last.events ?? [])
  const nextList = toFixtures(next.events ?? [])

  // A game played today shows up in eventsnext marked finished (with its
  // score) before eventslast catches up with it. Taking finished games from
  // both lists means "Last result" updates when the game ends rather than
  // whenever the provider rebuilds eventslast.
  const finished = new Map<string, Fixture>()
  for (const f of [...lastList, ...nextList]) if (f.status === 'finished') finished.set(f.id, f)

  const results = [...finished.values()].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const upcoming = nextList
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  return { results, upcoming }
}

// Fetch every match of every candidate competition for a season, once. Shared
// by fetchSeasonFixtures (filters to our team) and fetchCompetitionTables
// (uses the full list to compute a table) so neither refetches the other's data.
// eventsseason returns the whole competition, not just our team's matches —
// the full list is what lets us compute a table where the provider has none.
async function fetchSeasonEvents(competitionId: number, season: string): Promise<Fixture[]> {
  return request('eventsseason.php', { id: competitionId, s: season })
    .then((r) => toFixtures(r.events ?? []))
    .catch(() => [] as Fixture[])
}

export async function fetchCompetitionEvents(cfg: SportConfig, season: string): Promise<Map<number, Fixture[]>> {
  const lists = await Promise.all(cfg.competitions.map(({ id }) => fetchSeasonEvents(id, season)))
  return new Map(cfg.competitions.map(({ id }, i) => [id, lists[i]]))
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
  cfg: SportConfig,
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const team = String(cfg.teamId)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(cfg, season))

  const rollingRaw = await Promise.all(
    [
      request('eventslast.php', { id: cfg.teamId }).then((r) => (r.results ?? r.events ?? []) as any[]),
      request('eventsnext.php', { id: cfg.teamId }).then((r) => (r.events ?? []) as any[]),
    ].map((p) => p.catch(() => [] as any[])),
  )

  const byId = new Map<string, Fixture>()
  for (const list of events.values())
    for (const f of list) if (f.home.id === team || f.away.id === team) byId.set(f.id, f)

  // Rolling events (all competitions incl. friendlies) within the season window.
  const [from, to] = seasonRange(season)
  for (const raw of rollingRaw)
    for (const f of toFixtures(raw)) {
      if (f.home.id !== team && f.away.id !== team) continue
      // The rolling lists pick up a final score sooner than the season list
      // does, so a finished copy replaces a still-"upcoming" one.
      const known = byId.get(f.id)
      if (known) {
        if (known.status !== 'finished' && f.status === 'finished') byId.set(f.id, f)
        continue
      }
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
// table, and every basketball table) — real results, but tiebreakers are
// simplified (points → goal difference → goals scored) rather than each
// competition's full tiebreak rules.
//
// Basketball has no draws and ranks on wins, so there a win is worth one
// "point" and `points` is simply the win count; ties then go to fewer losses
// (which only matters while teams have played different numbers of games).
function computeStandingsFromFixtures(
  fixtures: Fixture[],
  scoring: SportConfig['scoring'] = 'football',
): Standing[] {
  const winPoints = scoring === 'basketball' ? 1 : 3
  interface Row {
    team: Team
    played: number
    won: number
    drawn: number
    lost: number
    gf: number
    ga: number
    points: number
    // Kept with kick-off times so the form string can be ordered oldest →
    // newest, matching how TheSportsDB writes its own strForm.
    history: { at: number; result: 'W' | 'D' | 'L' }[]
  }
  const rows = new Map<string, Row>()
  const row = (team: Team): Row => {
    let r = rows.get(team.id)
    if (!r) {
      r = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, history: [] }
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
    const at = +new Date(f.date)
    if (f.homeScore > f.awayScore) {
      home.won++
      away.lost++
      home.points += winPoints
      home.history.push({ at, result: 'W' })
      away.history.push({ at, result: 'L' })
    } else if (f.homeScore < f.awayScore) {
      away.won++
      home.lost++
      away.points += winPoints
      home.history.push({ at, result: 'L' })
      away.history.push({ at, result: 'W' })
    } else {
      home.drawn++
      away.drawn++
      home.points++
      away.points++
      home.history.push({ at, result: 'D' })
      away.history.push({ at, result: 'D' })
    }
  }

  const formOf = (history: Row['history']) =>
    [...history]
      .sort((a, b) => a.at - b.at)
      .slice(-5)
      .map((h) => h.result)
      .join('') || undefined

  return [...rows.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        (scoring === 'basketball' ? a.lost - b.lost : 0) ||
        b.gf - b.ga - (a.gf - a.ga) ||
        b.gf - a.gf,
    )
    .map(({ history, ...r }, i) => ({ rank: i + 1, ...r, form: formOf(history) }))
}

export interface KnockoutStage {
  round: RoundRef
  fixtures: Fixture[]
}

export interface CompetitionStandings {
  competitionId: number
  competitionName: string
  source: 'official' | 'computed' | 'unavailable'
  standings: Standing[]
  knockout: KnockoutStage[]
  note?: string
  /** Positions to highlight in the table, and the translation key saying why. */
  topZone?: Competition['topZone']
  /**
   * Every match in this competition this season, not just Fenerbahçe's — the
   * same array already fetched to build the table, shared by reference so
   * expanding a table row can show that club's season without another request.
   */
  events: Fixture[]
}

// First season UEFA's club competitions used a single Swiss-format table
// instead of groups — a standalone table is only meaningful from here on.
const EURO_SINGLE_TABLE_FROM_YEAR = 2024

// eventsseason returns every stage of the competition together — qualifying
// rounds, the 8-match Swiss league phase, and the knockout rounds — all in one
// list. TheSportsDB codes the league-phase matchdays as intRound 1-8; every
// knockout/qualifying stage uses a distinct, larger code (16, 32, 125, 150,
// 200, 400, ...). Only the league-phase matches make up the single table.
function isLeaguePhase(f: Fixture): boolean {
  const round = Number(f.round)
  return Number.isFinite(round) && round >= 1 && round <= 8
}

// Basketball leagues number their regular season 1-30 (BSL) or 1-38
// (EuroLeague) and give every postseason stage a code of 125 or more, the same
// scheme the football knockouts use. Football's domestic league never reaches
// 100, so for it this is simply every match.
function isRegularSeason(f: Fixture): boolean {
  return !(Number(f.round) >= 100)
}

// Maps TheSportsDB's knockout round codes to a human stage name. Verified
// live across both the pre-2024 group-stage era and the post-2024 Swiss
// format — the codes for the business end (Ro16 onward) are stable across
// both, but the play-off round before it uses a different code per era
// (160 pre-2024, 32 post-2024), so both are mapped defensively.
// 170 and 180 only appear in basketball: the EuroLeague play-in's two rounds.
// A round resolves to a translation id plus an optional number, rather than to
// finished English text — the data layer has no access to the active language,
// so the UI does the wording (see lib/useRoundLabel).
export interface RoundRef {
  id:
    | 'matchday'
    | 'round'
    | 'qualifying'
    | 'playoff'
    | 'playin'
    | 'playoffs'
    | 'r16'
    | 'quarter'
    | 'semi'
    | 'final'
    | 'knockout'
  n?: string
}

const KNOCKOUT_STAGE_IDS: Record<string, RoundRef['id']> = {
  '400': 'qualifying',
  '160': 'playoff',
  '32': 'playoff',
  '16': 'r16',
  '125': 'quarter',
  '150': 'semi',
  '170': 'playin',
  '180': 'playin',
  '200': 'final',
}

// Resolves a fixture's round code into a human label appropriate to its
// competition: the Swiss-format league-phase matchday for UEFA competitions'
// rounds 1-8, a named knockout stage for cup and postseason rounds, or a
// literal round number for anything else (league rounds, friendlies).
export function roundRef(fixture: Fixture): RoundRef | undefined {
  const round = fixture.round
  // '0' consistently means "not set" in this data (seen on friendlies and on
  // at least one cup fixture that was clearly a later round) — never show it.
  if (!round || round === '0') return undefined

  if (fixture.competition.startsWith('UEFA ')) {
    const n = Number(round)
    if (Number.isFinite(n) && n >= 1 && n <= 8) return { id: 'matchday', n: round }
    return { id: KNOCKOUT_STAGE_IDS[round] ?? 'knockout' }
  }

  if (fixture.competition === 'Turkish Cup') {
    if (KNOCKOUT_STAGE_IDS[round]) return { id: KNOCKOUT_STAGE_IDS[round] }
    if (/^\d+$/.test(round)) return { id: 'round', n: round }
    return { id: 'knockout' }
  }

  // Basketball postseason. The EuroLeague's best-of-five round before the
  // Final Four is called "the Playoffs" rather than a quarter-final.
  if (Number(round) >= 100) {
    if (round === '125' && /euroleague/i.test(fixture.competition)) return { id: 'playoffs' }
    return { id: KNOCKOUT_STAGE_IDS[round] ?? 'knockout' }
  }

  return { id: 'round', n: round }
}

// Groups a team's own matches into knockout stages (Qualifying, Play-off,
// Round of 16, ...), ordered by when each stage was actually played.
function buildKnockoutStages(fixtures: Fixture[]): KnockoutStage[] {
  // Keyed by a composed id rather than by display text, so grouping no longer
  // depends on the label's wording.
  const byStage = new Map<string, KnockoutStage>()
  for (const f of fixtures) {
    const round = roundRef(f) ?? ({ id: 'knockout' } as RoundRef)
    const key = `${round.id}:${round.n ?? ''}`
    const stage = byStage.get(key) ?? { round, fixtures: [] }
    stage.fixtures.push(f)
    byStage.set(key, stage)
  }

  const stages = [...byStage.values()]
  for (const stage of stages) stage.fixtures.sort((a, b) => +new Date(a.date) - +new Date(b.date))
  stages.sort((a, b) => +new Date(a.fixtures[0].date) - +new Date(b.fixtures[0].date))
  return stages
}

// One entry per competition Fenerbahçe actually played in the given season:
// - league: the domestic table (official where published, otherwise computed)
//   plus any postseason run — basketball's playoffs;
// - cup: Fenerbahçe's knockout run, since there's no table;
// - uefa: a computed table for the post-2024 Swiss format, or a short note
//   where none is possible (pre-2024 group stages can't be reconstructed from
//   fixtures alone) — paired with Fenerbahçe's actual knockout results, since
//   those are real regardless of format era.
export async function fetchCompetitionTables(
  cfg: SportConfig,
  season: string = SEASON,
  eventsByCompetition?: Map<number, Fixture[]>,
): Promise<CompetitionStandings[]> {
  const team = String(cfg.teamId)
  const events = eventsByCompetition ?? (await fetchCompetitionEvents(cfg, season))
  const seasonStartYear = parseInt(season, 10)
  const out: CompetitionStandings[] = []

  for (const { id, name, format, topZone } of cfg.competitions) {
    const list = events.get(id) ?? []
    const own = list.filter((f) => f.home.id === team || f.away.id === team)
    if (!own.length) continue // Fenerbahçe didn't play this one this season

    const base = { competitionId: id, competitionName: name, events: list, topZone }

    if (format === 'league') {
      const regular = list.filter(isRegularSeason)
      const knockout = buildKnockoutStages(own.filter((f) => !isRegularSeason(f)))
      const table =
        id === cfg.leagueId
          ? // Reuses the season's events we already have rather than refetching them.
            await fetchLeagueTable(cfg, season, regular)
          : {
              standings: computeStandingsFromFixtures(regular, cfg.scoring),
              source: 'computed' as const,
              note: BASKETBALL_COMPUTED_NOTE,
            }
      out.push({ ...base, source: table.source, standings: table.standings, knockout, note: table.note })
      continue
    }

    if (format === 'cup') {
      out.push({
        ...base,
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
        ...base,
        source: 'computed',
        standings: computeStandingsFromFixtures(list.filter(isLeaguePhase), cfg.scoring),
        knockout,
        note: 'Computed from match results — not supplied by the data source. Tiebreakers are simplified (points, then goal difference, then goals scored) and may differ slightly from the official UEFA table.',
      })
    } else {
      out.push({
        ...base,
        source: 'unavailable',
        standings: [],
        knockout,
        note: 'Group-stage era — a single table isn’t available from this data source.',
      })
    }
  }

  return out
}

// ---- Head-to-head --------------------------------------------------------
// The fixture archive for these competitions only reaches back to about
// 2018-19 — earlier seasons return nothing at all — so there's no point
// spending requests on them. (The basketball league goes back a little
// further, but the EuroLeague doesn't, so one cut-off keeps the coverage note
// honest for both.)
const ARCHIVE_START_YEAR = 2018

export function archivedSeasons(from: string = SEASON): string[] {
  const start = parseInt(from, 10)
  if (!Number.isFinite(start)) return [from]
  const out: string[] = []
  for (let year = start; year >= ARCHIVE_START_YEAR; year--) out.push(`${year}-${year + 1}`)
  return out
}

// Every completed meeting between Fenerbahçe and one opponent in a given
// competition, newest first. One request per archived season; each is cached by
// the proxy, and a season that fails resolves to nothing rather than sinking
// the whole record.
export async function fetchHeadToHead(
  cfg: SportConfig,
  competitionId: number,
  opponentId: string,
): Promise<{ fixtures: Fixture[]; seasons: string[] }> {
  const team = String(cfg.teamId)
  const seasons = archivedSeasons()
  const lists = await Promise.all(seasons.map((s) => fetchSeasonEvents(competitionId, s)))

  const fixtures = lists
    .flat()
    .filter(
      (f) =>
        (f.home.id === team && f.away.id === opponentId) ||
        (f.away.id === team && f.home.id === opponentId),
    )
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return { fixtures, seasons }
}

// ---- TV listings ---------------------------------------------------------
// Sparse for this club (see data/broadcasts.ts), so this only ever supplements
// the curated rights table rather than standing on its own.
export async function fetchTvListings(eventId: string): Promise<Broadcast[]> {
  const { tvevent } = await request('lookuptv.php', { id: eventId })
  const rows: any[] = tvevent ?? []

  return rows
    .map((r) => ({
      country: clean(r.strCountry) ?? '',
      channel: clean(r.strChannel) ?? '',
      logo: clean(r.strLogo),
    }))
    .filter((r) => r.country && r.channel)
    .map((r) => ({ region: countryTag(r.country), channel: r.channel, logo: r.logo }))
}

// ---- Squad (bio only, ~10 players on the free tier) ---------------------
// lookup_all_players.php mixes coaching staff into the roster (e.g. Ismail
// Kartal, Dirk Kuyt) with no real strPosition, so they'd otherwise fall
// through to the Midfielder default below. Filter them out by role instead.
const isCoachingStaff = (p?: string): boolean => {
  const s = (p ?? '').toLowerCase()
  return s.includes('coach') || s.includes('manager')
}

const mapFootballPosition = (p?: string): Position => {
  const s = (p ?? '').toLowerCase()
  if (s.includes('keeper') || s.includes('goal')) return 'Goalkeeper'
  // Check midfield first: "Defensive Midfield" contains "defen" but is a midfielder.
  if (s.includes('midfield')) return 'Midfielder'
  if (s.includes('back') || s.includes('defen') || s.includes('centre-b')) return 'Defender'
  if (s.includes('forward') || s.includes('wing') || s.includes('strik') || s.includes('attack'))
    return 'Forward'
  return 'Midfielder'
}

// Basketball rosters list five positions (Point Guard, Shooting Guard, Small
// Forward, Power Forward, Center); the squad filters group them into three.
// Hybrid labels like "Guard-Forward" take whichever comes first.
const mapBasketballPosition = (p?: string): BasketballPosition => {
  const s = (p ?? '').toLowerCase()
  const at = (word: string) => {
    const i = s.indexOf(word)
    return i < 0 ? Infinity : i
  }
  const order: [BasketballPosition, number][] = [
    ['Guard', at('guard')],
    ['Forward', at('forward')],
    ['Center', Math.min(at('center'), at('centre'))],
  ]
  const [first] = order.sort((a, b) => a[1] - b[1])
  return first[1] === Infinity ? 'Forward' : first[0]
}

// Heights arrive in whatever format the contributor typed — "191 cm",
// "1.90 m (6 ft 3 in)", "6 ft 6 in (1.98 m)" — and the basketball roster mixes
// all three. Wherever there's a metric figure, show it the one way.
function metricHeight(raw?: string): string | undefined {
  if (!raw) return undefined
  const cm = raw.match(/(\d{3})\s*cm/i)
  if (cm) return `${cm[1]} cm`
  const m = raw.match(/(\d[.,]\d{1,2})\s*m\b/i)
  if (m) return `${Math.round(parseFloat(m[1].replace(',', '.')) * 100)} cm`
  return raw
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

export async function fetchPlayers(cfg: SportConfig): Promise<Player[]> {
  const { player } = await request('lookup_all_players.php', { id: cfg.teamId })
  const mapPosition = cfg.sport === 'basketball' ? mapBasketballPosition : mapFootballPosition
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
    height: metricHeight(clean(p.strHeight)),
    weight: clean(p.strWeight),
    birthplace: clean(p.strBirthLocation),
    signing: clean(p.strSigning),
    // Already present on the roster response, so the bio costs no extra request.
    description: clean(p.strDescriptionEN),
  }))
}

// Career history for one player, fetched only when a squad row is expanded.
// Honours are grouped by trophy so a serial winner reads as "Premier League ×3"
// rather than three near-identical rows. lookupcontracts is deliberately not
// used: it returns a single row that duplicates the former-teams data with an
// empty wage field, so it isn't worth a third request.
export async function fetchPlayerCareer(cfg: SportConfig, playerId: string): Promise<PlayerCareer> {
  const [honoursRes, formerRes] = await Promise.allSettled([
    request('lookuphonours.php', { id: playerId }),
    request('lookupformerteams.php', { id: playerId }),
  ])

  const honourRows: any[] =
    (honoursRes.status === 'fulfilled' ? honoursRes.value?.honours : null) ?? []
  const formerRows: any[] =
    (formerRes.status === 'fulfilled' ? formerRes.value?.formerteams : null) ?? []

  const grouped = new Map<string, PlayerHonour>()
  for (const h of honourRows) {
    const honour = clean(h.strHonour)
    if (!honour) continue
    const key = `${honour}|${clean(h.strTeam) ?? ''}`
    const entry = grouped.get(key) ?? { honour, team: clean(h.strTeam), seasons: [] }
    const season = clean(h.strSeason)
    if (season && !entry.seasons.includes(season)) entry.seasons.push(season)
    grouped.set(key, entry)
  }

  const honours = [...grouped.values()]
    .map((h) => ({ ...h, seasons: h.seasons.sort() }))
    .sort((a, b) => b.seasons.length - a.seasons.length || a.honour.localeCompare(b.honour))

  const spells: PlayerSpell[] = formerRows
    .map((f) => ({
      team: (clean(f.strFormerTeam) ?? '').trim(),
      badge: clean(f.strBadge),
      joined: clean(f.strJoined),
      departed: clean(f.strDeparted),
      appearances: f.intAppearances != null ? num(f.intAppearances) : undefined,
      // A goal tally means nothing for a basketball career, so it's dropped
      // there rather than shown as a column of zeros.
      goals: cfg.sport === 'football' && f.intGoals != null ? num(f.intGoals) : undefined,
    }))
    .filter((s) => s.team)
    // Most recent spell first.
    .sort((a, b) => Number(b.joined ?? 0) - Number(a.joined ?? 0))

  return { spells, honours }
}

// ---- Club profile -------------------------------------------------------
export async function fetchClub(cfg: SportConfig): Promise<ClubProfile> {
  const { teams } = await request('lookupteam.php', { id: cfg.teamId })
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
export async function fetchKits(cfg: SportConfig): Promise<Kit[]> {
  const { equipment } = await request('lookupequipment.php', { id: cfg.teamId })
  const rows: any[] = equipment ?? []
  return rows
    .map((e) => ({
      season: clean(e.strSeason) ?? '',
      type: clean(e.strType) ?? '',
      image: clean(e.strEquipment) ?? '',
    }))
    .filter((k) => k.image)
}
