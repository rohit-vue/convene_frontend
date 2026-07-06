import type {
  DailyLogInput,
  Project,
  ProjectDailyLog,
  ProjectInput,
  ProjectStatusHistoryEntry,
} from '~/types/projects'

export const useProjects = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<Project[]>('/api/projects')
  const getById = (id: string) => apiFetch<Project>(`/api/projects/${id}`)
  const create = (body: ProjectInput) =>
    apiFetch<Project>('/api/projects', { method: 'POST', body })
  const update = (id: string, body: ProjectInput) =>
    apiFetch<Project>(`/api/projects/${id}`, { method: 'PATCH', body })
  const remove = (id: string) =>
    apiFetch<void>(`/api/projects/${id}`, { method: 'DELETE' })
  const getStatusHistory = (id: string) =>
    apiFetch<ProjectStatusHistoryEntry[]>(`/api/projects/${id}/status-history`)
  const changeStatus = (id: string, body: { status: string; comment: string }) =>
    apiFetch<Project>(`/api/projects/${id}/status`, { method: 'POST', body })
  const getDailyLogs = (id: string) =>
    apiFetch<ProjectDailyLog[]>(`/api/projects/${id}/daily-logs`)
  const createDailyLog = (id: string, body: DailyLogInput) =>
    apiFetch<ProjectDailyLog>(`/api/projects/${id}/daily-logs`, { method: 'POST', body })
  const updateDailyLog = (id: string, logId: string, body: DailyLogInput) =>
    apiFetch<ProjectDailyLog>(`/api/projects/${id}/daily-logs/${logId}`, {
      method: 'PUT',
      body,
    })

  const getAdminProject = (employeeId: string, projectId: string) =>
    apiFetch<Project>(`/api/employees/${employeeId}/projects/${projectId}`)
  const getAdminStatusHistory = (employeeId: string, projectId: string) =>
    apiFetch<ProjectStatusHistoryEntry[]>(
      `/api/employees/${employeeId}/projects/${projectId}/status-history`,
    )
  const getAdminDailyLogs = (employeeId: string, projectId: string) =>
    apiFetch<ProjectDailyLog[]>(
      `/api/employees/${employeeId}/projects/${projectId}/daily-logs`,
    )

  return {
    list,
    getById,
    create,
    update,
    remove,
    getStatusHistory,
    changeStatus,
    getDailyLogs,
    createDailyLog,
    updateDailyLog,
    getAdminProject,
    getAdminStatusHistory,
    getAdminDailyLogs,
  }
}
