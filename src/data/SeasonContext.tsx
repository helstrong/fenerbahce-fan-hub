import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { loadSeason } from './api'
import type { SeasonData } from './api'
import { SEASON } from './config'

type Status = 'loading' | 'ready' | 'error'

interface SeasonContextValue {
  season: string
  setSeason: (s: string) => void
  seasons: string[]
  status: Status
  data: SeasonData | null
  error?: string
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

// A descending list of selectable seasons anchored to the configured default.
// Starts one season ahead of the default so the upcoming campaign (with its
// preseason friendlies) is reachable before its league table exists.
function buildSeasons(from: string, count = 12): string[] {
  const start = parseInt(from, 10)
  if (!Number.isFinite(start)) return [from]
  return Array.from({ length: count }, (_, i) => `${start + 1 - i}-${start + 2 - i}`)
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(SEASON)
  const [state, setState] = useState<{ status: Status; data: SeasonData | null; error?: string }>({
    status: 'loading',
    data: null,
  })
  const cache = useRef<Map<string, SeasonData>>(new Map())
  const seasons = useMemo(() => buildSeasons(SEASON), [])

  useEffect(() => {
    let cancelled = false

    const cached = cache.current.get(season)
    if (cached) {
      setState({ status: 'ready', data: cached })
      return
    }

    setState((s) => ({ ...s, status: 'loading' }))
    loadSeason(season)
      .then((data) => {
        if (cancelled) return
        cache.current.set(season, data)
        setState({ status: 'ready', data })
      })
      .catch((e) => {
        if (!cancelled) setState({ status: 'error', data: null, error: String(e?.message ?? e) })
      })

    return () => {
      cancelled = true
    }
  }, [season])

  return (
    <SeasonContext.Provider value={{ season, setSeason, seasons, ...state }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason(): SeasonContextValue {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within <SeasonProvider>')
  return ctx
}
