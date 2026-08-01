import type { Meeting } from '~/types/meetings'
import type { Project } from '~/types/projects'

export interface DashboardStats {
  meetings: number
  projects: number
  needsAttention: number
  employees?: number
}

export interface DashboardOverview {
  stats: DashboardStats
  projectStatusBreakdown: Record<string, number>
  meetingOutcomeBreakdown: Record<string, number>
  activity: Array<{ at: string; text: string }>
  pendingMeetings?: Meeting[]
  pendingProjects?: Project[]
}

export interface ActivityItem {
  at: string
  text: string
}

export interface PerformanceAccountWinRate {
  account: string
  won: number
  total: number
  rate: number
}

export interface PerformanceBidAcceptRate {
  account: string
  accepted: number
  total: number
  rate: number
}

export interface PerformanceHoursRow {
  project_id: string
  name: string
  client_name?: string | null
  status: string
  estimated_hours: number
  actual_hours: number
  variance_hours: number
}

export interface PerformanceSummary {
  meeting_win_rate: number | null
  meeting_won: number
  meeting_total: number
  bid_accept_rate: number | null
  bids_accepted: number
  bids_total: number
  avg_project_cycle_days: number | null
  cycle_sample_size: number
  projects_with_estimate: number
}

export interface PerformanceDashboard {
  filters: { from: string | null; to: string | null }
  summary: PerformanceSummary
  meeting_win_rate_by_account: PerformanceAccountWinRate[]
  bid_accept_rate_by_account: PerformanceBidAcceptRate[]
  avg_project_cycle_days: number | null
  cycle_sample_size: number
  hours_vs_estimate: PerformanceHoursRow[]
}

