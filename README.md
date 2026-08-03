# Fenerbahçe Fan Hub

A responsive web app for Fenerbahçe SK fans to track results, fixtures, the league
table, squad and club profile — all in one place, in club colours (navy `#00285E`
& yellow `#FFED00`).

Built with **React + Vite + TypeScript + Tailwind CSS**.

> ℹ️ **Data source.** Football data (results, fixtures, table, squad) comes from
> **[TheSportsDB](https://www.thesportsdb.com/)** and is **live out of the box** — no
> account or key required. News is a curated, trusted-source-filtered feed from Google
> News. See [Live data](#live-data) and [News](#news) for details.

## Features

- **Home dashboard** — league position, last result, next match, mini table (with crests), Fenerbahçe's last-5 form & record, and a latest-news preview
- **Fixtures & Results** — upcoming/results tabs with club crests, round, venue and win/draw/loss markers
- **Tables** — a table per competition Fenerbahçe plays each season (Süper Lig, Turkish Cup, UEFA competitions), with crests, a last-5 form guide, and knockout-stage results where there's no single table
- **Squad** — filter by position; player photos and bio (foot, height, birthplace, signing)
- **Club** — profile, stadium & capacity, competitions, official links, fan art and kits
- **News** — curated Fenerbahçe football news from a small set of trusted outlets
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
                news.ts        client for /api/news
                api.ts         loadAll() + caching + selectors (single entry point)
                DataContext.tsx React provider: load once, expose {state, refresh}
  lib/          formatting helpers
  pages/        Home, Fixtures, Standings, Squad, Club, News
server/         index.js — prod server: serves dist/ + /api/sportsdb proxy + /api/news
                news.js  — fetch/parse/filter Google News RSS (shared with the dev server)
Dockerfile      multi-stage build → single container (build SPA, serve + proxy)
```

Data flow: `DataProvider` calls `loadAll()` once on mount → most pages receive the
resulting `AppData` as a prop; the Table/Fixtures pages additionally browse any season
via `SeasonContext`. All network calls go through the same-origin `/api/sportsdb` and
`/api/news` routes.

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

## News

The News page and Home's "Latest news" preview pull from **Google News RSS**,
searched for Fenerbahçe football content, fetched **server-side** (`server/news.js`)
and filtered to a small curated allowlist of trusted outlets before being served from
`/api/news`. No API key or account needed.

- **Fetched server-side, not from the browser.** This avoids the CORS restrictions that
  block a browser from calling Google News RSS directly, and keeps the trusted-source
  filter somewhere it can't be bypassed by a modified client. In dev, Vite runs the same
  logic via a custom middleware (`vite.config.ts`); in production, the Express server
  serves it (`server/index.js`).
- **Trusted-source allowlist is an editorial judgment call, not automated scoring** —
  see the `TRUSTED_SOURCES` list in `server/news.js`. Add or remove outlets there;
  matching is case-insensitive against the RSS `<source>` field.
- **Google News RSS is a free, undocumented interface**, not a published API with a
  support contract — it could change or be blocked by Google without notice. This is
  the standard low-risk pattern for small, non-commercial news aggregation; it is not
  a guarantee of uptime. Responses are cached for 15 minutes.
- Results are scoped to football (the search query includes "football") since
  Fenerbahçe is a multi-sport club and an unscoped search pulls in basketball/volleyball
  coverage too.
- Not affiliated with or endorsed by Fenerbahçe SK; article content belongs to its
  original publishers.

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

## Changelog

- **2026-08-03** — Knockout-stage results for cup & European ties: Turkish Cup and
  UEFA competitions now show Fenerbahçe's actual run through the rounds (Qualifying,
  Play-off, Round of 16, Quarter-final, Semi-final, Final) instead of just a
  "no table" note. (`65f13ef`)
- **2026-08-03** — Season and competition filters on the Home dashboard's Table card,
  matching the full Table page. (`1ce7da3`)
- **2026-08-03** — Tables for every competition Fenerbahçe plays each season (Süper Lig,
  Turkish Cup, UEFA competitions), not just the domestic league. (`72b7ac7`)
- **2026-07-11** — Official club crest in the header. (`f7facf7`)
- **2026-07-11** — Redesigned Home hero: crest + stats row layout. (`adcc9c0`)
- **2026-07-11** — Production deployment: same-origin API proxy keeps the TheSportsDB
  key server-side, Docker/Coolify support, search-engine no-index. (`6746b20`)
- **2026-07-11** — Switched the live data source to TheSportsDB — works directly from
  the browser with no backend, plus a club profile page, season browsing, real team
  crests and squad photos. (`87eda8d`)
- **2026-07-10** — Live data via API-Football, with a sample-data fallback. (`709ba8e`)
- **2026-07-10** — Initial MVP: dashboard, fixtures, table, squad, news. (`85b31f6`)

## Licence

Personal/educational use.
