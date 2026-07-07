export type AssignmentStatus = 'pending' | 'accepted' | 'declined'

export interface Meeting {
  id: string
  project_name: string
  client_name: string
  employee_id?: string | null
  employee_name?: string | null
  project_type?: string | null
  upwork_account?: string | null
  job_description?: string | null
  link_url?: string | null
  meeting_at?: string | null
  duration_minutes?: number | null
  meeting_outcome?: string | null
  budget_discussed?: string | null
  deadline?: string | null
  notes?: string | null
  requirements_discussed?: string | null
  assignment_status?: AssignmentStatus | null
  accepted_at?: string | null
  latest_update_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface MeetingUpdate {
  id: string
  meeting_id: string
  meeting_at: string
  duration_minutes?: number | null
  meeting_outcome: string
  budget_discussed?: string | null
  deadline?: string | null
  notes?: string | null
  requirements_discussed?: string | null
  created_at?: string
  updated_at?: string
}

export type MeetingInput = Partial<Meeting>

export interface AssignMeetingInput {
  employee_id: string
  project_name: string
  client_name: string
  upwork_account?: string
  meeting_at: string
}
