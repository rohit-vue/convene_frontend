import type { Meeting } from '~/types/meetings'

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
}

export interface ActivityItem {
  at: string
  text: string
}
