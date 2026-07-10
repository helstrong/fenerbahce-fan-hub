// Production server: serves the built SPA (dist/) and proxies /api/sportsdb to
// TheSportsDB, injecting the API key from a server-side env var. The key is
// never sent to the browser — clients only ever call this same-origin path.
//
// Env:
//   SPORTSDB_KEY       TheSportsDB API key (server-side secret; defaults to "123")
//   SPORTSDB_UPSTREAM  Upstream base (default https://www.thesportsdb.com)
//   PORT               Port to listen on (default 3000)

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')

const KEY = (process.env.SPORTSDB_KEY || '123').trim()
const UPSTREAM = (process.env.SPORTSDB_UPSTREAM || 'https://www.thesportsdb.com').trim()
const PORT = Number(process.env.PORT || 3000)

// Only these v1 endpoints may be proxied — prevents the route being used as an
// open proxy to arbitrary paths.
const ALLOWED = new Set([
  'lookuptable.php',
  'eventslast.php',
  'eventsnext.php',
  'eventsseason.php',
  'lookup_all_players.php',
  'lookupteam.php',
  'lookupequipment.php',
])

// Small in-memory cache: cuts upstream calls and blunts quota abuse.
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map()

const app = express()
app.disable('x-powered-by')

// Keep the whole site out of search indexes (unofficial fan project). This
// header is authoritative and covers the SPA, assets, and API responses.
app.use((_req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow')
  next()
})

app.get('/api/sportsdb/:endpoint', async (req, res) => {
  const { endpoint } = req.params
  if (!ALLOWED.has(endpoint)) return res.status(404).json({ error: 'unknown endpoint' })

  const qs = new URLSearchParams(req.query).toString()
  const cacheKey = `${endpoint}?${qs}`

  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return res.json(hit.body)

  const url = `${UPSTREAM}/api/v1/json/${KEY}/${endpoint}${qs ? `?${qs}` : ''}`
  try {
    const upstream = await fetch(url)
    if (!upstream.ok) return res.status(upstream.status).json({ error: `upstream ${upstream.status}` })
    const body = await upstream.json()
    cache.set(cacheKey, { at: Date.now(), body })
    res.set('Cache-Control', 'public, max-age=600')
    res.json(body)
  } catch {
    res.status(502).json({ error: 'upstream request failed' })
  }
})

// Static assets, then SPA fallback for client-side routes.
app.use(express.static(dist, { index: false, maxAge: '1h' }))
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, () => {
  console.log(`fenerbahce-fan-hub listening on :${PORT} (key ${KEY === '123' ? 'FREE 123' : 'set'})`)
})
