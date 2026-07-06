import type { Meeting } from '~/types/meetings'
import type { Project } from '~/types/projects'
import type { EmployeeSummary } from '~/types/employees'

export interface SearchResults {
  meetings: Meeting[]
  projects: Project[]
  employees: EmployeeSummary[]
}

export const useSearch = () => {
  const { apiFetch } = useApi()

  const search = (query: string) =>
    apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`)

  return { search }
}
