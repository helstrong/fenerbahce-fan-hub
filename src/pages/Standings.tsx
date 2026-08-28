import FormGuide from '../components/FormGuide'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
import { TieRow } from '../components/ResultStrip'
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
    <div>
      <PageHeader title="Tables">
        <SeasonSelect />
      </PageHeader>

      {competitions.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {competitions.map((c) => (
            <Pill
              key={c.competitionId}
              active={active?.competitionId === c.competitionId}
              onClick={() => setSelectedId(c.competitionId)}
            >
              {c.competitionName}
            </Pill>
          ))}
        </div>
      )}

      {status === 'error' ? (
        <p className="text-sm text-result-loss">Couldn’t load tables for this season.</p>
      ) : !competitions.length ? (
        <p className="text-sm text-white/40">
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
      <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
        {competition.note ?? 'No data available for this competition.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {hasTable && <LeagueTable competition={competition} />}
      {hasKnockout && (
        <div>
          {hasTable ? (
            <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Knockout stage
            </h2>
          ) : (
            competition.note && <p className="mb-3 text-xs leading-relaxed text-white/45">{competition.note}</p>
          )}
          <KnockoutBracket stages={competition.knockout} />
        </div>
      )}
    </div>
  )
}

function LeagueTable({ competition }: { competition: CompetitionStandings }) {
  const standings = competition.standings
  const showForm = competition.source === 'official'

  // The design's mobile table is #/Club/P/GD/Pts/Form. The per-result breakdown
  // is real data the app already had, so rather than drop it, it's hidden at
  // phone width and returns from sm: up where there's room for it.
  const wide = 'hidden px-1.5 py-2.5 text-center sm:table-cell'

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
              <th className="px-3 py-2.5 text-left">#</th>
              <th className="py-2.5 text-left">Club</th>
              <th className="px-1.5 py-2.5 text-center">P</th>
              <th className={wide}>W</th>
              <th className={wide}>D</th>
              <th className={wide}>L</th>
              <th className={wide}>GF</th>
              <th className={wide}>GA</th>
              <th className="px-1.5 py-2.5 text-center">GD</th>
              <th className="px-2 py-2.5 text-right">Pts</th>
              {showForm && <th className="px-3 py-2.5 text-right">Form</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const isFener = s.team.id === FENER_ID
              const gd = s.gf - s.ga
              return (
                <tr
                  key={s.team.id}
                  className={`border-b border-white/[0.06] last:border-0 ${
                    isFener ? 'bg-fener-yellow font-semibold text-fener-navy' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={`font-display text-[15px] font-bold ${
                        isFener
                          ? ''
                          : competition.source === 'official' && s.rank <= 4
                            ? 'text-fener-yellow'
                            : 'text-white/45'
                      }`}
                    >
                      {s.rank}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <TeamBadge team={s.team} size={20} highlight={isFener} />
                      <span className="truncate text-[13px]">{s.team.name}</span>
                    </div>
                  </td>
                  <td className={`px-1.5 py-2.5 text-center text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>
                    {s.played}
                  </td>
                  <td className={`${wide} text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>{s.won}</td>
                  <td className={`${wide} text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>{s.drawn}</td>
                  <td className={`${wide} text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>{s.lost}</td>
                  <td className={`${wide} text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>{s.gf}</td>
                  <td className={`${wide} text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>{s.ga}</td>
                  <td className={`px-1.5 py-2.5 text-center text-xs ${isFener ? 'opacity-60' : 'text-white/60'}`}>
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td className="px-2 py-2.5 text-right font-display text-[17px] font-bold">{s.points}</td>
                  {showForm && (
                    <td className="px-3 py-2.5">
                      <FormGuide form={s.form} size="sm" className="justify-end" />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/35">
        {competition.source === 'official' ? (
          <>
            Top 4 qualify for continental football.
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
    <div className="grid gap-2.5 md:grid-cols-2">
      {stages.map((stage) =>
        stage.fixtures.map((f) => <TieRow key={f.id} fixture={f} label={stage.label} />),
      )}
    </div>
  )
}
