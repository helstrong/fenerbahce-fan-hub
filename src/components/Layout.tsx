import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import Crest from './Crest'
import Icon from './Icon'

const nav = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/fixtures', label: 'Fixtures', icon: 'fixtures', end: false },
  { to: '/standings', label: 'Table', icon: 'standings', end: false },
  { to: '/squad', label: 'Squad', icon: 'squad', end: false },
  { to: '/club', label: 'Club', icon: 'club', end: false },
]

interface LayoutProps {
  children: ReactNode
  live?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  badge?: string
}

export default function Layout({ children, live = false, onRefresh, refreshing = false, badge }: LayoutProps) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-20 bg-fener-navy text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          {badge ? (
            <img src={badge} alt="Fenerbahçe crest" className="h-9 w-9 shrink-0 object-contain" />
          ) : (
            <Crest className="h-9 w-9" />
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-wide">Fenerbahçe Fan Hub</span>
            <span className="text-[11px] text-fener-yellow">
              Since 1907 · {live ? 'Live data' : 'Sample data'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <nav className="hidden gap-1 md:flex">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-fener-yellow text-fener-navy' : 'text-white/80 hover:bg-white/10'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh data"
                aria-label="Refresh data"
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 disabled:opacity-50"
              >
                <svg
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 11-3-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                isActive ? 'text-fener-navy' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={n.icon} className="h-5 w-5" />
                <span>{n.label}</span>
                <span className={`h-0.5 w-6 rounded-full ${isActive ? 'bg-fener-yellow' : 'bg-transparent'}`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
