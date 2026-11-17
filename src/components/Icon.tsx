type IconProps = { name: string; className?: string }

const paths: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  fixtures: 'M7 3v4M17 3v4M4 8h16M5 6h14v14H5z',
  standings: 'M4 6h16M4 12h16M4 18h16',
  squad: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6',
  club: 'M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6z',
  news: 'M4 5h16v14H4zM8 9h8M8 13h8M8 17h4',
  tv: 'M4 8h16v11H4zM8 3l4 4 4-4',
  // A ball with its centre panel and the seams running out to the edge.
  football:
    'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5l3.8 2.8-1.5 4.4H9.7l-1.5-4.4zM12 7.5V3.2M15.8 10.3l4.3-1.4M14.3 14.7l2.6 3.7M9.7 14.7l-2.6 3.7M8.2 10.3L3.9 8.9',
  basketball:
    'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3v18M5.6 5.6a9 9 0 010 12.8M18.4 5.6a9 9 0 000 12.8',
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
