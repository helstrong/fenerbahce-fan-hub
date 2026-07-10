import type { AppData } from '../data/types'
import { fmtDate } from '../lib/format'

export default function News({ data }: { data: AppData }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">Club News</h1>

      <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        Football data APIs don’t provide news, so these items are still sample content. Connect a
        news or RSS source to make this feed live.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {data.news.map((n) => (
          <article key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-fener-yellow-dark">
              {n.category}
            </span>
            <h2 className="mt-1 font-bold text-fener-navy">{n.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{n.summary}</p>
            <p className="mt-3 text-xs text-slate-400">
              {n.source} · {fmtDate(n.date)}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
