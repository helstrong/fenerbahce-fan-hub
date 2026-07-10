import { CACHE_TTL_MS, FENER_ID, IS_FREE_KEY, USE_LIVE } from './config'
import {
  fetchClub,
  fetchFixtures,
  fetchKits,
  fetchPlayers,
  fetchSeasonFixtures,
  fetchStandings,
} from './theSportsDb'
import {
  club as sampleClub,
  fixtures as sampleFixtures,
  kits as sampleKits,
  players as samplePlayers,
  standings as sampleStandings,
} from './seed'
import type { AppData, Fixture, Standing } from './types'

// The single entry point every screen reads from. Swap the data source by
// toggling VITE_USE_SAMPLE in .env — the return shape (AppData) never changes.

export { FENER_ID, IS_FREE_KEY }

const CACHE_KEY = 'fener-fan-hub:data:v3'

function sampleData(): AppData {
  const byDateAsc = (a: Fixture, b: Fixture) => +new Date(a.date) - +new Date(b.date)
  const finished = [...sampleFixtures].filter((f) => f.status === 'finished').sort(byDateAsc)
  const upcoming = [...sampleFixtures].filter((f) => f.status !== 'finished').sort(byDateAsc)
  return {
    club: sampleClub,
    standings: sampleStandings,
    results: finished.reverse(),
    upcoming,
    players: samplePlayers,
    kits: sampleKits,
    live: false,
    warnings: [],
  }
}

function readCache(): AppData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > CACHE_TTL_MS) return null
    return v as AppData
  } catch {
    return null
  }
}

function writeCache(data: AppData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: data }))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export async function loadAll(force = false): Promise<AppData> {
  if (!USE_LIVE) return sampleData()

  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  const [club, standings, fixtures, players, kits] = await Promise.allSettled([
    fetchClub(),
    fetchStandings(),
    fetchFixtures(),
    fetchPlayers(),
    fetchKits(),
  ])

  const warnings: string[] = []
  if (standings.status === 'rejected')
    warnings.push(`Standings unavailable — ${String(standings.reason?.message ?? standings.reason)}`)
  if (fixtures.status === 'rejected')
    warnings.push(`Fixtures unavailable — ${String(fixtures.reason?.message ?? fixtures.reason)}`)
  if (players.status === 'rejected')
    warnings.push(`Squad unavailable — ${String(players.reason?.message ?? players.reason)}`)

  const data: AppData = {
    club: club.status === 'fulfilled' ? club.value : undefined,
    standings: standings.status === 'fulfilled' ? standings.value : [],
    results: fixtures.status === 'fulfilled' ? fixtures.value.results : [],
    upcoming: fixtures.status === 'fulfilled' ? fixtures.value.upcoming : [],
    players: players.status === 'fulfilled' ? players.value : [],
    kits: kits.status === 'fulfilled' ? kits.value : [],
    live: true,
    warnings,
  }

  // If nothing at all came back (provider down / rate-limited), fall back to the
  // bundled sample data so the app is never blank — but keep the warnings.
  if (!data.club && !data.standings.length && !data.results.length && !data.upcoming.length && !data.players.length)
    return { ...sampleData(), warnings: [...warnings, 'Live data unavailable — showing sample data.'] }

  writeCache(data)
  return data
}

// ---- season-scoped data (for the Table + Fixtures season selector) ------
// Independent of the once-loaded AppData: the Home dashboard stays on current
// rolling fixtures while these pages browse any season on demand.
export interface SeasonData {
  standings: Standing[]
  results: Fixture[]
  upcoming: Fixture[]
  warnings: string[]
}

export async function loadSeason(season: string): Promise<SeasonData> {
  if (!USE_LIVE) {
    const s = sampleData()
    return { standings: s.standings, results: s.results, upcoming: s.upcoming, warnings: [] }
  }

  const [standings, fixtures] = await Promise.allSettled([
    fetchStandings(season),
    fetchSeasonFixtures(season),
  ])

  const warnings: string[] = []
  if (standings.status === 'rejected')
    warnings.push(`Standings unavailable — ${String(standings.reason?.message ?? standings.reason)}`)
  if (fixtures.status === 'rejected')
    warnings.push(`Fixtures unavailable — ${String(fixtures.reason?.message ?? fixtures.reason)}`)

  return {
    standings: standings.status === 'fulfilled' ? standings.value : [],
    results: fixtures.status === 'fulfilled' ? fixtures.value.results : [],
    upcoming: fixtures.status === 'fulfilled' ? fixtures.value.upcoming : [],
    warnings,
  }
}

// ---- pure selectors -----------------------------------------------------
export const lastResult = (d: AppData): Fixture | undefined => d.results[0]
export const nextMatch = (d: AppData): Fixture | undefined => d.upcoming[0]
export const standingFor = (d: AppData, teamId: string) =>
  d.standings.find((s) => s.team.id === teamId)
