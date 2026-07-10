import type { Team } from '../data/types'

// Renders a club crest from its badge URL, falling back to a short-code chip
// when no image is available (e.g. sample data or a missing badge).
export default function TeamBadge({
  team,
  size = 32,
  highlight = false,
}: {
  team: Team
  size?: number
  highlight?: boolean
}) {
  const style = { width: size, height: size }

  if (team.badge) {
    return (
      <img
        src={team.badge}
        alt={`${team.name} crest`}
        loading="lazy"
        style={style}
        className="shrink-0 rounded-full object-contain"
      />
    )
  }

  return (
    <span
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
        highlight ? 'bg-fener-navy text-fener-yellow' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {team.short}
    </span>
  )
}
