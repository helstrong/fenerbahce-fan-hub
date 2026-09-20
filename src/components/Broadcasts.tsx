import { useEffect, useState } from 'react'
import { loadBroadcasts } from '../data/api'
import { rightsFor } from '../data/broadcasts'
import type { Broadcast, Fixture } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import Icon from './Icon'

// Where to watch the match, as a row of channel chips under the matchday hero.
//
// Seeded synchronously from the curated rights table so the chips are there on
// first paint — that's the part users actually need, and it avoids the row
// popping in after a request. Any live TV listings the provider has are merged
// in a moment later (see loadBroadcasts); most fixtures have none.
export default function Broadcasts({ fixture }: { fixture: Fixture }) {
  const { t } = useI18n()
  const [list, setList] = useState<Broadcast[]>(() => rightsFor(fixture.competition))

  useEffect(() => {
    let cancelled = false
    setList(rightsFor(fixture.competition))

    loadBroadcasts(fixture.id, fixture.competition)
      .then((merged) => {
        if (!cancelled) setList(merged)
      })
      .catch(() => {
        /* curated rights are already on screen — nothing to undo */
      })

    return () => {
      cancelled = true
    }
  }, [fixture.id, fixture.competition])

  // No known rights and no listings: show nothing rather than an empty shelf.
  if (!list.length) return null

  return (
    <div
      className="relative mt-3.5 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3.5"
      aria-label={t('broadcast.label')}
    >
      <Icon name="tv" className="h-4 w-4 shrink-0 text-fener-yellow" />
      {list.map((b) => (
        <span
          key={`${b.region}-${b.channel}`}
          className="flex min-w-0 items-center gap-1.5 rounded-lg bg-white/[0.08] py-1.5 pl-2 pr-2.5"
        >
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/45">
            {b.region}
          </span>
          <span className="truncate text-xs font-semibold">{b.channel}</span>
        </span>
      ))}
    </div>
  )
}
