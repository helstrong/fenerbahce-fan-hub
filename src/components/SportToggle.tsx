import { useLocation, useNavigate } from 'react-router-dom'
import { useSport } from '../data/SportContext'
import { SPORT_LIST } from '../data/sports'
import { useI18n } from '../i18n/I18nContext'
import Icon from './Icon'

// Football ⇄ basketball. A segmented switch with a yellow thumb that slides
// between the two, rather than tabs, because it changes what every screen is
// about rather than navigating anywhere: you stay on the tab you're on and only
// the content under it changes.
export default function SportToggle() {
  const { sport, setSport } = useSport()
  const { t } = useI18n()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const index = SPORT_LIST.indexOf(sport)

  const choose = (next: typeof sport) => {
    if (next === sport) return
    setSport(next)
    // The one screen that can't carry over: a head-to-head page is about a
    // club from the other sport, so it steps back to that sport's tables.
    if (pathname.startsWith('/opponent/')) navigate('/standings')
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('chrome.sport')}
      className="relative grid min-w-0 shrink grid-cols-2 rounded-full border border-white/10 bg-white/[0.07] p-[3px]"
    >
      {/* The thumb: one element that slides, so the switch reads as a single
          control moving between two positions rather than two buttons. */}
      <span
        aria-hidden="true"
        className="absolute bottom-[3px] left-[3px] top-[3px] w-[calc(50%-3px)] rounded-full bg-fener-yellow shadow-[0_2px_10px_rgba(255,237,0,0.25)] transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${index * 100}%)` }}
      />

      {SPORT_LIST.map((s) => {
        const active = s === sport
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(s)}
            className={`relative z-10 flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-1.5 font-display text-[13px] font-bold uppercase tracking-[0.04em] max-[359px]:px-1.5 max-[359px]:text-[11px] transition-colors duration-300 sm:gap-1.5 sm:px-3.5 sm:tracking-[0.1em] ${
              active ? 'text-fener-navy' : 'text-white/60 hover:text-white'
            }`}
          >
            {/* On the narrowest phones the label matters more than the icon. */}
            <Icon name={s} className="hidden h-3.5 w-3.5 shrink-0 min-[385px]:block" />
            <span className="truncate">{t(`sport.${s}`)}</span>
          </button>
        )
      })}
    </div>
  )
}
