import type { DashboardOverview } from '~/types/dashboard'

export const useDashboard = () => {
  const { apiFetch } = useApi()

  const getOverview = () => apiFetch<DashboardOverview>('/api/dashboard/overview')
  const getStats = () => apiFetch<Record<string, number>>('/api/dashboard/stats')
  const getActivity = () =>
    apiFetch<Array<{ at: string; text: string }>>('/api/dashboard/activity')

  return { getOverview, getStats, getActivity }
}
