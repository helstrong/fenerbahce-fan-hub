# Fenerbahçe Fan Hub

A responsive web app for Fenerbahçe SK fans to track results, fixtures, the league
table, squad and club profile — all in one place, in club colours (navy `#00285E`
& yellow `#FFED00`).

Built with **React + Vite + TypeScript + Tailwind CSS**.

> ℹ️ **Data source.** Football data (results, fixtures, table, squad) comes from
> **[TheSportsDB](https://www.thesportsdb.com/)** and is **live out of the box** — no
> account or key required. See [Live data](#live-data) for configuration and the
> free-tier limits.

## Features

- **Home dashboard** — league position, last result, next match, mini table (with crests), and Fenerbahçe's last-5 form & record
- **Fixtures & Results** — upcoming/results tabs with club crests, round, venue and win/draw/loss markers
- **Süper Lig table** — standings with crests and a last-5 form guide, Fenerbahçe highlighted
- **Squad** — filter by position; player photos and bio (foot, height, birthplace, signing)
- **Club** — profile, stadium & capacity, competitions, official links, fan art and kits
- Fully responsive (mobile bottom-tab nav, desktop top nav) and keyboard-navigable

## Getting started

Requires Node.js 18+.

```bash
npm install       # install dependencies
cp .env.example .env   # then set SPORTSDB_KEY (optional; defaults to the free "123")
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build into dist/
npm start         # run the production server (serves dist/ + the API proxy)
```

The API key is a **server-side** value (`SPORTSDB_KEY`, no `VITE_` prefix), so it is
never bundled into the browser. In dev the Vite proxy injects it; in production the
Node server does. The browser only ever calls the same-origin path `/api/sportsdb/…`.

## Project structure

```
src/
  components/   Layout, Crest, TeamBadge, FormGuide, MatchCard, Card, Icon, StatusView
  data/         types.ts       shared domain types (incl. AppData)
                config.ts      env-driven runtime config
                seed.ts        sample data (fallback)
                theSportsDb.ts TheSportsDB client + response mappers
                api.ts         loadAll() + caching + selectors (single entry point)
                DataContext.tsx React provider: load once, expose {state, refresh}
  lib/          formatting helpers
  pages/        Home, Fixtures, Standings, Squad, Club
server/         index.js — prod server: serves dist/ + /api/sportsdb key-injecting proxy
Dockerfile      multi-stage build → single container (build SPA, serve + proxy)
```

Data flow: `DataProvider` calls `loadAll()` once on mount → most pages receive the
resulting `AppData` as a prop; the Table/Fixtures pages additionally browse any season
via `SeasonContext`. All network calls go through the same-origin `/api/sportsdb` proxy.

## Live data

The app pulls **live data from [TheSportsDB](https://www.thesportsdb.com/) by default**,
using their free shared test key (`123`) — so `npm run dev` shows real standings,
results and fixtures with **no account or setup**. The header badge reads **“Live data.”**

To force the bundled sample data instead, copy the env template and set the flag:

```bash
cp .env.example .env
# edit .env and set VITE_USE_SAMPLE=true
```

**Config** (all optional, defaults in `.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `SPORTSDB_KEY` | `123` | **Server-side** TheSportsDB key (never sent to the browser). `123` = free tier; a premium key removes limits. |
| `SPORTSDB_UPSTREAM` | `https://www.thesportsdb.com` | Upstream host (server-side). |
| `PORT` | `3000` | Port the production server listens on. |
| `VITE_SPORTSDB_FREE_TIER` | `false` | Set `true` when using the free key so the UI shows tier-limit notes. |
| `VITE_USE_SAMPLE` | — | Set `true` to force sample data. |
| `VITE_LEAGUE_ID` | `4339` | Turkish Süper Lig |
| `VITE_SEASON` | `2025-2026` | Season, `YYYY-YYYY` format |
| `VITE_TEAM_ID` | `133807` | Fenerbahçe |

Free-tier notes & limitations (the app surfaces everything the free tier offers and
labels these caps rather than faking data):

- **Table shows the top 5 only** — the free `lookuptable` endpoint returns just the top
  of the standings (Fenerbahçe included).
- **Fixtures are a rolling window** of the ~5 most recent results and ~5 next matches
  (from `eventslast`/`eventsnext`), not the full season schedule.
- **Squad is a partial roster (~10 players) with bio only** — no per-season match stats
  (goals/assists/appearances); the Squad page shows photos and profile info instead.
- The shared `123` key is **rate-limited**. Responses are cached in `localStorage` for
  one hour; the header refresh button forces a fresh fetch. If a fetch fails entirely,
  the app falls back to sample data with a warning.
- Verify `VITE_LEAGUE_ID` / `VITE_TEAM_ID` on thesportsdb.com if the defaults change.
- **Security:** the key lives only in `SPORTSDB_KEY` (server-side) and is injected by the
  proxy, so it is never in the browser bundle. `VITE_`-prefixed vars *are* bundled, so
  keep secrets out of them.

## Deployment (Coolify / Docker)

The app deploys as a **single container** that both serves the built SPA and runs the
key-injecting proxy — nothing calls TheSportsDB directly from the browser.

In Coolify:

1. **New Resource → Application**, point it at this GitHub repo (branch of your choice).
2. **Build pack: Dockerfile** (the included multi-stage `Dockerfile` builds the SPA and
   produces a small runtime image). Coolify auto-detects it.
3. **Environment variables** — set the secret (Coolify keeps it server-side; it is *not*
   a `VITE_` var, so it never reaches the client):
   ```
   SPORTSDB_KEY=your_premium_key
   ```
   Optionally `PORT` (defaults to `3000`) and any `VITE_*` public overrides. Note: `VITE_*`
   values are baked in at **build time**, so change them → redeploy.
4. **Port:** the container listens on `3000` (`EXPOSE 3000`); set Coolify's port mapping to
   match and enable HTTPS on your domain.
5. Deploy. Coolify builds the image and serves it; the browser only ever hits
   `/api/sportsdb/…` on your domain.

Run the production image locally to sanity-check:

```bash
npm run build
SPORTSDB_KEY=your_key npm start   # http://localhost:3000
# or:  docker build -t fener . && docker run -p 3000:3000 -e SPORTSDB_KEY=your_key fener
```

**Note on public exposure:** a public proxy lets anyone using your site consume your
key's quota (they still never see the key). The server caches upstream responses for
10 minutes to blunt this; add rate-limiting in front (Coolify/Cloudflare) if needed.

## Branding note

The crest in this project is an **unofficial, stylised fan mark** (navy/yellow with
the 1907 founding year), not the official Fenerbahçe SK emblem, which is a registered
trademark. This is a personal/educational fan project and is not affiliated with or
endorsed by the club.

For this reason the site is **excluded from search indexes** — via an `X-Robots-Tag:
noindex` response header (authoritative), a `<meta name="robots" content="noindex">`
tag, and `robots.txt`. If the site were ever already indexed and you wanted it removed,
temporarily relax the `robots.txt` block so crawlers can see the `noindex` signal.

## Licence

Personal/educational use.
