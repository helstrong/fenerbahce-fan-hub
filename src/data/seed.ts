import type { ClubProfile, Fixture, Kit, Player, Standing, Team } from './types'

// ---------------------------------------------------------------------------
// SAMPLE DATA — fallback only, shown when VITE_USE_SAMPLE=true or when the live
// TheSportsDB fetch fails entirely. Not guaranteed accurate. The UI consumes
// only the shapes in ./types.ts, so the live client (./theSportsDb.ts) can
// swap in seamlessly.
// ---------------------------------------------------------------------------

export const FENER_ID = 'fb'

const teams: Record<string, Team> = {
  fb: { id: 'fb', name: 'Fenerbahçe', short: 'FEN' },
  gs: { id: 'gs', name: 'Galatasaray', short: 'GAL' },
  bjk: { id: 'bjk', name: 'Beşiktaş', short: 'BJK' },
  ts: { id: 'ts', name: 'Trabzonspor', short: 'TRA' },
  bfk: { id: 'bfk', name: 'Başakşehir', short: 'BAS' },
}

export const club: ClubProfile = {
  name: 'Fenerbahçe',
  altName: 'Fenerbahçe Spor Kulübü',
  nicknames: 'Sarı Kanaryalar, Sarı-Lacivertliler',
  formedYear: '1907',
  stadium: 'Şükrü Saracoğlu Stadium',
  capacity: '50509',
  location: 'Kadıköy, Istanbul',
  country: 'Turkey',
  description:
    'Fenerbahçe Spor Kulübü, also known as Fenerbahçe and Fener, is a professional football club based on the Anatolian side of Istanbul, Turkey. Founded in 1907 and playing in the yellow-navy of its famous crest, it is one of the most successful and widely supported clubs in Turkish football.',
  competitions: ['Turkish Super Lig', 'Turkish Cup', 'UEFA Champions League'],
  website: 'www.fenerbahce.org',
  facebook: 'www.facebook.com/fenerbahce',
  twitter: 'www.twitter.com/Fenerbahce',
  instagram: 'instagram.com/fenerbahce',
  youtube: 'www.youtube.com/fenerbahce',
  fanart: [],
}

export const standings: Standing[] = [
  { rank: 1, team: teams.gs, played: 34, won: 24, drawn: 5, lost: 5, gf: 77, ga: 30, points: 77, form: 'LWLWW' },
  { rank: 2, team: teams.fb, played: 34, won: 22, drawn: 8, lost: 4, gf: 74, ga: 30, points: 74, form: 'DWWLD' },
  { rank: 3, team: teams.ts, played: 34, won: 20, drawn: 9, lost: 5, gf: 62, ga: 35, points: 69, form: 'LWDLD' },
  { rank: 4, team: teams.bjk, played: 34, won: 17, drawn: 9, lost: 8, gf: 60, ga: 38, points: 60, form: 'DLWDL' },
  { rank: 5, team: teams.bfk, played: 34, won: 16, drawn: 9, lost: 9, gf: 52, ga: 42, points: 57, form: 'WWLWD' },
]

export const fixtures: Fixture[] = [
  {
    id: 'f1', competition: 'Süper Lig', date: '2026-05-18T19:00:00',
    home: teams.fb, away: teams.gs, homeScore: 3, awayScore: 1,
    status: 'finished', venue: 'Şükrü Saracoğlu', round: '34',
  },
  {
    id: 'f2', competition: 'Süper Lig', date: '2026-05-11T19:00:00',
    home: teams.ts, away: teams.fb, homeScore: 0, awayScore: 2,
    status: 'finished', venue: 'Papara Park', round: '33',
  },
  {
    id: 'f3', competition: 'Süper Lig', date: '2026-05-04T19:00:00',
    home: teams.fb, away: teams.bjk, homeScore: 1, awayScore: 1,
    status: 'finished', venue: 'Şükrü Saracoğlu', round: '32',
  },
  {
    id: 'f4', competition: 'Süper Lig', date: '2026-08-10T19:00:00',
    home: teams.fb, away: teams.bfk, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Şükrü Saracoğlu', round: '1',
  },
  {
    id: 'f5', competition: 'Süper Lig', date: '2026-08-17T19:00:00',
    home: teams.bjk, away: teams.fb, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Tüpraş Stadyumu', round: '2',
  },
]

export const players: Player[] = [
  { id: 'p1', name: 'Dominik Livaković', number: 1, position: 'Goalkeeper', nationality: 'Croatia', age: 31, foot: 'Right', height: '188 cm', birthplace: 'Zadar, Croatia' },
  { id: 'p2', name: 'Çağlar Söyüncü', number: 4, position: 'Defender', nationality: 'Turkey', age: 30, foot: 'Right', height: '187 cm', birthplace: 'İzmir, Turkey' },
  { id: 'p3', name: 'Diego Carlos', number: 34, position: 'Defender', nationality: 'Brazil', age: 33, foot: 'Right', height: '185 cm', birthplace: 'Campinas, Brazil' },
  { id: 'p4', name: 'Archie Brown', number: 3, position: 'Defender', nationality: 'England', age: 23, foot: 'Left', height: '183 cm', birthplace: 'Milton Keynes, England' },
  { id: 'p5', name: 'Edson Álvarez', number: 11, position: 'Midfielder', nationality: 'Mexico', age: 28, foot: 'Right', height: '187 cm', signing: 'on Loan (West Ham)', birthplace: 'Tlalnepantla, Mexico' },
  { id: 'p6', name: 'Bartuğ Elmaz', number: 28, position: 'Midfielder', nationality: 'Turkey', age: 22, foot: 'Right', height: '183 cm', birthplace: 'Marseille, France' },
  { id: 'p7', name: 'Dušan Tadić', number: 10, position: 'Forward', nationality: 'Serbia', age: 37, foot: 'Left', height: '181 cm', birthplace: 'Bačka Topola, Serbia' },
  { id: 'p8', name: 'Allan Saint-Maximin', number: 97, position: 'Forward', nationality: 'France', age: 29, foot: 'Right', height: '173 cm', signing: 'on Loan (Al-Ahli)', birthplace: 'Châtenay-Malabry, France' },
  { id: 'p9', name: 'Edin Džeko', number: 9, position: 'Forward', nationality: 'Bosnia', age: 40, foot: 'Right', height: '193 cm', birthplace: 'Sarajevo, Bosnia' },
  { id: 'p10', name: 'Ederson', number: 31, position: 'Goalkeeper', nationality: 'Brazil', age: 32, foot: 'Left', height: '188 cm', birthplace: 'Osasco, Brazil' },
]

export const kits: Kit[] = []
