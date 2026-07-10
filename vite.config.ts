import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// In development the Vite dev server proxies /api/sportsdb → TheSportsDB, adding
// the key from SPORTSDB_KEY (a plain env var, NOT VITE_-prefixed, so it is never
// exposed to the browser). Production does the same via server/index.js.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' → load all vars, incl. non-VITE
  const key = env.SPORTSDB_KEY?.trim() || '123'
  const base = env.SPORTSDB_UPSTREAM?.trim() || 'https://www.thesportsdb.com'

  return {
    plugins: [react()],
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
