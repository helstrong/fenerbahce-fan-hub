// Runtime configuration for the live data source (TheSportsDB).
//
// The API key is NEVER referenced here — it lives server-side and is injected by
// the proxy (Vite dev server in development, the Node server in production). The
// browser only ever talks to the same-origin path below, so the key is never
// bundled into the client. See server/index.js and vite.config.ts.
//
// Set VITE_USE_SAMPLE=true to force the bundled sample data instead.

const env = import.meta.env

// Same-origin proxy path. The server rewrites this to TheSportsDB's v1 API and
// adds the key. Override only if you host the proxy elsewhere.
export const SPORTSDB_BASE = env.VITE_SPORTSDB_BASE?.trim() || '/api/sportsdb'

export const LEAGUE_ID = Number(env.VITE_LEAGUE_ID ?? 4339) // Turkish Süper Lig
export const TEAM_ID = Number(env.VITE_TEAM_ID ?? 133807) // Fenerbahçe
export const SEASON = env.VITE_SEASON?.trim() || '2025-2026' // format: YYYY-YYYY

export const USE_LIVE = env.VITE_USE_SAMPLE?.trim() !== 'true'

// Public flag (not the key) for whether the proxy uses the free "123" key, which
// caps the table (top 5), squad (~10) and fixtures. Set VITE_SPORTSDB_FREE_TIER=
// true when running on the free key so the UI can note the limits.
export const IS_FREE_KEY = env.VITE_SPORTSDB_FREE_TIER?.trim() === 'true'

// Highlight id must match the team id used by whichever source is active.
export const FENER_ID = USE_LIVE ? String(TEAM_ID) : 'fb'

// How long to cache a successful live fetch (protects the shared-key rate limit).
export const CACHE_TTL_MS = 60 * 60 * 1000
