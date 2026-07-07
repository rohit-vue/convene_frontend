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
  { value: 'Rohit K', label: 'Rohit K' },
  { value: 'Vaibhav Srivastav', label: 'Vaibhav Srivastav' },
  { value: 'Gulshan Khera', label: 'Gulshan Khera' },
  { value: 'Ashutosh Pandey', label: 'Ashutosh Pandey' },
]

export const meetingOutcomeOptions: SelectOption[] = [
  { value: 'won', label: 'Won' },
  { value: 'holding', label: 'Holding' },
  { value: 'others', label: 'Others' },
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

export const assignmentStatusOptions: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
]

const assignmentStatusLabelMap = toLabelMap(assignmentStatusOptions)

export function assignmentStatusLabel(value?: string | null): string {
  return (value && assignmentStatusLabelMap[value]) || '—'
}
