import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Last-resort safety net: without this, any uncaught error during render
// (e.g. a stale-cache shape mismatch, or a bug in a new feature) unmounts the
// whole tree and leaves a blank white page with no clue why. This shows a
// recoverable message instead.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-bold text-fener-navy">Something went wrong.</p>
          <p className="max-w-sm text-sm text-slate-500">
            Please try reloading the page. If the problem persists, clearing this site's data may
            help.
          </p>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="rounded-lg bg-fener-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
