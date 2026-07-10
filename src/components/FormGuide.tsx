// Renders a last-5 form string like "DWWLD" as coloured W/D/L pills.
// TheSportsDB orders the string oldest → newest.
const color = (r: string) =>
  r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-slate-400'

export default function FormGuide({ form, className = '' }: { form?: string; className?: string }) {
  const results = (form ?? '').toUpperCase().replace(/[^WDL]/g, '').split('')
  if (!results.length) return <span className="text-xs text-slate-300">—</span>

  return (
    <div className={`flex gap-1 ${className}`}>
      {results.map((r, i) => (
        <span
          key={i}
          title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${color(r)}`}
        >
          {r}
        </span>
      ))}
    </div>
  )
}
