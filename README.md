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
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build into dist/
npm run preview   # preview the production build
```

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
```

Data flow: `DataProvider` calls `loadAll()` once on mount → each page receives the
resulting `AppData` as a prop. Nothing else touches the network.

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
| `VITE_SPORTSDB_KEY` | `123` | TheSportsDB key. `123` is the free shared test key; a personal key (via their Patreon) raises rate limits. |
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
- **Security:** `VITE_` vars are bundled into the browser, so any personal key ships to
  the client. Fine for local/personal use — for a public deployment, proxy requests
  through a small server function instead of exposing the key.

## Branding note

The crest in this project is an **unofficial, stylised fan mark** (navy/yellow with
the 1907 founding year), not the official Fenerbahçe SK emblem, which is a registered
trademark. This is a personal/educational fan project and is not affiliated with or
endorsed by the club.

## Licence

Personal/educational use.
