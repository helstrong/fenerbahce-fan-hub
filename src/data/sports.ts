import { LEAGUE_ID, TEAM_ID, USE_LIVE } from './config'
import type { TranslationKey } from '../i18n/strings'

// Everything that differs between Fenerbahçe football and Fenerbahçe Beko
// basketball, in one place. The data layer takes one of these instead of
// reading module-level team/league constants, so every screen works for either
// sport and the sport switch only has to change which config is passed in.

export type Sport = 'football' | 'basketball'

export const SPORT_LIST: Sport[] = ['football', 'basketball']

/**
 * How a competition is structured, which decides what the Tables page can show:
 * - league:   a round-robin table; any rounds coded ≥ 100 are playoffs, shown
 *             as a knockout run underneath (basketball has these, football's
 *             Süper Lig doesn't).
 * - cup:      knockout only, no table.
 * - uefa:     the football European format — a league phase (rounds 1-8) that
 *             only forms a single table from 2024-25 on, then knockouts.
 */
export type CompetitionFormat = 'league' | 'cup' | 'uefa'

export interface Competition {
  id: number
  name: string
  format: CompetitionFormat
  /** Positions highlighted in the table, and the note explaining why. */
  topZone?: { n: number; note: TranslationKey }
}

export interface SportConfig {
  sport: Sport
  teamId: number
  /** The domestic league — the table behind Home's "Season standing". */
  leagueId: number
  competitions: Competition[]
  /**
   * Whether the provider publishes an official table for the domestic league.
   * It does for the Süper Lig; it returns nothing at all for basketball, so
   * those tables are always computed from results.
   */
  officialTable: boolean
  /** Basketball has no draws and ranks on wins, not points. */
  scoring: 'football' | 'basketball'
}

export const SPORTS: Record<Sport, SportConfig> = {
  football: {
    sport: 'football',
    teamId: TEAM_ID,
    leagueId: LEAGUE_ID,
    officialTable: true,
    scoring: 'football',
    competitions: [
      { id: LEAGUE_ID, name: 'Süper Lig', format: 'league', topZone: { n: 4, note: 'standings.top4' } },
      { id: 4960, name: 'Turkish Cup', format: 'cup' },
      { id: 4480, name: 'UEFA Champions League', format: 'uefa' },
      { id: 4481, name: 'UEFA Europa League', format: 'uefa' },
      { id: 5071, name: 'UEFA Conference League', format: 'uefa' },
    ],
  },
  basketball: {
    sport: 'basketball',
    // TheSportsDB's "Fenerbahçe Basketbol" — the men's team, Fenerbahçe Beko.
    teamId: 136071,
    leagueId: 4475,
    officialTable: false,
    scoring: 'basketball',
    competitions: [
      // 16 teams; the top 8 go through to the playoffs.
      { id: 4475, name: 'Basketbol Süper Ligi', format: 'league', topZone: { n: 8, note: 'standings.bslPlayoffs' } },
      // 20 teams since 2025-26; 1st-6th straight to the playoffs, 7th-10th the play-in.
      { id: 4546, name: 'EuroLeague', format: 'league', topZone: { n: 6, note: 'standings.elPlayoffs' } },
      { id: 5507, name: 'Turkish Cup', format: 'cup' },
    ],
  },
}

// Fenerbahçe's id in each sport (or the sample set's stand-in). Football and
// basketball ids never collide, and the club never plays itself, so one check
// covers both sports — the cards, tables and result colouring don't need to
// know which sport they're rendering to tell which side is ours.
const FENER_IDS = new Set(USE_LIVE ? SPORT_LIST.map((s) => String(SPORTS[s].teamId)) : ['fb'])

export const isFener = (teamId: string): boolean => FENER_IDS.has(teamId)
