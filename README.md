# Fenerbahçe Fan Hub

A responsive web app for Fenerbahçe SK fans to track results, fixtures, the league
table, squad stats and club news — all in one place, in club colours (navy `#00285E`
& yellow `#FFED00`).

Built with **React + Vite + TypeScript + Tailwind CSS**.

> ℹ️ **Data source.** Football data (results, fixtures, table, squad stats) comes from
> **API-Football** when a key is configured, and falls back to *sample* data otherwise.
> News is always sample content (football APIs don't carry news). See
> [Live data](#live-data) to switch it on.

## Features

- **Home dashboard** — league position, last result, next match, mini table, top scorers, latest news
- **Fixtures & Results** — upcoming/results tabs with win/draw/loss markers
- **Süper Lig table** — full standings with Fenerbahçe highlighted
- **Squad & player stats** — filter by position; appearances, goals, assists
- **News** — categorised club news feed
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
  components/   Layout, Crest, MatchCard, Card, Icon, StatusView
  data/         types.ts       shared domain types (incl. AppData)
                config.ts      env-driven runtime config
                seed.ts        sample data (fallback)
                apiFootball.ts API-Football client + response mappers
                api.ts         loadAll() + caching + selectors (single entry point)
                DataContext.tsx React provider: load once, expose {state, refresh}
  lib/          formatting helpers
  pages/        Home, Fixtures, Standings, Squad, News
```

Data flow: `DataProvider` calls `loadAll()` once on mount → each page receives the
resulting `AppData` as a prop. Nothing else touches the network.

## Live data

The app runs on sample data out of the box. To pull real Fenerbahçe data:

1. Create a free account at **[API-Football](https://www.api-football.com/)** and copy your API key.
2. Copy the env template and paste your key:
   ```bash
   cp .env.example .env
   # edit .env and set VITE_API_FOOTBALL_KEY=your_key
   ```
3. Restart the dev server (`npm run dev`). The header badge switches to **“Live data.”**

**Config** (all optional, defaults in `.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_FOOTBALL_KEY` | — | Your key. Empty = sample data. |
| `VITE_LEAGUE_ID` | `203` | Süper Lig |
| `VITE_SEASON` | `2023` | Season start year |
| `VITE_TEAM_ID` | `611` | Fenerbahçe |

Notes & limitations:

- **Free tier covers seasons 2021–2023 only.** So the default season is `2023`
  (the 2023–24 campaign), which is fully finished — meaning **no upcoming fixtures**.
  For the current season and live upcoming games, use a paid plan and set `VITE_SEASON`.
- Verify `VITE_LEAGUE_ID` / `VITE_TEAM_ID` against the API's `/leagues` and `/teams`
  endpoints if the defaults ever change.
- Responses are cached in `localStorage` for one hour to protect the daily quota; the
  header refresh button forces a fresh fetch.
- **Security:** `VITE_` vars are bundled into the browser, so the key ships to the
  client. Fine for local/personal use — for a public deployment, proxy requests through
  a small server function instead of exposing the key.

## Branding note

The crest in this project is an **unofficial, stylised fan mark** (navy/yellow with
the 1907 founding year), not the official Fenerbahçe SK emblem, which is a registered
trademark. This is a personal/educational fan project and is not affiliated with or
endorsed by the club.

## Licence

Personal/educational use.
