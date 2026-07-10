import { useEffect, useState } from 'react'
import MatchCard from '../components/MatchCard'
import SeasonSelect from '../components/SeasonSelect'
import { useSeason } from '../data/SeasonContext'

export default function Fixtures() {
  const { status, data } = useSeason()
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')

  const results = data?.results ?? []
  const upcoming = data?.upcoming ?? []

  // A finished season has no upcoming matches — open on Results instead.
  useEffect(() => {
    if (data && !upcoming.length && results.length) setTab('results')
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const list = tab === 'results' ? results : upcoming

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fener-navy">Fixtures &amp; Results</h1>
        <SeasonSelect />
      </div>

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
            <span className="ml-1.5 text-xs opacity-70">
              {t === 'results' ? results.length : upcoming.length}
            </span>
          </button>
        ))}
      </div>

      {status === 'error' ? (
        <p className="text-sm text-red-500">Couldn’t load fixtures for this season.</p>
      ) : list.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          {status === 'loading' ? 'Loading fixtures…' : `No ${tab} matches this season.`}
        </p>
      )}

      <p className="text-xs text-slate-400">
        Includes Süper Lig, Turkish Cup, European ties and friendlies. Friendlies for
        past seasons may be incomplete.
      </p>
    </div>
  )
}
