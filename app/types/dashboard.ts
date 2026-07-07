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
