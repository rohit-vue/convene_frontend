import type { UpworkBid, UpworkBidInput } from '~/types/bids'

export const useBids = () => {
  const { apiFetch } = useApi()

  const list = (params?: { upwork_account?: string }) =>
    apiFetch<UpworkBid[]>('/api/bids', { query: params })

  const create = (body: UpworkBidInput) =>
    apiFetch<UpworkBid>('/api/bids', { method: 'POST', body })

  return { list, create }
}
