import type {
  DailyLogInput,
  Project,
  ProjectDailyLog,
  ProjectInput,
  ProjectMilestone,
  ProjectStatusHistoryEntry,
} from '~/types/projects'
import type { ProjectExportRow } from '~/utils/exportProjectsExcel'

export const useProjects = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<Project[]>('/api/projects')
  const exportAll = () => apiFetch<ProjectExportRow[]>('/api/projects/export')
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
  const getMilestones = (id: string) =>
    apiFetch<ProjectMilestone[]>(`/api/projects/${id}/milestones`)
  const addMilestone = (id: string, body: { amount: string; comment: string }) =>
    apiFetch<ProjectMilestone>(`/api/projects/${id}/milestones`, { method: 'POST', body })
  const getMilestoneCostHistory = (id: string) => getMilestones(id)
  const changeMilestoneCost = (id: string, body: { milestone_cost: string; comment: string }) =>
    addMilestone(id, { amount: body.milestone_cost, comment: body.comment })
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
  const getAdminMilestones = (employeeId: string, projectId: string) =>
    apiFetch<ProjectMilestone[]>(
      `/api/employees/${employeeId}/projects/${projectId}/milestones`,
    )
  const getAdminMilestoneCostHistory = (employeeId: string, projectId: string) =>
    getAdminMilestones(employeeId, projectId)
  const getAdminDailyLogs = (employeeId: string, projectId: string) =>
    apiFetch<ProjectDailyLog[]>(
      `/api/employees/${employeeId}/projects/${projectId}/daily-logs`,
    )

  return {
    list,
    exportAll,
    getById,
    create,
    update,
    remove,
    getStatusHistory,
    changeStatus,
    getMilestoneCostHistory,
    getMilestones,
    changeMilestoneCost,
    addMilestone,
    getDailyLogs,
    createDailyLog,
    updateDailyLog,
    getAdminProject,
    getAdminStatusHistory,
    getAdminMilestoneCostHistory,
    getAdminMilestones,
    getAdminDailyLogs,
  }
}
