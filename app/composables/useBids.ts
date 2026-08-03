import type { UpworkBid, UpworkBidInput } from '~/types/bids'

export type HiringCheckResult = {
  bidId: string
  status: string
  totalHired: number | null
  invitesSent: number | null
  clientHired: boolean | null
  updated: boolean
}

export type HiringCheckSummary = {
  mode: string
  date?: string | null
  startedAt: string
  completedAt: string
  checked: number
  updated: number
  skipped: number
  unauthorized: number
  failed: number
  error?: string | null
  results?: HiringCheckResult[]
}

export const useBids = () => {
  const { apiFetch } = useApi()

  const list = (params?: { upwork_account?: string }) =>
    apiFetch<UpworkBid[]>('/api/bids', { query: params })

  const create = (body: UpworkBidInput) =>
    apiFetch<UpworkBid>('/api/bids', { method: 'POST', body })

  const update = (id: string, body: UpworkBidInput) =>
    apiFetch<UpworkBid>(`/api/bids/${id}`, { method: 'PATCH', body })

  const remove = (id: string) =>
    apiFetch<void>(`/api/bids/${id}`, { method: 'DELETE' })

  const runHiringCheckForDate = (date: string) =>
    apiFetch<HiringCheckSummary>('/api/upwork/hiring-check/run', {
      method: 'POST',
      query: { mode: 'daily', date },
    })

  return { list, create, update, remove, runHiringCheckForDate }
}
