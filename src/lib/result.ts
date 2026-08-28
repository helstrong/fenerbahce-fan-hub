import { FENER_ID } from '../data/api'
import type { Fixture, Team } from '../data/types'

export type MatchResult = 'W' | 'D' | 'L'

export interface Perspective {
  opponent: Team
  atHome: boolean
  /** Fenerbahçe's goals, then the opponent's — not home-then-away. */
  ours: number | null
  theirs: number | null
  result: MatchResult | null
}

// This is a single-club hub, so most surfaces read a match from Fenerbahçe's
// side — "vs Kasımpaşa 4–1" rather than whichever way round the fixture is
// stored. Derived once here so the result colours, the score order and the
// opponent name can't drift apart between the cards that show them.
export function perspective(fixture: Fixture): Perspective {
  const atHome = fixture.home.id === FENER_ID
  const ours = atHome ? fixture.homeScore : fixture.awayScore
  const theirs = atHome ? fixture.awayScore : fixture.homeScore
  const played = fixture.status === 'finished' && ours != null && theirs != null

  return {
    opponent: atHome ? fixture.away : fixture.home,
    atHome,
    ours,
    theirs,
    result: played ? (ours! > theirs! ? 'W' : ours! < theirs! ? 'L' : 'D') : null,
  }
}

export const resultLabel: Record<MatchResult, string> = { W: 'Win', D: 'Draw', L: 'Loss' }

// Tailwind classes rather than raw hex so W/D/L reads identically everywhere it
// appears — form squares, fixture cards, result strips — from one definition.
export const resultBg: Record<MatchResult, string> = {
  W: 'bg-result-win',
  D: 'bg-result-draw',
  L: 'bg-result-loss',
}

export const resultFg: Record<MatchResult, string> = {
  W: 'text-result-win',
  D: 'text-result-draw',
  L: 'text-result-loss',
}

export const resultBorder: Record<MatchResult, string> = {
  W: 'border-l-result-win',
  D: 'border-l-result-draw',
  L: 'border-l-result-loss',
}

// Ink for text sitting on a filled result chip — a dark tint of the chip's own
// hue rather than flat black, which keeps the chips reading as one set.
export const resultInk: Record<MatchResult, string> = {
  W: 'text-[#04240F]',
  D: 'text-[#0B1220]',
  L: 'text-[#2B0606]',
}
