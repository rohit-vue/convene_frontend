import type { AdminTimeEntry, ManualTimeEntryInput, TimeEntry } from '~/types/timeTracking'

export const useTimeTracking = () => {
  const { apiFetch } = useApi()

  const list = (query: { from?: string; to?: string; limit?: number } = {}) =>
    apiFetch<TimeEntry[]>('/api/time-tracking', { query })
  const listAdmin = (query: { employee_id?: string; from?: string; to?: string; limit?: number } = {}) =>
    apiFetch<AdminTimeEntry[]>('/api/time-tracking/admin', { query })
  const today = () => apiFetch<TimeEntry>('/api/time-tracking/today')
  const startWork = () => apiFetch<TimeEntry>('/api/time-tracking/work/start', { method: 'POST' })
  const stopWork = () => apiFetch<TimeEntry>('/api/time-tracking/work/stop', { method: 'POST' })
  const startLunch = () => apiFetch<TimeEntry>('/api/time-tracking/lunch/start', { method: 'POST' })
  const stopLunch = () => apiFetch<TimeEntry>('/api/time-tracking/lunch/stop', { method: 'POST' })
  const upsertManual = (body: ManualTimeEntryInput) =>
    apiFetch<TimeEntry>('/api/time-tracking/manual', { method: 'POST', body })
  const updateManual = (id: string, body: ManualTimeEntryInput) =>
    apiFetch<TimeEntry>(`/api/time-tracking/${id}`, { method: 'PATCH', body })

  return {
    list,
    listAdmin,
    today,
    startWork,
    stopWork,
    startLunch,
    stopLunch,
    upsertManual,
    updateManual,
  }
}
