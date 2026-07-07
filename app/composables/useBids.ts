import type { UpworkBid, UpworkBidInput } from '~/types/bids'

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

  return { list, create, update, remove }
}
