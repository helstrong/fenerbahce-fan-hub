import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fetchNews } from './server/news.js'

// In development the Vite dev server proxies /api/sportsdb → TheSportsDB, adding
// the key from SPORTSDB_KEY (a plain env var, NOT VITE_-prefixed, so it is never
// exposed to the browser). Production does the same via server/index.js.
//
// /api/news isn't a simple pass-through (it fetches, parses and filters an RSS
// feed — see server/news.js), so it's wired up as dev middleware here, sharing
// the exact same logic the production Express server uses.
function newsDevMiddleware() {
  return {
    name: 'news-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/news', async (_req, res) => {
        try {
          const items = await fetchNews()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ items }))
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'news feed request failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' → load all vars, incl. non-VITE
  const key = env.SPORTSDB_KEY?.trim() || '123'
  const base = env.SPORTSDB_UPSTREAM?.trim() || 'https://www.thesportsdb.com'

  return {
    plugins: [react(), newsDevMiddleware()],
    server: {
      proxy: {
        '/api/sportsdb': {
          target: base,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/sportsdb/, `/api/v1/json/${key}`),
        },
      },
    },
  }
})
