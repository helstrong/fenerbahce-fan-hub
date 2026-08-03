import { Card } from '../components/Card'
import type { AppData } from '../data/types'
import { fmtDate } from '../lib/format'

export default function News({ data }: { data: AppData }) {
  const news = data.news

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">News</h1>

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
