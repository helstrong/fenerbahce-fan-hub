import type { Fixture, NewsItem, Player, Standing, Team } from './types'

// ---------------------------------------------------------------------------
// SAMPLE DATA — for demo purposes only. Not live and not guaranteed accurate.
// Replace the functions in ./api.ts with real API calls (e.g. API-Football)
// to make the app live; the UI consumes only the shapes in ./types.ts.
// ---------------------------------------------------------------------------

export const FENER_ID = 'fb'

const teams: Record<string, Team> = {
  fb: { id: 'fb', name: 'Fenerbahçe', short: 'FEN' },
  gs: { id: 'gs', name: 'Galatasaray', short: 'GAL' },
  bjk: { id: 'bjk', name: 'Beşiktaş', short: 'BJK' },
  ts: { id: 'ts', name: 'Trabzonspor', short: 'TRA' },
  bfk: { id: 'bfk', name: 'Başakşehir', short: 'BAS' },
  kas: { id: 'kas', name: 'Kasımpaşa', short: 'KAS' },
  kon: { id: 'kon', name: 'Konyaspor', short: 'KON' },
  ant: { id: 'ant', name: 'Antalyaspor', short: 'ANT' },
  ads: { id: 'ads', name: 'Adana Demirspor', short: 'ADS' },
  rize: { id: 'rize', name: 'Çaykur Rizespor', short: 'RIZ' },
}

export const standings: Standing[] = [
  { rank: 1, team: teams.fb, played: 34, won: 26, drawn: 5, lost: 3, gf: 80, ga: 25, points: 83 },
  { rank: 2, team: teams.gs, played: 34, won: 25, drawn: 6, lost: 3, gf: 78, ga: 28, points: 81 },
  { rank: 3, team: teams.ts, played: 34, won: 20, drawn: 8, lost: 6, gf: 62, ga: 35, points: 68 },
  { rank: 4, team: teams.bjk, played: 34, won: 19, drawn: 7, lost: 8, gf: 60, ga: 38, points: 64 },
  { rank: 5, team: teams.bfk, played: 34, won: 16, drawn: 9, lost: 9, gf: 52, ga: 42, points: 57 },
  { rank: 6, team: teams.kas, played: 34, won: 14, drawn: 8, lost: 12, gf: 48, ga: 48, points: 50 },
  { rank: 7, team: teams.kon, played: 34, won: 12, drawn: 10, lost: 12, gf: 44, ga: 46, points: 46 },
  { rank: 8, team: teams.ant, played: 34, won: 11, drawn: 9, lost: 14, gf: 40, ga: 50, points: 42 },
  { rank: 9, team: teams.ads, played: 34, won: 9, drawn: 8, lost: 17, gf: 38, ga: 58, points: 35 },
  { rank: 10, team: teams.rize, played: 34, won: 7, drawn: 9, lost: 18, gf: 30, ga: 62, points: 30 },
]

export const fixtures: Fixture[] = [
  {
    id: 'f1', competition: 'Süper Lig', date: '2026-05-18T19:00:00',
    home: teams.fb, away: teams.gs, homeScore: 3, awayScore: 1,
    status: 'finished', venue: 'Şükrü Saracoğlu',
  },
  {
    id: 'f2', competition: 'Süper Lig', date: '2026-05-11T19:00:00',
    home: teams.ts, away: teams.fb, homeScore: 0, awayScore: 2,
    status: 'finished', venue: 'Papara Park',
  },
  {
    id: 'f3', competition: 'Süper Lig', date: '2026-05-04T19:00:00',
    home: teams.fb, away: teams.bjk, homeScore: 1, awayScore: 1,
    status: 'finished', venue: 'Şükrü Saracoğlu',
  },
  {
    id: 'f4', competition: 'Süper Lig', date: '2026-08-10T19:00:00',
    home: teams.fb, away: teams.bfk, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Şükrü Saracoğlu',
  },
  {
    id: 'f5', competition: 'Süper Lig', date: '2026-08-17T19:00:00',
    home: teams.kas, away: teams.fb, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Recep Tayyip Erdoğan',
  },
  {
    id: 'f6', competition: 'Süper Lig', date: '2026-08-24T19:00:00',
    home: teams.fb, away: teams.ts, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Şükrü Saracoğlu',
  },
]

