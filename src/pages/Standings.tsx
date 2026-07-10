import { FENER_ID, getStandings } from '../data/api'

const columns = [
  { key: 'played', label: 'P' },
  { key: 'won', label: 'W' },
  { key: 'drawn', label: 'D' },
  { key: 'lost', label: 'L' },
  { key: 'gf', label: 'GF' },
  { key: 'ga', label: 'GA' },
] as const

export default function Standings() {
  const standings = getStandings()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">Süper Lig Table</h1>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-2 py-3 text-left">Club</th>
              {columns.map((c) => (
                <th key={c.key} className="px-2 py-3 text-center">
                  {c.label}
                </th>
              ))}
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center">Pts</th>
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
                  <td className={`px-2 py-2.5 ${isFener ? 'text-fener-navy' : ''}`}>{s.team.name}</td>
                  <td className="px-2 py-2.5 text-center">{s.played}</td>
                  <td className="px-2 py-2.5 text-center">{s.won}</td>
                  <td className="px-2 py-2.5 text-center">{s.drawn}</td>
                  <td className="px-2 py-2.5 text-center">{s.lost}</td>
                  <td className="px-2 py-2.5 text-center">{s.gf}</td>
                  <td className="px-2 py-2.5 text-center">{s.ga}</td>
                  <td className="px-2 py-2.5 text-center">{s.gf - s.ga}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-fener-navy">{s.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Top 4 highlighted for continental qualification · Sample standings for demo purposes.
      </p>
    </div>
  )
}
