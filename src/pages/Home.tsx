import { Link } from 'react-router-dom'
import { Card, SectionTitle } from '../components/Card'
import FormGuide from '../components/FormGuide'
import MatchCard from '../components/MatchCard'
import TeamBadge from '../components/TeamBadge'
import { FENER_ID, lastResult, nextMatch, standingFor } from '../data/api'
import type { AppData } from '../data/types'

export default function Home({ data }: { data: AppData }) {
  const last = lastResult(data)
  const next = nextMatch(data)
  const standings = data.standings
  const fener = standingFor(data, FENER_ID)

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl bg-fener-navy p-5 text-white">
        {data.club?.badge && (
          <img src={data.club.badge} alt="" className="hidden h-16 w-16 shrink-0 object-contain sm:block" />
        )}
        <div>
          <p className="text-sm font-medium text-fener-yellow">Forza Fener 💛💙</p>
          <h1 className="text-2xl font-bold">Your club, all in one place</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <HeroStat label="League position" value={fener ? `#${fener.rank}` : '–'} />
            <HeroStat label="Points" value={fener ? `${fener.points}` : '–'} />
            <HeroStat label="Played" value={fener ? `${fener.played}` : '–'} />
            <HeroStat label="Goals for" value={fener ? `${fener.gf}` : '–'} />
          </div>
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
          {standings.length ? (
            <div className="space-y-1">
              {standings.slice(0, 6).map((s) => (
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
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-2">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-white/70">{label}</div>
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

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
      {label}
    </div>
  )
}
