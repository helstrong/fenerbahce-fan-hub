import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SPORTS } from './sports'
import type { Sport, SportConfig } from './sports'

const STORAGE_KEY = 'fener-fan-hub:sport'

interface SportContextValue {
  sport: Sport
  setSport: (s: Sport) => void
  config: SportConfig
}

const SportContext = createContext<SportContextValue | null>(null)

// Football is the default; a basketball fan who switches once lands back on
// basketball next time instead of having to switch again on every visit.
function initialSport(): Sport {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'football' || saved === 'basketball') return saved
  } catch {
    /* private mode — fall through to the default */
  }
  return 'football'
}

// Which sport the whole app is showing. Deliberately not part of the URL: the
// switch keeps you on the screen you're on and only swaps the content under it,
// so /fixtures is "the fixtures" for whichever sport is selected.
export function SportProvider({ children }: { children: ReactNode }) {
  const [sport, setSportState] = useState<Sport>(initialSport)

  const setSport = useCallback((next: Sport) => {
    setSportState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore — the choice just won't persist */
    }
  }, [])

  const value = useMemo(() => ({ sport, setSport, config: SPORTS[sport] }), [sport, setSport])

  return <SportContext.Provider value={value}>{children}</SportContext.Provider>
}

export function useSport(): SportContextValue {
  const ctx = useContext(SportContext)
  if (!ctx) throw new Error('useSport must be used within <SportProvider>')
  return ctx
}