export const players: Player[] = [
  { id: 'p1', name: 'Dominik Livaković', number: 1, position: 'Goalkeeper', nationality: 'Croatia', age: 31, appearances: 34, goals: 0, assists: 0 },
  { id: 'p2', name: 'Alexander Djiku', number: 3, position: 'Defender', nationality: 'Ghana', age: 31, appearances: 30, goals: 2, assists: 1 },
  { id: 'p3', name: 'Bright Osayi-Samuel', number: 27, position: 'Defender', nationality: 'Nigeria', age: 28, appearances: 31, goals: 3, assists: 6 },
  { id: 'p4', name: 'Ferdi Kadıoğlu', number: 6, position: 'Defender', nationality: 'Türkiye', age: 26, appearances: 29, goals: 2, assists: 5 },
  { id: 'p5', name: 'Fred', number: 8, position: 'Midfielder', nationality: 'Brazil', age: 33, appearances: 30, goals: 5, assists: 4 },
  { id: 'p6', name: 'Sebastian Szymański', number: 10, position: 'Midfielder', nationality: 'Poland', age: 27, appearances: 33, goals: 9, assists: 8 },
  { id: 'p7', name: 'İrfan Can Kahveci', number: 7, position: 'Midfielder', nationality: 'Türkiye', age: 30, appearances: 28, goals: 7, assists: 6 },
  { id: 'p8', name: 'Dušan Tadić', number: 14, position: 'Midfielder', nationality: 'Serbia', age: 37, appearances: 32, goals: 11, assists: 13 },
  { id: 'p9', name: 'Edin Džeko', number: 9, position: 'Forward', nationality: 'Bosnia', age: 40, appearances: 31, goals: 19, assists: 5 },
  { id: 'p10', name: 'Youssef En-Nesyri', number: 99, position: 'Forward', nationality: 'Morocco', age: 29, appearances: 30, goals: 21, assists: 4 },
  { id: 'p11', name: 'Michy Batshuayi', number: 23, position: 'Forward', nationality: 'Belgium', age: 32, appearances: 24, goals: 12, assists: 3 },
]

export const news: NewsItem[] = [
  { id: 'n1', category: 'Match Report', title: 'Fenerbahçe seal derby with second-half surge', summary: 'A dominant home display saw the Sarı Lacivertliler come from level to take all three points in front of a packed Kadıköy.', source: 'Fan Hub Demo', date: '2026-05-18' },
  { id: 'n2', category: 'Transfer', title: 'Club linked with young Süper Lig winger', summary: 'Reports suggest the sporting directors are monitoring a highly-rated attacking talent ahead of the summer window.', source: 'Fan Hub Demo', date: '2026-05-15' },
  { id: 'n3', category: 'Injury', title: 'Midfielder returns to full training', summary: 'Positive news from the training ground as a key midfielder rejoins group sessions ahead of the run-in.', source: 'Fan Hub Demo', date: '2026-05-13' },
  { id: 'n4', category: 'Europe', title: 'European draw sets up a testing group stage', summary: 'The continental campaign will feature familiar opponents and a couple of tough away trips to plan for.', source: 'Fan Hub Demo', date: '2026-05-10' },
  { id: 'n5', category: 'Youth', title: 'Academy graduate signs first professional deal', summary: 'A product of the youth setup has committed his future to the club with a multi-year contract.', source: 'Fan Hub Demo', date: '2026-05-08' },
  { id: 'n6', category: 'Club', title: 'Members approve new facilities investment', summary: 'A general assembly backed plans to upgrade training infrastructure over the coming seasons.', source: 'Fan Hub Demo', date: '2026-05-05' },
]
