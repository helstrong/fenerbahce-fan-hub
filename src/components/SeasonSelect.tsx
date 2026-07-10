import { useSeason } from '../data/SeasonContext'

// "2025-2026" → "2025/26"
const label = (s: string) => {
  const [a, b] = s.split('-')
  return b ? `${a}/${b.slice(2)}` : s
}

export default function SeasonSelect() {
  const { season, setSeason, seasons, status } = useSeason()

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Season</span>
      <select
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        disabled={status === 'loading'}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-fener-navy shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fener-yellow disabled:opacity-60"
      >
        {seasons.map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </select>
      {status === 'loading' && <span className="text-xs text-slate-400">loading…</span>}
    </label>
  )
}
