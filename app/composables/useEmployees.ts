import type { EmployeeDetail, EmployeeOption, EmployeeSummary } from '~/types/employees'
import type { Meeting } from '~/types/meetings'
import type { Project } from '~/types/projects'

export const useEmployees = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<EmployeeSummary[]>('/api/employees')
  const getById = (id: string) => apiFetch<EmployeeDetail>(`/api/employees/${id}`)
  const getOptions = () => apiFetch<EmployeeOption[]>('/api/employees/options')
  const getMeeting = (employeeId: string, meetingId: string) =>
    apiFetch<Meeting>(`/api/employees/${employeeId}/meetings/${meetingId}`)
  const getMeetingUpdates = (employeeId: string, meetingId: string) =>
    apiFetch<import('~/types/meetings').MeetingUpdate[]>(
      `/api/employees/${employeeId}/meetings/${meetingId}/updates`,
    )
  const getProject = (employeeId: string, projectId: string) =>
    apiFetch<Project>(`/api/employees/${employeeId}/projects/${projectId}`)

  return { list, getById, getOptions, getMeeting, getMeetingUpdates, getProject }
}
