import type { Broadcast } from './types'

// ---------------------------------------------------------------------------
// Where to watch the match.
//
// TheSportsDB's TV listings (lookuptv.php) are crowd-sourced and, for this
// club, almost empty: of ten upcoming fixtures checked, eight had no listings
// at all and none had a Turkish broadcaster — not even the Galatasaray derby.
// So the listings alone can't answer "what channel is it on".
//
// Broadcast rights, though, are fixed per competition per market for years at a
// time, which makes a small curated table both accurate and always populated.
// That table is the primary source here; any live listings the provider does
// have are merged in on top as extra countries (see loadBroadcasts in ./api).
//
// ⚠️ RIGHTS CHANGE. Re-check these at the start of each season — a stale entry
// here is worse than an empty row, because it looks authoritative. Only
// competitions listed below show a broadcast row; the rest simply don't.
// ---------------------------------------------------------------------------

/** Matched against a fixture's competition name, which varies by source
 *  ("Süper Lig" vs "Turkish Super Lig"), so these are patterns not exact keys. */
interface RightsEntry {
  match: RegExp
  broadcasters: Broadcast[]
}

const RIGHTS: RightsEntry[] = [
  {
    // Domestic league — beIN Sports holds the Turkish rights.
    match: /s[üu]per lig/i,
    broadcasters: [
      { region: 'TR', channel: 'beIN Sports 1' },
      { region: 'INT', channel: 'beIN Sports Connect' },
    ],
  },

  // Add the rest as you confirm them, e.g.:
  //
  // { match: /champions league/i, broadcasters: [
  //     { region: 'TR',  channel: '…' },
  //     { region: 'INT', channel: '…' },
  // ] },
  // { match: /t[üu]rkiye kupas[ıi]|turkish cup/i, broadcasters: [
  //     { region: 'TR', channel: '…' },
  // ] },
]

/** The curated rights holders for a competition, or [] when we don't know. */
export function rightsFor(competition: string): Broadcast[] {
  if (!competition) return []
  return RIGHTS.find((r) => r.match.test(competition))?.broadcasters ?? []
}

// Short tags for the region chip. The provider gives full country names; these
// keep the chip narrow without inventing codes for places we've never seen.
const COUNTRY_TAGS: Record<string, string> = {
  Turkey: 'TR',
  'United Kingdom': 'UK',
  'United States': 'US',
  Netherlands: 'NL',
  Germany: 'DE',
  France: 'FR',
  Spain: 'ES',
  Italy: 'IT',
  Brazil: 'BR',
  China: 'CN',
  Slovenia: 'SI',
  Portugal: 'PT',
  Greece: 'GR',
  Australia: 'AU',
  Canada: 'CA',
}

export const countryTag = (country: string): string =>
  COUNTRY_TAGS[country] ?? country.slice(0, 3).toUpperCase()
