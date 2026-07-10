# Fenerbahçe Fan Hub

A responsive web app for Fenerbahçe SK fans to track results, fixtures, the league
table, squad stats and club news — all in one place, in club colours (navy `#00285E`
& yellow `#FFED00`).

Built with **React + Vite + TypeScript + Tailwind CSS**.

> ⚠️ **Demo data.** The app currently ships with *sample* fixtures, standings, player
> stats and news for illustration only. They are not live and not guaranteed accurate.
> See [Going live](#going-live) to connect a real data source.

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
  components/   Layout, Crest, MatchCard, Card, Icon
  data/         types.ts, seed.ts (sample data), api.ts (data access layer)
  lib/          formatting helpers
  pages/        Home, Fixtures, Standings, Squad, News
```

## Going live

Every screen reads through the functions in `src/data/api.ts` — nothing touches the
raw data or the network directly. To go live, replace those function bodies with real
API calls while keeping the return shapes in `src/data/types.ts`.

Suggested source: **API-Football** (api-football.com) covers the Turkish Süper Lig —
fixtures, standings, squads and player stats. News can come from a separate source
(e.g. an RSS feed or NewsAPI). Put your API key in a `.env` file (already gitignored)
and, ideally, proxy requests through a small serverless function so the key is never
shipped to the browser.

## Branding note

The crest in this project is an **unofficial, stylised fan mark** (navy/yellow with
the 1907 founding year), not the official Fenerbahçe SK emblem, which is a registered
trademark. This is a personal/educational fan project and is not affiliated with or
endorsed by the club.

## Licence

Personal/educational use.
