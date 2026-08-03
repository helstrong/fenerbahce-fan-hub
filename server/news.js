// Fetches, parses and filters Fenerbahçe football news from Google News RSS.
//
// Google News RSS is a free, undocumented interface — not a published API with
// a support contract. It's fetched here server-side (no CORS concern) and
// cached, which is the standard low-risk pattern for small non-commercial news
// aggregation. It could change or be blocked by Google without notice.
//
// Shared by both the Vite dev middleware and the production Express server so
// the fetch/parse/filter/cache logic exists in exactly one place.

import { XMLParser } from 'fast-xml-parser'

const QUERY = 'Fenerbahçe football' // biases results toward football, away from the club's basketball/volleyball sections
const FEED_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=en-US&gl=US&ceid=US:en`

// Curated allowlist of outlets we trust to surface as "club news" — an
// editorial judgment call, not an automated trust score. Matched
// case-insensitively against the RSS <source> tag. Add/remove freely.
const TRUSTED_SOURCES = new Set(
  [
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
  ].map((s) => s.toLowerCase()),
)

const CACHE_TTL_MS = 15 * 60 * 1000
const parser = new XMLParser()

let cache = null // { at: number, items: NewsItem[] }

export async function fetchNews() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.items

  const res = await fetch(FEED_URL)
  if (!res.ok) throw new Error(`news feed: HTTP ${res.status}`)

  const xml = await res.text()
  const doc = parser.parse(xml)
  const rawItems = doc?.rss?.channel?.item ?? []
  const list = Array.isArray(rawItems) ? rawItems : [rawItems]

  const items = list
    .filter((it) => TRUSTED_SOURCES.has(String(it.source ?? '').toLowerCase().trim()))
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

  cache = { at: Date.now(), items }
  return items
}
