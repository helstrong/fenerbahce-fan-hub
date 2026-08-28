import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
import { IS_FREE_KEY } from '../data/api'
import type { AppData, Player } from '../data/types'

const filters = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

const posShort: Record<Player['position'], string> = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Forward: 'FWD',
}

export default function Squad({ data }: { data: AppData }) {
  const [pos, setPos] = useState<(typeof filters)[number]>('All')
  const players = data.players.filter((p) => pos === 'All' || p.position === pos)

  return (
    <div>
      <PageHeader title="Squad">
        <span className="text-[11px] text-white/50">{players.length} players</span>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Pill key={f} active={pos === f} onClick={() => setPos(f)}>
            {f}
          </Pill>
        ))}
      </div>

      {players.length ? (
        <div className="flex flex-col gap-px overflow-hidden rounded-2xl bg-white/[0.09]">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">No players to show.</p>
      )}

      {data.live && IS_FREE_KEY && (
        <p className="mt-4 text-[11px] leading-relaxed text-white/35">
          Squad data is provided by TheSportsDB’s free tier, which returns a limited roster and no
          per-season match statistics.
        </p>
      )}
    </div>
  )
}

// One dense row per player. The design shows name, number, position and height;
// the rest of the bio the API returns (foot, weight, birthplace, transfer note)
// expands underneath on tap rather than being dropped.
function PlayerRow({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)

  const facts: [string, string][] = []
  if (player.foot) facts.push(['Foot', player.foot])
  if (player.weight) facts.push(['Weight', player.weight])
  if (player.birthplace) facts.push(['Born', player.birthplace])
  if (player.signing) facts.push(['Signing', player.signing])

  const meta = [player.nationality, player.age ? `${player.age} years` : null].filter(Boolean).join(' · ')

  const body = (
    <>
      <span className="w-8 shrink-0 text-center font-display text-[26px] font-bold leading-none text-fener-yellow">
        {player.number || '–'}
      </span>

      {player.photo ? (
        <img
          src={player.photo}
          alt=""
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full bg-white/10 object-cover object-top"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-sm font-semibold">{player.name}</span>
        {meta && <span className="truncate text-[11px] text-white/50">{meta}</span>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">
          {posShort[player.position]}
        </span>
        {player.height && <span className="text-[11px] text-white/35">{player.height}</span>}
      </div>
    </>
  )

  if (!facts.length) {
    return <div className="flex items-center gap-3.5 bg-fener-navy px-3.5 py-3">{body}</div>
  }

  return (
    <div className="bg-fener-navy">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-3.5 py-3 text-left transition hover:bg-white/[0.04]"
      >
        {body}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/[0.08] px-3.5 py-3 text-[11px]">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-white/40">{label}</dt>
              <dd className="truncate text-right font-medium text-white/80">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
