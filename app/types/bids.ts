export type BidStatus = 'applied' | 'canceled' | 'accepted'
export type BidJobType = 'fixed' | 'hourly'

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
}
