import type { DashboardOverview, PerformanceDashboard } from '~/types/dashboard'

export const useDashboard = () => {
  const { apiFetch } = useApi()

  const getOverview = () => apiFetch<DashboardOverview>('/api/dashboard/overview')
  const getStats = () => apiFetch<Record<string, number>>('/api/dashboard/stats')
  const getActivity = () =>
    apiFetch<Array<{ at: string; text: string }>>('/api/dashboard/activity')
  const getPerformance = (params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    const qs = query.toString()
    return apiFetch<PerformanceDashboard>(`/api/dashboard/performance${qs ? `?${qs}` : ''}`)
  }

  return { getOverview, getStats, getActivity, getPerformance }
}
