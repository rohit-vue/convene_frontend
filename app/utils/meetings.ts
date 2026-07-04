// Shared meeting field options and label helpers.
// Auto-imported by Nuxt across components/pages so the enums live in one place.

export interface SelectOption {
  value: string
  label: string
}

export const projectTypeOptions: SelectOption[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'milestone', label: 'Milestone' },
]

export const meetingStatusOptions: SelectOption[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_response', label: 'No response' },
]

export const meetingOutcomeOptions: SelectOption[] = [
  { value: 'won', label: 'Won' },
  { value: 'holding', label: 'Holding' },
  { value: 'not_selected', label: 'Not selected' },
  { value: 'follow_up_required', label: 'Follow-up required' },
  { value: 'pending_reply', label: 'Pending reply' },
]

function toLabelMap(options: SelectOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]))
}

const projectTypeLabelMap = toLabelMap(projectTypeOptions)
const statusLabelMap = toLabelMap(meetingStatusOptions)
const outcomeLabelMap = toLabelMap(meetingOutcomeOptions)

export function projectTypeLabel(value?: string | null): string {
  return (value && projectTypeLabelMap[value]) || '—'
}

export function meetingStatusLabel(value?: string | null): string {
  return (value && statusLabelMap[value]) || '—'
}

export function meetingOutcomeLabel(value?: string | null): string {
  return (value && outcomeLabelMap[value]) || '—'
}
