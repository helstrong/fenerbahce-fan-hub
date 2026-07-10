import { useState } from 'react'
import { getPlayers } from '../data/api'
import type { Player } from '../data/types'

const filters = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

export default function Squad() {
  const [pos, setPos] = useState<(typeof filters)[number]>('All')
  const players = getPlayers().filter((p) => pos === 'All' || p.position === pos)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fener-navy">Squad &amp; Player Stats</h1>

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </div>
    </div>
  )
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fener-navy text-lg font-bold text-fener-yellow">
          {player.number}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold text-fener-navy">{player.name}</h3>
          <p className="text-xs text-slate-500">
            {player.position} · {player.nationality} · {player.age}y
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Apps" value={player.appearances} />
        <Stat label="Goals" value={player.goals} />
        <Stat label="Assists" value={player.assists} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <div className="text-lg font-bold text-fener-navy">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  )
}
