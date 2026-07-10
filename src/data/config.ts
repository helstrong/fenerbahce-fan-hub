// Runtime configuration for the live data source (TheSportsDB).
//
// TheSportsDB's free JSON API works with the shared test key "123" and needs no
// account, so the app runs on LIVE data out of the box. The trade-offs of the
// free tier: it is rate-limited, fixtures are a rolling ~5-match window rather
// than the full season, and player endpoints carry bio data only (no stats).
//
// Set VITE_USE_SAMPLE=true to force the bundled sample data instead.

const env = import.meta.env

export const SPORTSDB_KEY = env.VITE_SPORTSDB_KEY?.trim() || '123' // free shared test key
export const SPORTSDB_BASE =
  env.VITE_SPORTSDB_BASE?.trim() || 'https://www.thesportsdb.com/api/v1/json'

export const LEAGUE_ID = Number(env.VITE_LEAGUE_ID ?? 4339) // Turkish Süper Lig
export const TEAM_ID = Number(env.VITE_TEAM_ID ?? 133807) // Fenerbahçe
export const SEASON = env.VITE_SEASON?.trim() || '2025-2026' // format: YYYY-YYYY

export const USE_LIVE = env.VITE_USE_SAMPLE?.trim() !== 'true'

// True when running on the shared free test key, which caps the table (top 5),
// the squad (~10 players) and fixtures. A premium key removes these limits.
export const IS_FREE_KEY = SPORTSDB_KEY === '123'

// Highlight id must match the team id used by whichever source is active.
export const FENER_ID = USE_LIVE ? String(TEAM_ID) : 'fb'

// How long to cache a successful live fetch (protects the shared-key rate limit).
export const CACHE_TTL_MS = 60 * 60 * 1000
