// Shared project field options and label helpers.

export interface SelectOption {
  value: string
  label: string
}

export const jobTypeOptions: SelectOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'contract', label: 'Contract' },
]

export const jobCategoryOptions: SelectOption[] = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'ui_ux_design', label: 'UI/UX Design' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data_ai', label: 'Data / AI' },
  { value: 'qa_testing', label: 'QA / Testing' },
  { value: 'other', label: 'Other' },
]

export const projectStatusOptions: SelectOption[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function toLabelMap(options: SelectOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]))
}

const jobTypeLabelMap = toLabelMap(jobTypeOptions)
const jobCategoryLabelMap = toLabelMap(jobCategoryOptions)
const statusLabelMap = toLabelMap(projectStatusOptions)

export function jobTypeLabel(value?: string | null): string {
  return (value && jobTypeLabelMap[value]) || '—'
}

export function jobCategoryLabel(value?: string | null): string {
  return (value && jobCategoryLabelMap[value]) || '—'
}

export function projectStatusLabel(value?: string | null): string {
  return (value && statusLabelMap[value]) || '—'
}

export function formatHourlyRateLabel(value?: number | string | null): string {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return '—'
  return `${Number(digits).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}/hr`
}

export function formatMilestoneCostLabel(value?: number | string | null): string {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return '—'
  return Number(digits).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

type StatusHistoryEntry = {
  id: string
  to_status: string
  created_at: string
}

export function isFirstActiveStatusEntry(
  entry: StatusHistoryEntry,
  history: StatusHistoryEntry[],
): boolean {
  const activeEntries = history.filter((row) => row.to_status === 'active')
  if (!activeEntries.length) return false
  const first = [...activeEntries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0]
  return first.id === entry.id
}

export function formatStatusHistoryWhen(
  entry: StatusHistoryEntry,
  history: StatusHistoryEntry[],
  startDate?: string | null,
): string {
  if (
    entry.to_status === 'active' &&
    startDate &&
    isFirstActiveStatusEntry(entry, history)
  ) {
    const dateKey = String(startDate).slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      const date = new Date(`${dateKey}T12:00:00`)
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  if (!entry.created_at) return '—'
  return new Date(entry.created_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
