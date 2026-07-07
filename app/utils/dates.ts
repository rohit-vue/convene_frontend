/** Extract unique YYYY-MM-DD keys from ISO date strings. */
export function collectDateKeys(values: Array<string | null | undefined>): string[] {
  const keys = new Set<string>()
  for (const value of values) {
    if (!value) continue
    const key = value.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) keys.add(key)
  }
  return [...keys]
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function todayDateKey(): string {
  return toLocalDateKey(new Date())
}

export function isFutureDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return value > todayDateKey()
}

export function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null
  }
  return date
}

export function isDateKeyBefore(value: string, min: string): boolean {
  return Boolean(min) && value < min
}

export function isDateKeyAfter(value: string, max: string): boolean {
  return Boolean(max) && value > max
}

export function isDateKeyDisabled(value: string, min = '', max = ''): boolean {
  return isDateKeyBefore(value, min) || isDateKeyAfter(value, max)
}

export type CalendarDayCell = {
  day: number
  dateKey: string
  outside: boolean
}

export function buildCalendarDays(year: number, month: number): CalendarDayCell[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const cells: CalendarDayCell[] = []

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    cells.push({
      day,
      dateKey: toLocalDateKey(new Date(prevYear, prevMonth, day)),
      outside: true,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      dateKey: toLocalDateKey(new Date(year, month, day)),
      outside: false,
    })
  }

  let nextDay = 1
  while (cells.length % 7 !== 0) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    cells.push({
      day: nextDay,
      dateKey: toLocalDateKey(new Date(nextYear, nextMonth, nextDay)),
      outside: true,
    })
    nextDay += 1
  }

  return cells
}

/** Convert ISO timestamp to YYYY-MM-DDTHH:mm for datetime pickers. */
export function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateKeyDisplay(value: string, placeholder: string): string {
  if (!value) return placeholder
  const date = parseDateKey(value)
  if (!date) return placeholder
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTimeInputDisplay(value: string, placeholder: string): string {
  if (!value) return placeholder
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return placeholder
  const date = parseDateKey(`${match[1]}-${match[2]}-${match[3]}`)
  if (!date) return placeholder
  const time = `${match[4]}:${match[5]}`
  return `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · ${time}`
}

export function formatTimeDisplay(value: string, placeholder: string): string {
  if (!value) return placeholder
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return placeholder
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function getPanelWidth(): number {
  if (typeof window === 'undefined') return 288
  return Math.min(288, window.innerWidth - 16)
}
