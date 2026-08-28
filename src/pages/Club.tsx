import { SectionTitle } from '../components/Card'
import Crest from '../components/Crest'
import Stripes from '../components/Stripes'
import type { AppData, ClubProfile, Kit } from '../data/types'

const href = (url?: string) => (url ? (/^https?:\/\//.test(url) ? url : `https://${url}`) : undefined)

export default function Club({ data }: { data: AppData }) {
  const club = data.club

  if (!club) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold uppercase leading-none">Club</h1>
        <p className="mt-4 text-sm text-white/40">Club information is unavailable right now.</p>
      </div>
    )
  }

  // Pinned to en-GB like the date formatting in lib/format — the default locale
  // renders 53715 as "53.715" on a European machine, which reads as a decimal.
  const capacity =
    club.capacity && Number.isFinite(Number(club.capacity))
      ? Number(club.capacity).toLocaleString('en-GB')
      : club.capacity

  const where = [club.location, club.country].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      <Hero club={club} />

      {club.description && (
        <p className="text-[13px] leading-relaxed text-white/70 text-pretty">{club.description}</p>
      )}

      <section>
        <SectionTitle>Club facts</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {club.formedYear && <BigFact value={club.formedYear} label="Founded" />}
          {capacity && <BigFact value={capacity} label="Capacity" />}
          {club.stadium && (
            <WideFact value={club.stadium} label={where ? `Stadium · ${where}` : 'Stadium'} />
          )}
          {club.nicknames && <WideFact value={club.nicknames} label="Nicknames" />}
        </div>
      </section>

      {club.competitions && club.competitions.length > 0 && (
        <section>
          <SectionTitle>Competes in</SectionTitle>
          <div className="flex flex-col gap-px overflow-hidden rounded-xl bg-white/[0.09]">
            {club.competitions.map((c) => (
              <div key={c} className="flex items-center gap-2.5 bg-fener-navy px-3.5 py-3 text-[13px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fener-yellow" />
                {c}
              </div>
            ))}
          </div>
        </section>
      )}

      <Socials club={club} />
      <Fanart images={club.fanart} />
      <Kits kits={data.kits} />
    </div>
  )
}

function Hero({ club }: { club: ClubProfile }) {
  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden border-b-2 border-fener-yellow bg-gradient-to-br from-fener-navy-glow via-fener-navy to-fener-navy-dark px-5 py-7 md:mx-0 md:mt-0 md:rounded-2xl md:border-b-0 md:border-l-2">
      {/* The club banner, when there is one, sits behind the gradient as texture
          rather than as its own band above the crest. */}
      {club.banner && (
        <img src={club.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <Stripes className="opacity-10" />

      <div className="relative flex items-center gap-4">
        {club.badge ? (
          <img src={club.badge} alt={`${club.name} crest`} className="h-16 w-16 shrink-0 object-contain sm:h-[72px] sm:w-[72px]" />
        ) : (
          <Crest className="h-16 w-16 shrink-0 sm:h-[72px] sm:w-[72px]" />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[34px] font-bold uppercase leading-none tracking-[0.02em]">
            {club.name}
          </h1>
          {club.altName && <p className="mt-1.5 text-xs font-medium text-fener-yellow">{club.altName}</p>}
          {(club.formedYear || club.location) && (
            <p className="mt-1 text-[11px] text-white/50">
              {[club.formedYear && `Est. ${club.formedYear}`, club.location].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function BigFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <div className="font-display text-[26px] font-bold leading-none text-fener-yellow">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </div>
    </div>
  )
}

function WideFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <div className="text-sm font-semibold leading-snug">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </div>
    </div>
  )
}

function Socials({ club }: { club: ClubProfile }) {
  const links: [string, string | undefined][] = [
    ['Website', club.website],
    ['Instagram', club.instagram],
    ['Twitter / X', club.twitter],
    ['Facebook', club.facebook],
    ['YouTube', club.youtube],
  ]
  const present = links.filter(([, url]) => url)
  if (!present.length) return null

  return (
    <section>
      <SectionTitle>Official links</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {present.map(([label, url]) => (
          <a
            key={label}
            href={href(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/[0.08] px-3.5 py-2 text-[11px] font-semibold transition hover:bg-fener-yellow hover:text-fener-navy"
          >
            {label} ↗
          </a>
        ))}
      </div>
    </section>
  )
}

function Fanart({ images }: { images?: string[] }) {
  if (!images || !images.length) return null
  return (
    <section>
      <SectionTitle>Fan art</SectionTitle>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="aspect-video w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function Kits({ kits }: { kits: Kit[] }) {
  if (!kits.length) return null
  return (
    <section>
      <SectionTitle>Kits</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {kits.map((k) => (
          <div
            key={`${k.season}-${k.type}`}
            className="rounded-xl border border-white/10 bg-fener-navy p-3 text-center"
          >
            <img
              src={k.image}
              alt={`${k.season} ${k.type} kit`}
              loading="lazy"
              className="mx-auto h-28 object-contain"
            />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/45">
              {k.season} · {k.type}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
