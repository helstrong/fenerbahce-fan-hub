import { Card, SectionTitle } from '../components/Card'
import type { AppData, ClubProfile, Kit } from '../data/types'

const href = (url?: string) => (url ? (/^https?:\/\//.test(url) ? url : `https://${url}`) : undefined)

export default function Club({ data }: { data: AppData }) {
  const club = data.club

  if (!club) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-fener-navy">Club</h1>
        <p className="text-sm text-slate-400">Club information is unavailable right now.</p>
      </div>
    )
  }

  const facts: [string, string][] = []
  if (club.formedYear) facts.push(['Founded', club.formedYear])
  if (club.stadium) facts.push(['Stadium', club.stadium])
  if (club.capacity) facts.push(['Capacity', Number(club.capacity).toLocaleString()])
  if (club.location) facts.push(['Location', club.location])
  if (club.country) facts.push(['Country', club.country])
  if (club.nicknames) facts.push(['Nicknames', club.nicknames])

  return (
    <div className="space-y-6">
      <Hero club={club} />

      {club.description && (
        <Card>
          <SectionTitle>About</SectionTitle>
          <p className="text-sm leading-relaxed text-slate-600">{club.description}</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {facts.length > 0 && (
          <Card>
            <SectionTitle>Club facts</SectionTitle>
            <dl className="space-y-2">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-sm">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="truncate text-right font-medium text-fener-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        {club.competitions && club.competitions.length > 0 && (
          <Card>
            <SectionTitle>Competes in</SectionTitle>
            <ul className="space-y-2">
              {club.competitions.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-fener-yellow-dark" />
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Socials club={club} />
      <Fanart images={club.fanart} />
      <Kits kits={data.kits} />
    </div>
  )
}

function Hero({ club }: { club: ClubProfile }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-fener-navy text-white shadow-lg">
      {club.banner && (
        <img src={club.banner} alt="" className="h-32 w-full object-cover opacity-80 sm:h-44" />
      )}
      <div className="flex items-center gap-4 p-5">
        {club.badge && (
          <img
            src={club.badge}
            alt={`${club.name} crest`}
            className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{club.name}</h1>
          {club.altName && <p className="text-sm text-fener-yellow">{club.altName}</p>}
          {club.formedYear && <p className="text-xs text-white/70">Est. {club.formedYear}</p>}
        </div>
      </div>
    </section>
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
    <Card>
      <SectionTitle>Official links</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {present.map(([label, url]) => (
          <a
            key={label}
            href={href(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-fener-navy transition hover:bg-fener-yellow"
          >
            {label} ↗
          </a>
        ))}
      </div>
    </Card>
  )
}

function Fanart({ images }: { images?: string[] }) {
  if (!images || !images.length) return null
  return (
    <div>
      <SectionTitle>Fan art</SectionTitle>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="aspect-video w-full rounded-xl object-cover shadow-sm"
          />
        ))}
      </div>
    </div>
  )
}

function Kits({ kits }: { kits: Kit[] }) {
  if (!kits.length) return null
  return (
    <div>
      <SectionTitle>Kits</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {kits.map((k) => (
          <div key={`${k.season}-${k.type}`} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
            <img src={k.image} alt={`${k.season} ${k.type} kit`} loading="lazy" className="mx-auto h-32 object-contain" />
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              {k.season} · {k.type}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
