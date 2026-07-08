import type { AssignMeetingInput, Meeting, MeetingInput, MeetingUpdate } from '~/types/meetings'
import type { MeetingExportRow } from '~/utils/exportMeetingsExcel'

export const useMeetings = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<Meeting[]>('/api/meetings')
  const listPending = () => apiFetch<Meeting[]>('/api/meetings/pending')
  const exportAll = () => apiFetch<MeetingExportRow[]>('/api/meetings/export')
  const getById = (id: string) => apiFetch<Meeting>(`/api/meetings/${id}`)
  const create = (body: MeetingInput) =>
    apiFetch<Meeting>('/api/meetings', { method: 'POST', body })
  const assign = (body: AssignMeetingInput) =>
    apiFetch<Meeting>('/api/meetings/assign', { method: 'POST', body })
  const accept = (id: string) =>
    apiFetch<Meeting>(`/api/meetings/${id}/accept`, { method: 'PATCH' })
  const update = (id: string, body: MeetingInput) =>
    apiFetch<Meeting>(`/api/meetings/${id}`, { method: 'PUT', body })
  const listUpdates = (id: string) =>
    apiFetch<MeetingUpdate[]>(`/api/meetings/${id}/updates`)
  const createUpdate = (id: string, body: Partial<MeetingUpdate>) =>
    apiFetch<MeetingUpdate>(`/api/meetings/${id}/updates`, { method: 'POST', body })
  const updateUpdate = (id: string, updateId: string, body: Partial<MeetingUpdate>) =>
    apiFetch<MeetingUpdate>(`/api/meetings/${id}/updates/${updateId}`, {
      method: 'PUT',
      body,
    })
  const remove = (id: string) =>
    apiFetch<void>(`/api/meetings/${id}`, { method: 'DELETE' })

  return {
    list,
    listPending,
    exportAll,
    getById,
    create,
    assign,
    accept,
    update,
    listUpdates,
    createUpdate,
    updateUpdate,
    remove,
  }
}
