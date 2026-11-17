import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { loadAll } from './api'
import { useSport } from './SportContext'
import { SPORTS } from './sports'
import type { Sport } from './sports'
import type { AppData } from './types'

type Status = 'loading' | 'ready' | 'error'

interface State {
  status: Status
  data: AppData | null
  error?: string
}

interface DataContextValue {
  state: State
  refresh: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

const LOADING: State = { status: 'loading', data: null }

// Holds one loaded AppData per sport. Each sport loads the first time it's
// selected and is then kept, so switching back is instant. Results are stored
// under the sport they were requested for, so a slow football response that
// lands after the user has switched to basketball can't overwrite it.
export function DataProvider({ children }: { children: ReactNode }) {
  const { sport } = useSport()
  const [bySport, setBySport] = useState<Partial<Record<Sport, State>>>({})

  const load = useCallback((s: Sport, force: boolean) => {
    setBySport((prev) => ({ ...prev, [s]: { ...(prev[s] ?? LOADING), status: 'loading' } }))
    loadAll(SPORTS[s], force)
      .then((data) => setBySport((prev) => ({ ...prev, [s]: { status: 'ready', data } })))
      .catch((e) =>
        setBySport((prev) => ({ ...prev, [s]: { status: 'error', data: null, error: String(e?.message ?? e) } })),
      )
  }, [])

  const loaded = !!bySport[sport]
  useEffect(() => {
    if (!loaded) load(sport, false)
  }, [sport, loaded, load])

  return (
    <DataContext.Provider value={{ state: bySport[sport] ?? LOADING, refresh: () => load(sport, true) }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
