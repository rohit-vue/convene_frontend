export interface DailyLogInput {
  log_date: string
  tasks_done: string
  tracker_minutes: number
}

export type AssignmentStatus = 'pending' | 'accepted' | 'declined'

export type ProjectAccessRole = 'owner' | 'shared_editor' | 'shared_viewer' | 'admin'

export interface ProjectAccess {
  role: ProjectAccessRole
  can_edit_project: boolean
  can_edit_logs: boolean
  is_shared: boolean
  share_id?: string | null
}

export interface ProjectShare {
  id: string
  project_id: string
  shared_with: string
  shared_by: string
  can_edit_logs: boolean
  created_at: string
  revoked_at?: string | null
  shared_with_name?: string | null
  shared_by_name?: string | null
}

export interface Project {
  id: string
  name: string
  client_name?: string | null
  status: string
  priority?: string | null
  start_date?: string | null
  due_date?: string | null
  job_description?: string | null
  description?: string | null
  requirements?: string | null
  job_category?: string | null
  job_type?: string | null
  hourly_rate?: number | null
  milestone_cost?: number | null
  upwork_account?: string | null
  link_url?: string | null
  notes?: string | null
  assigned_to?: string | null
  assignee_name?: string | null
  assignment_status?: AssignmentStatus | null
  accepted_at?: string | null
  created_by?: string
  created_at?: string
  updated_at?: string
  is_shared?: boolean
  can_edit_logs?: boolean
  share_id?: string | null
  access?: ProjectAccess
}

export interface ProjectStatusHistoryEntry {
  id: string
  from_status: string | null
  to_status: string
  comment: string
  changed_by: string
  changed_by_name?: string | null
  created_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  milestone_number: number
  amount: number
  comment: string
  status: 'active' | 'completed'
  created_by: string
  created_by_name?: string | null
  created_at: string
  completed_at?: string | null
}

/** @deprecated Use ProjectMilestone */
export type ProjectMilestoneCostHistoryEntry = ProjectMilestone

export interface ProjectDailyLog {
  id: string
  project_id: string
  log_date: string
  tasks_done: string
  tracker_minutes: number
  created_by: string
  updated_by?: string | null
  created_at: string
  updated_at?: string | null
  logged_by_name?: string | null
  updated_by_name?: string | null
}

export type ProjectInput = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>>

export interface AssignProjectInput {
  employee_id: string
  name: string
  client_name: string
  start_date?: string
  job_category?: string
  job_type?: string
  upwork_account?: string
  link_url?: string
}
