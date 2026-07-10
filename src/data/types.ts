export type FixtureStatus = 'finished' | 'upcoming' | 'live'

export interface Team {
  id: string
  name: string
  short: string
}

export interface Fixture {
  id: string
  competition: string
  date: string // ISO date-time
  home: Team
  away: Team
  homeScore: number | null
  awayScore: number | null
  status: FixtureStatus
  venue: string
}

export interface Standing {
  rank: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  points: number
}

export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'

export interface Player {
  id: string
  name: string
  number: number
  position: Position
  nationality: string
  age: number
  appearances: number
  goals: number
  assists: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  date: string
  category: string
}

// Everything the UI needs for one render, loaded together at app start.
export interface AppData {
  standings: Standing[]
  results: Fixture[]
  upcoming: Fixture[]
  players: Player[]
  news: NewsItem[]
  live: boolean
  warnings: string[]
}
