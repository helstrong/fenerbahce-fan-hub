import { Link } from 'react-router-dom'
import { Card, SectionTitle } from '../components/Card'
import MatchCard from '../components/MatchCard'
import {
  FENER_ID,
  getLastResult,
  getNews,
  getNextMatch,
  getStandings,
  getTopScorers,
} from '../data/api'
import { fmtDate } from '../lib/format'

export default function Home() {
  const last = getLastResult()
  const next = getNextMatch()
  const standings = getStandings()
  const scorers = getTopScorers(5)
  const news = getNews().slice(0, 3)
  const fener = standings.find((s) => s.team.id === FENER_ID)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-fener-navy p-5 text-white">
        <p className="text-sm font-medium text-fener-yellow">Forza Fener 💛💙</p>
        <h1 className="text-2xl font-bold">Your club, all in one place</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <HeroStat label="League position" value={fener ? `#${fener.rank}` : '-'} />
          <HeroStat label="Points" value={fener ? `${fener.points}` : '-'} />
          <HeroStat label="Played" value={fener ? `${fener.played}` : '-'} />
          <HeroStat label="Goals for" value={fener ? `${fener.gf}` : '-'} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <SectionTitle>Last result</SectionTitle>
          {last ? <MatchCard fixture={last} /> : <Empty />}
        </div>
        <div>
          <SectionTitle>Next match</SectionTitle>
          {next ? <MatchCard fixture={next} /> : <Empty />}
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
          <div className="space-y-1">
            {standings.slice(0, 6).map((s) => (
              <div
                key={s.team.id}
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
                  s.team.id === FENER_ID ? 'bg-fener-yellow/20 font-semibold text-fener-navy' : ''
                }`}
              >
                <span className="w-4 text-slate-400">{s.rank}</span>
                <span className="flex-1">{s.team.name}</span>
                <span className="text-slate-400">{s.played}</span>
                <span className="w-6 text-right font-bold">{s.points}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link to="/squad" className="text-xs font-semibold text-fener-navy">
                Squad →
              </Link>
            }
          >
            Top scorers
          </SectionTitle>
          <div className="space-y-1">
            {scorers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fener-navy text-[11px] font-bold text-fener-yellow">
                  {p.number}
                </span>
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="hidden text-xs text-slate-400 sm:inline">{p.position}</span>
                <span className="w-6 text-right font-bold text-fener-navy">{p.goals}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
          {news.map((n) => (
            <Card key={n.id}>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-fener-yellow-dark">
                {n.category}
              </span>
              <h3 className="mt-1 text-sm font-bold text-fener-navy">{n.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{n.summary}</p>
              <p className="mt-2 text-[11px] text-slate-400">
                {n.source} · {fmtDate(n.date)}
              </p>
            </Card>
          ))}
        </div>
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

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
      No data available
    </div>
  )
}
