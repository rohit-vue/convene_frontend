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
