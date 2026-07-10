import { useState } from 'react'
import { IS_FREE_KEY } from '../data/api'
import type { AppData, Player } from '../data/types'

const filters = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

export default function Squad({ data }: { data: AppData }) {
  const [pos, setPos] = useState<(typeof filters)[number]>('All')
  const players = data.players.filter((p) => pos === 'All' || p.position === pos)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">Squad</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setPos(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              pos === f ? 'bg-fener-navy text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {players.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No players to show.</p>
      )}

      {data.live && IS_FREE_KEY && (
        <p className="text-xs text-slate-400">
          Squad data is provided by TheSportsDB’s free tier, which returns a limited
          roster and no per-season match statistics.
        </p>
      )}
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  const meta = [player.position, player.nationality, player.age ? `${player.age}y` : null]
    .filter(Boolean)
    .join(' · ')

  const facts: [string, string][] = []
  if (player.foot) facts.push(['Foot', player.foot])
  if (player.height) facts.push(['Height', player.height])
  if (player.weight) facts.push(['Weight', player.weight])
  if (player.birthplace) facts.push(['Born', player.birthplace])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3 bg-fener-navy p-4 text-white">
        <Avatar player={player} />
        <div className="min-w-0">
          <h3 className="truncate font-bold">{player.name}</h3>
          <p className="truncate text-xs text-fener-yellow">{meta}</p>
        </div>
        <span className="ml-auto text-2xl font-bold text-fener-yellow">
          {player.number || '–'}
        </span>
      </div>

      {(facts.length > 0 || player.signing) && (
        <div className="space-y-1.5 p-4">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-slate-400">{label}</span>
              <span className="truncate pl-2 text-right font-medium text-slate-700">{value}</span>
            </div>
          ))}
          {player.signing && (
            <p className="pt-1 text-[11px] italic text-slate-400">{player.signing}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Avatar({ player }: { player: Player }) {
  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-full bg-white object-cover object-top"
      />
    )
  }
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-fener-yellow text-lg font-bold text-fener-navy">
      {player.number || player.name.charAt(0)}
    </span>
  )
}
