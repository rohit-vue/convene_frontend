export interface DailyLogInput {
  log_date: string
  tasks_done: string
  tracker_minutes: number
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
  upwork_account?: string | null
  link_url?: string | null
  notes?: string | null
  assigned_to?: string | null
  assignee_name?: string | null
  created_by?: string
  created_at?: string
  updated_at?: string
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
