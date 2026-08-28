import { useEffect, useState } from 'react'
import MatchCard from '../components/MatchCard'
import PageHeader from '../components/PageHeader'
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
    <div>
      <PageHeader title="Fixtures">
        <SeasonSelect />
      </PageHeader>

      <div className="mb-4 flex gap-1.5 rounded-xl bg-white/[0.07] p-1">
        {(['upcoming', 'results'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`flex-1 rounded-[9px] py-2 text-xs font-semibold uppercase tracking-[0.06em] transition ${
              tab === t ? 'bg-fener-yellow text-fener-navy' : 'text-white/55 hover:text-white'
            }`}
          >
            {t} <span className="opacity-60">{t === 'results' ? results.length : upcoming.length}</span>
          </button>
        ))}
      </div>

      {status === 'error' ? (
        <p className="text-sm text-result-loss">Couldn’t load fixtures for this season.</p>
      ) : list.length ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {list.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">
          {status === 'loading' ? 'Loading fixtures…' : `No ${tab} matches this season.`}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-white/35">
        Includes Süper Lig, Turkish Cup, European ties and friendlies. Friendlies for past seasons
        may be incomplete.
      </p>
    </div>
  )
}
