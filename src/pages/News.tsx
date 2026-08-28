import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
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
    <div>
      <PageHeader title="News">
        {data.news.length > 1 && (
          <div className="flex gap-1.5">
            {sortOptions.map((opt) => (
              <Pill key={opt} active={sort === opt} onClick={() => setSort(opt)}>
                {opt}
              </Pill>
            ))}
          </div>
        )}
      </PageHeader>

      {news.length ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {news.map((n) => (
            <a
              key={n.link}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-fener-navy px-4 py-3.5 transition hover:border-white/20 hover:bg-fener-navy-light"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-fener-yellow">
                {n.source}
                {n.publishedAt ? ` · ${fmtDate(n.publishedAt)}` : ''}
              </div>
              <h2 className="mt-2 text-[15px] font-semibold leading-snug text-pretty">{n.title}</h2>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">No news available right now.</p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-white/35">
        Curated from a small set of trusted outlets via Google News. Not official Fenerbahçe SK
        content and not affiliated with the club.
      </p>
    </div>
  )
}
