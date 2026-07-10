import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import Crest from './Crest'
import Icon from './Icon'

const nav = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/fixtures', label: 'Fixtures', icon: 'fixtures', end: false },
  { to: '/standings', label: 'Table', icon: 'standings', end: false },
  { to: '/squad', label: 'Squad', icon: 'squad', end: false },
  { to: '/news', label: 'News', icon: 'news', end: false },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-20 bg-fener-navy text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Crest className="h-9 w-9" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-wide">Fenerbahçe Fan Hub</span>
            <span className="text-[11px] text-fener-yellow">Since 1907 · Sample data</span>
          </div>
          <nav className="ml-auto hidden gap-1 md:flex">
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
