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

export const upworkAccountOptions: SelectOption[] = [
  { value: 'ashutosh.excel2011@gmail.com', label: 'ashutosh.excel2011@gmail.com' },
  { value: 'sidharth.excel2011@gmail.com', label: 'sidharth.excel2011@gmail.com' },
  { value: 'rohit.excel2011@gmail.com', label: 'rohit.excel2011@gmail.com' },
  { value: 'vaibhav.excel2011@gmail.com', label: 'vaibhav.excel2011@gmail.com' },
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
const upworkAccountLabelMap = toLabelMap(upworkAccountOptions)
const outcomeLabelMap = toLabelMap(meetingOutcomeOptions)

export function projectTypeLabel(value?: string | null): string {
  return (value && projectTypeLabelMap[value]) || '—'
}

export function upworkAccountLabel(value?: string | null): string {
  return (value && upworkAccountLabelMap[value]) || '—'
}

export function meetingOutcomeLabel(value?: string | null): string {
  return (value && outcomeLabelMap[value]) || '—'
}
