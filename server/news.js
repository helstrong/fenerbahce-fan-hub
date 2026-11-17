// Fetches, parses and filters Fenerbahçe football or basketball news from
// Google News RSS — one feed per sport, each with its own cache.
//
// Google News RSS is a free, undocumented interface — not a published API with
// a support contract. It's fetched here server-side (no CORS concern) and
// cached, which is the standard low-risk pattern for small non-commercial news
// aggregation. It could change or be blocked by Google without notice.
//
// Shared by both the Vite dev middleware and the production Express server so
// the fetch/parse/filter/cache logic exists in exactly one place.

import { XMLParser } from 'fast-xml-parser'

// Each query names its sport, which keeps the other sections of this
// multi-sport club (and the other sport's coverage) out of the feed.
const QUERIES = {
  football: 'Fenerbahçe football',
  basketball: 'Fenerbahçe Beko basketball',
}

const feedUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

/** Normalises a request's ?sport= value; anything unrecognised means football. */
export const newsSport = (value) => (value === 'basketball' ? 'basketball' : 'football')

// Curated allowlist of outlets we trust to surface as "club news" — an
// editorial judgment call, not an automated trust score. Matched
// case-insensitively against the RSS <source> tag. Add/remove freely.
const FOOTBALL_SOURCES = [
  // Wire services & major international broadcasters/papers
  'Reuters',
  'BBC',
  'BBC Sport',
  'ESPN',
  'The Guardian',
  'The Independent',
  'Sky Sports',
  // Turkish majors
  'Daily Sabah',
  'Hürriyet Daily News',
  'Fanatik',
  // Football-specific outlets
  'Goal.com',
  'UEFA.com',
  'La Gazzetta dello Sport',
  'Football Italia',
  // Broadcasters with football rights
  'beIN SPORTS',
  'TNT Sports',
  // Official sources
  'Fenerbahce.org',
  'Premier League',
  // Wire-syndicating aggregators
  'Yahoo Sports',
  'Yahoo Sports UK',
  'Yahoo Sports Canada',
]

// The general outlets above rarely cover the basketball team, so basketball
// adds the competition's own site, FIBA, and the two main basketball news
// outlets — again an editorial call.
const BASKETBALL_SOURCES = [
  ...FOOTBALL_SOURCES,
  'Euroleague Basketball',
  'FIBA',
  'BasketNews.com',
  'Eurohoops',
]

const lower = (list) => new Set(list.map((s) => s.toLowerCase()))
const TRUSTED_SOURCES = {
  football: lower(FOOTBALL_SOURCES),
  basketball: lower(BASKETBALL_SOURCES),
}

const CACHE_TTL_MS = 15 * 60 * 1000
const parser = new XMLParser()

const cache = new Map() // sport -> { at: number, items: NewsItem[] }

export async function fetchNews(sport = 'football') {
  const hit = cache.get(sport)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.items

  const trusted = TRUSTED_SOURCES[sport]
  const res = await fetch(feedUrl(QUERIES[sport]))
  if (!res.ok) throw new Error(`news feed: HTTP ${res.status}`)

  const xml = await res.text()
  const doc = parser.parse(xml)
  const rawItems = doc?.rss?.channel?.item ?? []
  const list = Array.isArray(rawItems) ? rawItems : [rawItems]

  const items = list
    .filter((it) => trusted.has(String(it.source ?? '').toLowerCase().trim()))
    .map((it) => {
      const source = String(it.source ?? '').trim()
      let title = String(it.title ?? '').trim()
      // Google News titles end with " - {source}" — drop it since source is
      // already shown separately in the UI.
      const suffix = ` - ${source}`
      if (source && title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim()
      return {
        title,
        link: String(it.link ?? '').trim(),
        source,
        publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : null,
      }
    })
    .filter((it) => it.title && it.link)
    // Google News RSS orders by relevance, not strictly by time — sort newest
    // first so every consumer (Home preview, News page) gets a consistent,
    // actually-chronological default. Undated items sort last.
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return +new Date(b.publishedAt) - +new Date(a.publishedAt)
    })

  cache.set(sport, { at: Date.now(), items })
  return items
}
