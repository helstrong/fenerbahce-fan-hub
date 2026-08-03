import FormGuide from '../components/FormGuide'
import MatchCard from '../components/MatchCard'
import SeasonSelect from '../components/SeasonSelect'
import TeamBadge from '../components/TeamBadge'
import { FENER_ID, IS_FREE_KEY } from '../data/api'
import type { CompetitionStandings, KnockoutStage } from '../data/api'
import { useSeason, useSelectedCompetition } from '../data/SeasonContext'

export default function Standings() {
  const { status, data } = useSeason()
  const competitions = data?.competitions ?? []
  const [selectedId, setSelectedId] = useSelectedCompetition(competitions)

  const active = competitions.find((c) => c.competitionId === selectedId) ?? competitions[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fener-navy">Tables</h1>
        <SeasonSelect />
      </div>

      {competitions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {competitions.map((c) => (
            <button
              key={c.competitionId}
              onClick={() => setSelectedId(c.competitionId)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active?.competitionId === c.competitionId
                  ? 'bg-fener-navy text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {c.competitionName}
            </button>
          ))}
        </div>
      )}

      {status === 'error' ? (
        <p className="text-sm text-red-500">Couldn’t load tables for this season.</p>
      ) : !competitions.length ? (
        <p className="text-sm text-slate-400">
          {status === 'loading' ? 'Loading tables…' : 'No competitions found for this season.'}
        </p>
      ) : active ? (
        <CompetitionView competition={active} />
      ) : null}
    </div>
  )
}

function CompetitionView({ competition }: { competition: CompetitionStandings }) {
  const hasTable = competition.source !== 'unavailable' && competition.standings.length > 0
  const hasKnockout = competition.knockout.length > 0

  if (!hasTable && !hasKnockout) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
        {competition.note ?? 'No data available for this competition.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {hasTable && <LeagueTable competition={competition} />}
      {hasKnockout && (
        <div>
          {hasTable && <h2 className="mb-3 text-lg font-bold text-fener-navy">Knockout stage</h2>}
          {!hasTable && competition.note && <p className="mb-3 text-sm text-slate-400">{competition.note}</p>}
          <KnockoutBracket stages={competition.knockout} />
        </div>
      )}
    </div>
  )
}

function LeagueTable({ competition }: { competition: CompetitionStandings }) {
  const standings = competition.standings
  const showForm = competition.source === 'official'

  return (
    <div>
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
              {showForm && <th className="px-4 py-3 text-left">Form</th>}
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
                        competition.source === 'official' && s.rank <= 4
                          ? 'bg-fener-navy text-fener-yellow'
                          : 'text-slate-500'
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
                  {showForm && (
                    <td className="px-4 py-2.5">
                      <FormGuide form={s.form} />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {competition.source === 'official' ? (
          <>
            Top 4 highlighted for continental qualification.
            {IS_FREE_KEY && standings.length <= 6
              ? ' The free data tier returns only the top of the table.'
              : ''}
          </>
        ) : (
          competition.note
        )}
      </p>
    </div>
  )
}

// Fenerbahçe's own run through the knockout rounds, one stage at a time
// (Qualifying, Play-off, Round of 16, ...) — real results, not a full bracket
// of every tie in the competition.
function KnockoutBracket({ stages }: { stages: KnockoutStage[] }) {
  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <div key={stage.label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{stage.label}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {stage.fixtures.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
