import { useState } from 'react'
import MatchCard from '../components/MatchCard'
import { getResults, getUpcoming } from '../data/api'

export default function Fixtures() {
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')
  const list = tab === 'results' ? getResults() : getUpcoming()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">Fixtures &amp; Results</h1>

      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {(['upcoming', 'results'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-fener-navy text-white' : 'text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No {tab} matches to show.</p>
      )}
    </div>
  )
}
