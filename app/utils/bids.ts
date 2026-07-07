import type { UpworkBid, UpworkBidDayGroup } from '~/types/bids'
import { toLocalDateKey, todayDateKey } from '~/utils/dates'
import { formatBudgetLabel } from '~/utils/meetings'

export interface SelectOption {
  value: string
  label: string
}

export const bidStatusOptions: SelectOption[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'accepted', label: 'Accepted' },
]

export const bidJobTypeOptions: SelectOption[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'hourly', label: 'Hourly' },
]

const bidStatusLabelMap = Object.fromEntries(bidStatusOptions.map((o) => [o.value, o.label]))
const bidJobTypeLabelMap = Object.fromEntries(bidJobTypeOptions.map((o) => [o.value, o.label]))

export function bidStatusLabel(value?: string | null): string {
  return (value && bidStatusLabelMap[value]) || '—'
}

export function bidJobTypeLabel(value?: string | null): string {
  return (value && bidJobTypeLabelMap[value]) || '—'
}

export function bidStatusBadgeClass(value?: string | null): string {
  if (value === 'accepted') return 'bg-emerald-50 text-emerald-700'
  if (value === 'canceled') return 'bg-red-50 text-red-600'
  return 'bg-indigo-50 text-indigo-700'
}

export function formatBidAmount(bid: UpworkBid): string {
  if (bid.job_type === 'hourly') {
    return bid.hourly_rate != null ? `${formatBudgetLabel(String(bid.hourly_rate))}/hr` : '—'
  }
  if (bid.job_type === 'fixed') {
    return bid.fixed_amount != null ? formatBudgetLabel(String(bid.fixed_amount)) : '—'
  }
  return '—'
}

function yesterdayDateKey(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return toLocalDateKey(date)
}

export function formatBidDayLabel(dateKey: string): string {
  if (dateKey === todayDateKey()) return 'Today'
  if (dateKey === yesterdayDateKey()) return 'Yesterday'

  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function groupBidsByDay(bids: UpworkBid[]): UpworkBidDayGroup[] {
  const byDate = new Map<string, UpworkBid[]>()

  for (const bid of bids) {
    const key = bid.bid_date?.slice(0, 10) || bid.created_at.slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(bid)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatBidDayLabel(date),
      bids: items,
    }))
}
