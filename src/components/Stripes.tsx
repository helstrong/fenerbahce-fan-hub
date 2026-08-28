// The crest's skewed bars, reused as a faint texture behind the hero sections.
// Positioned in percentages rather than the design's fixed pixels so the
// spacing survives the app being responsive rather than a 390px frame.
export default function Stripes({ className = 'opacity-[0.09]' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {['6%', '24%', '74%'].map((left) => (
        <div
          key={left}
          style={{ left }}
          className="absolute -top-20 h-[160%] w-7 -skew-x-[18deg] bg-fener-yellow"
        />
      ))}
    </div>
  )
}
