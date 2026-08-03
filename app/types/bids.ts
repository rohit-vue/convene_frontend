export type BidStatus = 'applied' | 'canceled' | 'accepted' | 'invited'
export type BidJobType = 'fixed' | 'hourly'
export type BidCheckStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'NOT_FOUND'
  | 'INVALID_URL'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'

export interface UpworkBid {
  id: string
  upwork_account: string
  job_link: string
  bid_date: string
  status: BidStatus
  job_type?: BidJobType | null
  hourly_rate?: number | null
  fixed_amount?: number | null
  notes?: string | null
  created_by: string
  created_at: string
  client_hired?: boolean | null
  total_hired?: number | null
  invites_sent?: number | null
  last_checked_at?: string | null
  last_check_status?: BidCheckStatus | string | null
  upwork_job_id?: string | null
}

export interface UpworkBidInput {
  upwork_account: string
  job_link: string
  bid_date?: string
  status?: BidStatus
  job_type: BidJobType
  hourly_rate?: string | number
  fixed_amount?: string | number
  notes?: string
}

export interface UpworkBidDayGroup {
  date: string
  label: string
  bids: UpworkBid[]
  lastFetchedAt?: string | null
}
