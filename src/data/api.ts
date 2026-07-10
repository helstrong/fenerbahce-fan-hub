import { fetchFixtures, fetchPlayers, fetchStandings } from './apiFootball'
import { CACHE_TTL_MS, FENER_ID, USE_LIVE } from './config'
import {
  fixtures as sampleFixtures,
  news as sampleNews,
  players as samplePlayers,
  standings as sampleStandings,
} from './seed'
import type { AppData, Fixture, Player } from './types'

// The single entry point every screen reads from. Swap the data source by
// toggling the API key in .env — the return shape (AppData) never changes.

export { FENER_ID }

const CACHE_KEY = 'fener-fan-hub:data:v1'

function sampleData(): AppData {
  const byDateAsc = (a: Fixture, b: Fixture) => +new Date(a.date) - +new Date(b.date)
  const finished = [...sampleFixtures].filter((f) => f.status === 'finished').sort(byDateAsc)
  const upcoming = [...sampleFixtures].filter((f) => f.status !== 'finished').sort(byDateAsc)
  return {
    standings: sampleStandings,
    results: finished.reverse(),
    upcoming,
    players: samplePlayers,
    news: sampleNews,
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

  const [standings, fixtures, players] = await Promise.allSettled([
    fetchStandings(),
    fetchFixtures(),
    fetchPlayers(),
  ])

  const warnings: string[] = []
  if (standings.status === 'rejected')
    warnings.push(`Standings unavailable — ${String(standings.reason?.message ?? standings.reason)}`)
  if (fixtures.status === 'rejected')
    warnings.push(`Fixtures unavailable — ${String(fixtures.reason?.message ?? fixtures.reason)}`)
  if (players.status === 'rejected')
    warnings.push(`Squad unavailable — ${String(players.reason?.message ?? players.reason)}`)

  const data: AppData = {
    standings: standings.status === 'fulfilled' ? standings.value : [],
    results: fixtures.status === 'fulfilled' ? fixtures.value.results : [],
    upcoming: fixtures.status === 'fulfilled' ? fixtures.value.upcoming : [],
    players: players.status === 'fulfilled' ? players.value : [],
    news: sampleNews, // football APIs carry no news — still sample content
    live: true,
    warnings,
  }

  if (data.standings.length || data.results.length || data.players.length) writeCache(data)
  return data
}

// ---- pure selectors -----------------------------------------------------
export const lastResult = (d: AppData): Fixture | undefined => d.results[0]
export const nextMatch = (d: AppData): Fixture | undefined => d.upcoming[0]
export const topScorers = (d: AppData, n = 5): Player[] =>
  [...d.players].sort((a, b) => b.goals - a.goals).slice(0, n)
export const standingFor = (d: AppData, teamId: string) =>
  d.standings.find((s) => s.team.id === teamId)
