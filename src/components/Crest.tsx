export default function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="crest-shield">
          <path d="M50 3 L94 17 V63 C94 90 73 108 50 116 C27 108 6 90 6 63 V17 Z" />
        </clipPath>
      </defs>
      <path
        d="M50 3 L94 17 V63 C94 90 73 108 50 116 C27 108 6 90 6 63 V17 Z"
        fill="#00285E"
        stroke="#FFED00"
        strokeWidth={4}
      />
      <g clipPath="url(#crest-shield)">
        <rect x="14" y="-10" width="12" height="140" fill="#FFED00" transform="skewX(-18)" />
        <rect x="44" y="-10" width="12" height="140" fill="#FFED00" transform="skewX(-18)" />
        <rect x="74" y="-10" width="12" height="140" fill="#FFED00" transform="skewX(-18)" />
      </g>
      <circle cx="50" cy="56" r="21" fill="#ffffff" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#00285E"
        fontFamily="system-ui, sans-serif"
      >
        1907
      </text>
    </svg>
  )
}
