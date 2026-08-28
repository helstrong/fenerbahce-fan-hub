import { Link } from 'react-router-dom'
import { SectionTitle, sectionLinkClass } from '../components/Card'
import CompetitionSelect from '../components/CompetitionSelect'
import FormGuide from '../components/FormGuide'
import { ResultStrip, TieRow } from '../components/ResultStrip'
import SeasonSelect from '../components/SeasonSelect'
import Stripes from '../components/Stripes'
import TeamBadge from '../components/TeamBadge'
import { FENER_ID, IS_FREE_KEY, lastResult, nextMatch, roundLabel, standingFor } from '../data/api'
import type { KnockoutStage } from '../data/api'
import { useSeason, useSelectedCompetition } from '../data/SeasonContext'
import type { AppData, Fixture, Standing } from '../data/types'
import { fmtDate, fmtMatchTime, ordinal } from '../lib/format'
import { useCountdown } from '../lib/useCountdown'

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
      <MatchdayHero fixture={next} />

      {last && (
        <section>
          <SectionTitle
            action={
              <span className="shrink-0 text-[11px] text-white/40">
                {[last.competition, roundLabel(last)].filter(Boolean).join(' · ')}
              </span>
            }
          >
            Last result
          </SectionTitle>
          <ResultStrip fixture={last} />
        </section>
      )}

      {fener && <SeasonStanding standing={fener} />}

      <section>
        <SectionTitle
          action={
            <Link to="/standings" className={sectionLinkClass}>
              Full table →
            </Link>
          }
        >
          {activeCompetition?.competitionName ?? 'Table'}
        </SectionTitle>

        <div className="mb-2.5 flex flex-wrap items-center gap-2">
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
        ) : activeCompetition?.standings.length ? (
          <div className="space-y-3">
            <MiniTable standings={activeCompetition.standings.slice(0, 6)} />
            {IS_FREE_KEY && activeCompetition.standings.length <= 6 && (
              <p className="text-[11px] text-white/35">
                The free data tier returns only the top of the table.
              </p>
            )}
            {activeCompetition.knockout.length > 0 && <KnockoutMini stages={activeCompetition.knockout} />}
          </div>
        ) : activeCompetition?.knockout.length ? (
          <div className="space-y-3">
            {activeCompetition.note && <p className="text-[11px] text-white/35">{activeCompetition.note}</p>}
            <KnockoutMini stages={activeCompetition.knockout} />
          </div>
        ) : (
          <Empty label={activeCompetition?.note ?? 'Table unavailable'} />
        )}
      </section>

      {data.news.length > 0 && (
        <section>
          <SectionTitle
            action={
              <Link to="/news" className={sectionLinkClass}>
                All news →
              </Link>
            }
          >
            Latest news
          </SectionTitle>
          {/* 1px gaps over a lighter backdrop give hairline rules between items
              without a border on each one. */}
          <div className="flex flex-col gap-px overflow-hidden rounded-2xl bg-white/[0.09]">
            {data.news.slice(0, 3).map((n) => (
              <a
                key={n.link}
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-fener-navy px-4 py-3.5 transition hover:bg-fener-navy-light"
              >
                <div className="text-sm font-semibold leading-snug text-pretty">{n.title}</div>
                <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-fener-yellow">
                  {n.source}
                  {n.publishedAt ? ` · ${fmtDate(n.publishedAt)}` : ''}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// The matchday panel: who's next and exactly how long until kick-off. Bleeds to
// the screen edges on mobile the way the design does, and tucks back into the
// content column on desktop.
function MatchdayHero({ fixture }: { fixture?: Fixture }) {
  const countdown = useCountdown(fixture?.date)

  const shell =
    '-mx-4 -mt-6 relative overflow-hidden border-b-2 border-fener-yellow bg-gradient-to-br from-fener-navy-glow via-fener-navy to-fener-navy-dark px-5 pb-6 pt-6 md:mx-0 md:mt-0 md:rounded-2xl md:border-b-0 md:border-l-2'

  if (!fixture) {
    return (
      <section className={shell}>
        <Stripes />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-fener-yellow">Next match</p>
          <p className="mt-3 text-sm text-white/60">
            No upcoming fixtures right now — the schedule for the next round hasn’t been published yet.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={shell}>
      <Stripes />

      <div className="relative flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-fener-yellow">
          {countdown?.started ? 'Kicking off' : 'Next match'}
        </span>
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
          {[fixture.competition, roundLabel(fixture)].filter(Boolean).join(' · ')}
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <HeroSide team={fixture.home} label="Home" />
        <div className="font-display text-[26px] font-bold tracking-[0.04em] text-white/30">VS</div>
        <HeroSide team={fixture.away} label="Away" />
      </div>

      {countdown && (
        <div className="relative mt-5 grid grid-cols-4 gap-1.5">
          <CountdownCell value={countdown.days} label="Days" />
          <CountdownCell value={countdown.hours} label="Hrs" />
          <CountdownCell value={countdown.minutes} label="Min" />
          <CountdownCell value={countdown.seconds} label="Sec" />
        </div>
      )}

      <div className="relative mt-3.5 flex items-center justify-between gap-3 text-[11px] font-medium text-white/60">
        <span>{fmtMatchTime(fixture.date)}</span>
        {fixture.venue && <span className="truncate text-right">{fixture.venue}</span>}
      </div>
    </section>
  )
}

function HeroSide({ team, label }: { team: Fixture['home']; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <TeamBadge team={team} size={52} highlight={team.id === FENER_ID} />
      <span className="line-clamp-2 text-center text-[13px] font-semibold">{team.name}</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/45">{label}</span>
    </div>
  )
}

function CountdownCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.08] bg-black/[0.28] py-2.5 text-center">
      <div className="font-display text-[32px] font-bold leading-none text-fener-yellow">{value}</div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
    </div>
  )
}

// Position, points and goal difference at a glance, with the record and form
// underneath — the numbers the hero used to carry before matchday took its place.
function SeasonStanding({ standing }: { standing: Standing }) {
  const gd = standing.gf - standing.ga

  return (
    <section>
      <SectionTitle>Season standing</SectionTitle>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-fener-yellow px-2.5 py-3 text-fener-navy">
          <div className="font-display text-[38px] font-bold leading-[0.85]">
            {standing.rank}
            <span className="align-top text-xl leading-none">{ordinal(standing.rank)}</span>
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">
            Position
          </div>
        </div>
        <StatTile value={String(standing.points)} label="Points" />
        <StatTile value={`${gd >= 0 ? '+' : ''}${gd}`} label="Goal diff" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-xl bg-white/5 px-3 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
          Last 5
        </span>
        <FormGuide form={standing.form} />
        <span className="ml-auto text-[11px] font-medium text-white/45">
          {standing.won}W {standing.drawn}D {standing.lost}L
        </span>
      </div>

      <p className="mt-2 text-[11px] text-white/35">
        {standing.played} played · {standing.gf} scored · {standing.ga} conceded
      </p>
    </section>
  )
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-3">
      <div className="font-display text-[38px] font-bold leading-[0.85]">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {label}
      </div>
    </div>
  )
}

function MiniTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/5">
      {standings.map((s, i) => {
        const isFener = s.team.id === FENER_ID
        return (
          <div
            key={s.team.id}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm ${
              i > 0 ? 'border-t border-white/[0.06]' : ''
            } ${isFener ? 'bg-fener-yellow font-semibold text-fener-navy' : ''}`}
          >
            <span
              className={`w-5 shrink-0 font-display text-[15px] font-bold ${
                isFener ? '' : 'text-white/45'
              }`}
            >
              {s.rank}
            </span>
            <TeamBadge team={s.team} size={20} highlight={isFener} />
            <span className="flex-1 truncate">{s.team.name}</span>
            <span className={`w-7 shrink-0 text-center text-xs ${isFener ? 'opacity-60' : 'text-white/40'}`}>
              {s.played}
            </span>
            <span className="w-8 shrink-0 text-right font-display text-[17px] font-bold">{s.points}</span>
          </div>
        )
      })}
    </div>
  )
}

// Fenerbahçe's own knockout run, condensed for the dashboard — the full version
// lives on the Tables page.
function KnockoutMini({ stages }: { stages: KnockoutStage[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
        Knockout stage
      </p>
      {stages.map((stage) =>
        stage.fixtures.map((f) => <TieRow key={f.id} fixture={f} label={stage.label} />),
      )}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
      {label}
    </div>
  )
}
