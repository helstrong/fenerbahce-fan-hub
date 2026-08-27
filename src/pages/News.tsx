import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import type { AppData } from '../data/types'
import { fmtDate } from '../lib/format'

const sortOptions = ['Newest', 'Oldest'] as const
type SortOption = (typeof sortOptions)[number]

export default function News({ data }: { data: AppData }) {
  const [sort, setSort] = useState<SortOption>('Newest')

  // data.news already arrives newest-first; reversing is enough for 'Oldest'
  // and keeps undated items in the same relative spot either way.
  const news = useMemo(
    () => (sort === 'Oldest' ? [...data.news].reverse() : data.news),
    [data.news, sort],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fener-navy">News</h1>

        {data.news.length > 1 && (
          <div className="flex gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  sort === opt ? 'bg-fener-navy text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {news.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {news.map((n) => (
            <a key={n.link} href={n.link} target="_blank" rel="noopener noreferrer">
              <Card className="h-full transition hover:shadow-md">
                <h3 className="font-bold text-fener-navy">{n.title}</h3>
                <p className="mt-2 text-xs text-slate-400">
                  {n.source}
                  {n.publishedAt ? ` · ${fmtDate(n.publishedAt)}` : ''}
                </p>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No news available right now.</p>
      )}

      <p className="text-xs text-slate-400">
        Curated from a small set of trusted outlets via Google News. Not official Fenerbahçe SK
        content and not affiliated with the club.
      </p>
    </div>
  )
}
