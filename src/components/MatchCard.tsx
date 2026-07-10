import { FENER_ID } from '../data/api'
import type { Fixture, Team } from '../data/types'
import { fmtDateTime } from '../lib/format'
import TeamBadge from './TeamBadge'

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
        <TeamSide team={fixture.home} highlight={fenerHome} />
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
        <TeamSide team={fixture.away} highlight={!fenerHome} right />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">
          {fixture.round ? `Round ${fixture.round}` : ''}
          {fixture.round && fixture.venue ? ' · ' : ''}
          {fixture.venue}
        </span>
        {result && (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${resultColor}`}
            title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
          >
            {result}
          </span>
        )}
      </div>
    </div>
  )
}

function TeamSide({ team, highlight, right }: { team: Team; highlight?: boolean; right?: boolean }) {
  return (
    <div className={`flex flex-1 items-center gap-2 ${right ? 'flex-row-reverse text-right' : ''}`}>
      <TeamBadge team={team} size={32} highlight={highlight} />
      <span className={`text-sm font-semibold ${highlight ? 'text-fener-navy' : 'text-slate-700'}`}>
        {team.name}
      </span>
    </div>
  )
}
