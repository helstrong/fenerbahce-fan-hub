export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-white/50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-fener-yellow" />
      <p className="text-sm">Loading the latest…</p>
    </div>
  )
}

export function ErrorView({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-semibold text-result-loss">Couldn’t load data</p>
      {message && <p className="max-w-md break-words text-xs text-white/45">{message}</p>}
      <button
        onClick={onRetry}
        className="rounded-lg bg-fener-yellow px-4 py-2 text-sm font-semibold text-fener-navy transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}

export function WarningBanner({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
      <p className="font-semibold">Some sections couldn’t be loaded from the live source:</p>
      <ul className="mt-1 list-inside list-disc">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  )
}
