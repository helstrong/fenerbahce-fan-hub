// Runtime configuration for the live data source (API-Football).
// All values are optional env vars — with no API key the app uses sample data.
//
// Free-tier API-Football plans are limited to seasons 2021–2023, so the default
// season is 2023 (the 2023–24 campaign). For the current season and live
// upcoming fixtures you need a paid plan and VITE_SEASON set accordingly.

const env = import.meta.env

export const API_KEY = env.VITE_API_FOOTBALL_KEY?.trim() || undefined
export const API_BASE = env.VITE_API_FOOTBALL_BASE?.trim() || 'https://v3.football.api-sports.io'
export const LEAGUE_ID = Number(env.VITE_LEAGUE_ID ?? 203) // Süper Lig
export const SEASON = Number(env.VITE_SEASON ?? 2023)
export const TEAM_ID = Number(env.VITE_TEAM_ID ?? 611) // Fenerbahçe

export const USE_LIVE = Boolean(API_KEY)

// Highlight id must match the team id used by whichever source is active.
export const FENER_ID = USE_LIVE ? String(TEAM_ID) : 'fb'

// How long to cache a successful live fetch (protects the daily quota).
export const CACHE_TTL_MS = 60 * 60 * 1000
