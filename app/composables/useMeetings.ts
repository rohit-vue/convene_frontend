import type { Meeting, MeetingInput, MeetingUpdate } from '~/types/meetings'

export const useMeetings = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<Meeting[]>('/api/meetings')
  const getById = (id: string) => apiFetch<Meeting>(`/api/meetings/${id}`)
  const create = (body: MeetingInput) =>
    apiFetch<Meeting>('/api/meetings', { method: 'POST', body })
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

  return {
    list,
    getById,
    create,
    update,
    listUpdates,
    createUpdate,
    updateUpdate,
  }
}
