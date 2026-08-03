import { Link } from 'react-router-dom'
import { Card, SectionTitle } from '../components/Card'
import CompetitionSelect from '../components/CompetitionSelect'
import Crest from '../components/Crest'
import FormGuide from '../components/FormGuide'
import MatchCard from '../components/MatchCard'
import SeasonSelect from '../components/SeasonSelect'
import TeamBadge from '../components/TeamBadge'
import { FENER_ID, lastResult, nextMatch, standingFor } from '../data/api'
import type { KnockoutStage } from '../data/api'
import { useSeason, useSelectedCompetition } from '../data/SeasonContext'
import type { AppData } from '../data/types'
import { fmtDate } from '../lib/format'

export default function Home({ data }: { data: AppData }) {
  const last = lastResult(data)
  const next = nextMatch(data)
  const fener = standingFor(data, FENER_ID)

  const { status: seasonStatus, data: seasonData } = useSeason()
  const competitions = seasonData?.competitions ?? []
  const [activeCompetitionId, setActiveCompetitionId] = useSelectedCompetition(competitions)
  const activeCompetition = competitions.find((c) => c.competitionId === activeCompetitionId) ?? competitions[0]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl bg-fener-navy p-5 text-white md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          {data.club?.badge ? (
            <img src={data.club.badge} alt={`${data.club.name} crest`} className="h-16 w-16 shrink-0 object-contain" />
          ) : (
            <Crest className="h-16 w-16 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-fener-yellow">Forza Fener 💛💙</p>
            <h1 className="text-2xl font-bold">Your club, all in one place</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 md:ml-auto">
          <HeroStat label="League position" value={fener ? `#${fener.rank}` : '–'} />
          <HeroStat label="Points" value={fener ? `${fener.points}` : '–'} />
          <HeroStat label="Played" value={fener ? `${fener.played}` : '–'} />
          <HeroStat label="Goals for" value={fener ? `${fener.gf}` : '–'} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <SectionTitle>Last result</SectionTitle>
          {last ? <MatchCard fixture={last} /> : <Empty label="No results yet" />}
        </div>
        <div>
          <SectionTitle>Next match</SectionTitle>
          {next ? <MatchCard fixture={next} /> : <Empty label="No upcoming fixtures" />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SectionTitle
            action={
              <Link to="/standings" className="text-xs font-semibold text-fener-navy">
                Full table →
              </Link>
            }
          >
            Table
          </SectionTitle>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SeasonSelect />
            <CompetitionSelect
              competitions={competitions}
              value={activeCompetitionId}
              onChange={setActiveCompetitionId}
            />
          </div>

          {seasonStatus === 'error' ? (
            <Empty label="Couldn’t load the table" />
          ) : !competitions.length ? (
            <Empty label={seasonStatus === 'loading' ? 'Loading…' : 'No competitions this season'} />
          ) : activeCompetition?.source === 'unavailable' ? (
            activeCompetition.knockout.length ? (
              <div className="space-y-3">
                {activeCompetition.note && <p className="text-xs text-slate-400">{activeCompetition.note}</p>}
                <KnockoutMini stages={activeCompetition.knockout} />
              </div>
            ) : (
              <Empty label={activeCompetition.note ?? 'No table available'} />
            )
          ) : activeCompetition?.standings.length ? (
            <div className="space-y-4">
              <div className="space-y-1">
                {activeCompetition.standings.slice(0, 6).map((s) => (
                  <div
                    key={s.team.id}
                    className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
                      s.team.id === FENER_ID ? 'bg-fener-yellow/20 font-semibold text-fener-navy' : ''
                    }`}
                  >
                    <span className="w-4 text-slate-400">{s.rank}</span>
                    <TeamBadge team={s.team} size={20} highlight={s.team.id === FENER_ID} />
                    <span className="flex-1 truncate">{s.team.name}</span>
                    <span className="text-slate-400">{s.played}</span>
                    <span className="w-6 text-right font-bold">{s.points}</span>
                  </div>
                ))}
              </div>
              {activeCompetition.knockout.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">Knockout stage</p>
                  <KnockoutMini stages={activeCompetition.knockout} />
                </div>
              )}
            </div>
          ) : (
            <Empty label="Table unavailable" />
          )}
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link to="/club" className="text-xs font-semibold text-fener-navy">
                Club →
              </Link>
            }
          >
            Form &amp; record
          </SectionTitle>
          {fener ? (
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">Last 5</p>
                <FormGuide form={fener.form} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Record label="Won" value={fener.won} />
                <Record label="Drawn" value={fener.drawn} />
                <Record label="Lost" value={fener.lost} />
              </div>
              <p className="text-xs text-slate-400">
                Goal difference{' '}
                <span className="font-semibold text-fener-navy">
                  {fener.gf - fener.ga >= 0 ? '+' : ''}
                  {fener.gf - fener.ga}
                </span>{' '}
                ({fener.gf} for, {fener.ga} against)
              </p>
            </div>
          ) : (
            <Empty label="Form unavailable" />
          )}
        </Card>
      </div>

      {data.news.length > 0 && (
        <div>
          <SectionTitle
            action={
              <Link to="/news" className="text-xs font-semibold text-fener-navy">
                All news →
              </Link>
            }
          >
            Latest news
          </SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            {data.news.slice(0, 3).map((n) => (
              <a key={n.link} href={n.link} target="_blank" rel="noopener noreferrer">
                <Card className="h-full transition hover:shadow-md">
                  <h3 className="text-sm font-bold text-fener-navy">{n.title}</h3>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {n.source}
                    {n.publishedAt ? ` · ${fmtDate(n.publishedAt)}` : ''}
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[84px] rounded-xl bg-white/10 px-4 py-2.5 text-center">
      <div className="text-2xl font-bold leading-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/70">{label}</div>
    </div>
  )
}

function Record({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <div className="text-lg font-bold text-fener-navy">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  )
}

// Compact stage-by-stage list of Fenerbahçe's own knockout results — a
// condensed version of Standings' KnockoutBracket, sized for the card.
function KnockoutMini({ stages }: { stages: KnockoutStage[] }) {
  return (
    <div className="space-y-3">
      {stages.map((stage) => (
        <div key={stage.label}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{stage.label}</p>
          <div className="space-y-1">
            {stage.fixtures.map((f) => {
              const fenerHome = f.home.id === FENER_ID
              const opponent = fenerHome ? f.away : f.home
              const fenerScore = fenerHome ? f.homeScore : f.awayScore
              const oppScore = fenerHome ? f.awayScore : f.homeScore
              const played = fenerScore != null && oppScore != null
              return (
                <div key={f.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                  <TeamBadge team={opponent} size={20} />
                  <span className="flex-1 truncate">
                    {fenerHome ? 'vs' : '@'} {opponent.name}
                  </span>
                  <span className="font-bold text-fener-navy">
                    {played ? `${fenerScore}-${oppScore}` : 'vs'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
      {label}
    </div>
  )
}
