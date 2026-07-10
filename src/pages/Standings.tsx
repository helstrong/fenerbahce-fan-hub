import FormGuide from '../components/FormGuide'
import SeasonSelect from '../components/SeasonSelect'
import TeamBadge from '../components/TeamBadge'
import { FENER_ID, IS_FREE_KEY } from '../data/api'
import { useSeason } from '../data/SeasonContext'

export default function Standings() {
  const { status, data } = useSeason()
  const standings = data?.standings ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fener-navy">Süper Lig Table</h1>
        <SeasonSelect />
      </div>

      {status === 'error' ? (
        <p className="text-sm text-red-500">Couldn’t load the table for this season.</p>
      ) : !standings.length ? (
        <p className="text-sm text-slate-400">
          {status === 'loading' ? 'Loading standings…' : 'No standings for this season.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-2 py-3 text-left">Club</th>
                  <th className="px-2 py-3 text-center">P</th>
                  <th className="px-2 py-3 text-center">W</th>
                  <th className="px-2 py-3 text-center">D</th>
                  <th className="px-2 py-3 text-center">L</th>
                  <th className="px-2 py-3 text-center">GF</th>
                  <th className="px-2 py-3 text-center">GA</th>
                  <th className="px-2 py-3 text-center">GD</th>
                  <th className="px-4 py-3 text-center">Pts</th>
                  <th className="px-4 py-3 text-left">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => {
                  const isFener = s.team.id === FENER_ID
                  return (
                    <tr
                      key={s.team.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        isFener ? 'bg-fener-yellow/20 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            s.rank <= 4 ? 'bg-fener-navy text-fener-yellow' : 'text-slate-500'
                          }`}
                        >
                          {s.rank}
                        </span>
                      </td>
                      <td className={`px-2 py-2.5 ${isFener ? 'text-fener-navy' : ''}`}>
                        <div className="flex items-center gap-2">
                          <TeamBadge team={s.team} size={22} highlight={isFener} />
                          <span className="truncate">{s.team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center">{s.played}</td>
                      <td className="px-2 py-2.5 text-center">{s.won}</td>
                      <td className="px-2 py-2.5 text-center">{s.drawn}</td>
                      <td className="px-2 py-2.5 text-center">{s.lost}</td>
                      <td className="px-2 py-2.5 text-center">{s.gf}</td>
                      <td className="px-2 py-2.5 text-center">{s.ga}</td>
                      <td className="px-2 py-2.5 text-center">{s.gf - s.ga}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-fener-navy">{s.points}</td>
                      <td className="px-4 py-2.5">
                        <FormGuide form={s.form} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400">
            Top 4 highlighted for continental qualification.
            {IS_FREE_KEY && standings.length <= 6
              ? ' The free data tier returns only the top of the table.'
              : ''}
          </p>
        </>
      )}
    </div>
  )
}
