export interface ApiProfile {
  full_name: string | null
  role: 'employee' | 'admin'
  employee_code: string | null
  job_title: string | null
  member_since?: string | null
  avatar_url?: string | null
  email?: string | null
  created_at?: string | null
}

export interface ProfileUpdateInput {
  full_name?: string
  employee_code?: string
  job_title?: string
  member_since?: string | null
  avatar_url?: string | null
}

export const useProfileApi = () => {
  const { apiFetch } = useApi()

  const get = () => apiFetch<ApiProfile>('/api/profile')
  const update = (body: ProfileUpdateInput) =>
    apiFetch<ApiProfile>('/api/profile', { method: 'PATCH', body })

  return { get, update }
}
