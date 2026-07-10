import { fixtures, standings, players, news, FENER_ID } from './seed'
import type { Fixture, NewsItem, Player, Standing } from './types'

// ---------------------------------------------------------------------------
// Data access layer. Every page reads through these functions, so swapping the
// sample data for a live source (e.g. API-Football) only means changing the
// bodies here — the components never touch the raw data or the network.
// ---------------------------------------------------------------------------

const byDateAsc = (a: Fixture, b: Fixture) => +new Date(a.date) - +new Date(b.date)

export const getFixtures = (): Fixture[] => [...fixtures].sort(byDateAsc)

export const getResults = (): Fixture[] =>
  getFixtures().filter((f) => f.status === 'finished').reverse()

export const getUpcoming = (): Fixture[] =>
  getFixtures().filter((f) => f.status !== 'finished')

export const getLastResult = (): Fixture | undefined => getResults()[0]

export const getNextMatch = (): Fixture | undefined => getUpcoming()[0]

export const getStandings = (): Standing[] => standings

export const getPlayers = (): Player[] => players

export const getTopScorers = (n = 5): Player[] =>
  [...players].sort((a, b) => b.goals - a.goals).slice(0, n)

export const getNews = (): NewsItem[] =>
  [...news].sort((a, b) => +new Date(b.date) - +new Date(a.date))

export { FENER_ID }
