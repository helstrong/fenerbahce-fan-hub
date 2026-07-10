import { FENER_ID } from '../data/api'
import type { Fixture } from '../data/types'
import { fmtDateTime } from '../lib/format'

export default function MatchCard({ fixture }: { fixture: Fixture }) {
  const finished = fixture.status === 'finished'
  const fenerHome = fixture.home.id === FENER_ID
  const fenerScore = fenerHome ? fixture.homeScore : fixture.awayScore
  const oppScore = fenerHome ? fixture.awayScore : fixture.homeScore

  const result =
    finished && fenerScore != null && oppScore != null
      ? fenerScore > oppScore
        ? 'W'
        : fenerScore < oppScore
          ? 'L'
          : 'D'
      : null

  const resultColor =
    result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-slate-400'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-fener-navy">{fixture.competition}</span>
        <span>{fmtDateTime(fixture.date)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamSide name={fixture.home.name} short={fixture.home.short} highlight={fenerHome} />
        <div className="shrink-0">
          {finished ? (
            <span className="rounded-lg bg-fener-navy px-3 py-1 text-lg font-bold text-white">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
              vs
            </span>
          )}
        </div>
        <TeamSide name={fixture.away.name} short={fixture.away.short} highlight={!fenerHome} right />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{fixture.venue}</span>
        {result && (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${resultColor}`}
            title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
          >
            {result}
          </span>
        )}
      </div>
    </div>
  )
}

function TeamSide({
  name,
  short,
  highlight,
  right,
}: {
  name: string
  short: string
  highlight?: boolean
  right?: boolean
}) {
  return (
    <div className={`flex flex-1 items-center gap-2 ${right ? 'flex-row-reverse text-right' : ''}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          highlight ? 'bg-fener-navy text-fener-yellow' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {short}
      </span>
      <span className={`text-sm font-semibold ${highlight ? 'text-fener-navy' : 'text-slate-700'}`}>
        {name}
      </span>
    </div>
  )
}
