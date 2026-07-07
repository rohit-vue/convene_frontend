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
