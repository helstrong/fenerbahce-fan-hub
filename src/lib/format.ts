export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

// "Sun 30 Aug · 19:00" — the matchday stamp used on fixture cards and the
// countdown hero. Built from two calls rather than one because toLocaleString
// puts a comma between the date and the time that the design separates with a
// middot instead.
export const fmtMatchTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

// League position is shown as "2nd" rather than "#2", so it needs an ordinal
// suffix. 11th/12th/13th are the usual exceptions to the last-digit rule.
export const ordinal = (n: number) => {
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
}
