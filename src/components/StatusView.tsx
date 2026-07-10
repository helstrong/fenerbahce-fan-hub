export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-fener-navy" />
      <p className="text-sm">Loading the latest…</p>
    </div>
  )
}

export function ErrorView({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-semibold text-red-600">Couldn’t load data</p>
      {message && <p className="max-w-md break-words text-xs text-slate-400">{message}</p>}
      <button
        onClick={onRetry}
        className="rounded-lg bg-fener-navy px-4 py-2 text-sm font-semibold text-white hover:bg-fener-navy-light"
      >
        Try again
      </button>
    </div>
  )
}

export function WarningBanner({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <p className="font-semibold">Some sections couldn’t be loaded from the live source:</p>
      <ul className="mt-1 list-inside list-disc">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  )
}
