import { API_BASE, API_KEY, LEAGUE_ID, SEASON, TEAM_ID } from './config'
import type { Fixture, FixtureStatus, Player, Position, Standing, Team } from './types'

// Thin client for API-Football (https://www.api-football.com/), v3.
// Each exported function maps a raw response into our own domain types so the
// rest of the app never sees the provider's shape.

interface ApiResult {
  response: any[]
  paging?: { current: number; total: number }
  errors: unknown
}

async function request(path: string, params: Record<string, string | number>): Promise<ApiResult> {
  const url = new URL(`${API_BASE}/${path}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))

  const res = await fetch(url.toString(), { headers: { 'x-apisports-key': API_KEY ?? '' } })
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)

  const json = (await res.json()) as ApiResult
  const errs = json.errors
  const hasErrors = Array.isArray(errs) ? errs.length > 0 : !!errs && Object.keys(errs).length > 0
  if (hasErrors) throw new Error(`${path}: ${JSON.stringify(errs)}`)

  return json
}

const shortCode = (name: string) => name.replace(/[^\p{L}]/gu, '').slice(0, 3).toUpperCase() || '???'

const toTeam = (t: any): Team => ({ id: String(t.id), name: t.name, short: shortCode(t.name) })

// ---- Standings ----------------------------------------------------------
export async function fetchStandings(): Promise<Standing[]> {
  const { response } = await request('standings', { league: LEAGUE_ID, season: SEASON })
  const table: any[] = response?.[0]?.league?.standings?.[0] ?? []
  return table.map((r) => ({
    rank: r.rank,
    team: toTeam(r.team),
    played: r.all.played,
    won: r.all.win,
    drawn: r.all.draw,
    lost: r.all.lose,
    gf: r.all.goals.for,
    ga: r.all.goals.against,
    points: r.points,
  }))
}

// ---- Fixtures -----------------------------------------------------------
const FINISHED = new Set(['FT', 'AET', 'PEN'])
const LIVE = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'])

function toFixture(x: any): Fixture {
  const short = x.fixture.status.short as string
  const status: FixtureStatus = FINISHED.has(short) ? 'finished' : LIVE.has(short) ? 'live' : 'upcoming'
  return {
    id: String(x.fixture.id),
    competition: x.league.name,
    date: x.fixture.date,
    home: toTeam(x.teams.home),
    away: toTeam(x.teams.away),
    homeScore: x.goals.home,
    awayScore: x.goals.away,
    status,
    venue: x.fixture.venue?.name ?? '',
  }
}

export async function fetchFixtures(): Promise<{ results: Fixture[]; upcoming: Fixture[] }> {
  const { response } = await request('fixtures', { team: TEAM_ID, season: SEASON })
  const all = response.map(toFixture)
  const results = all
    .filter((f) => f.status === 'finished')
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const upcoming = all
    .filter((f) => f.status !== 'finished')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  return { results, upcoming }
}

// ---- Squad + player stats ----------------------------------------------
const mapPosition = (p?: string): Position => {
  switch (p) {
    case 'Goalkeeper':
      return 'Goalkeeper'
    case 'Defender':
      return 'Defender'
    case 'Attacker':
      return 'Forward'
    default:
      return 'Midfielder'
  }
}

async function fetchPlayerStats(): Promise<Map<number, any>> {
  const byId = new Map<number, any>()
  const collect = (rows: any[]) => rows.forEach((r) => byId.set(r.player.id, r))

  const first = await request('players', { team: TEAM_ID, season: SEASON, page: 1 })
  collect(first.response)

  const totalPages = Math.min(first.paging?.total ?? 1, 3)
  for (let page = 2; page <= totalPages; page++) {
    const next = await request('players', { team: TEAM_ID, season: SEASON, page })
    collect(next.response)
  }
  return byId
}

export async function fetchPlayers(): Promise<Player[]> {
  const [squad, statsById] = await Promise.all([
    request('players/squads', { team: TEAM_ID }),
    fetchPlayerStats(),
  ])

  const roster: any[] = squad.response?.[0]?.players ?? []
  return roster.map((p) => {
    const stat = statsById.get(p.id)
    const s = stat?.statistics?.[0]
    return {
      id: String(p.id),
      name: p.name,
      number: p.number ?? s?.games?.number ?? 0,
      position: mapPosition(p.position),
      nationality: stat?.player?.nationality ?? '',
      age: p.age ?? stat?.player?.age ?? 0,
      appearances: s?.games?.appearences ?? 0,
      goals: s?.goals?.total ?? 0,
      assists: s?.goals?.assists ?? 0,
    }
  })
}
