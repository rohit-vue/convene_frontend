export interface TimeSegment {
  start: string
  end: string | null
}

export interface TimeEntry {
  id: string | null
  user_id: string | null
  work_date: string
  work_segments: TimeSegment[]
  lunch_segments: TimeSegment[]
  work_minutes: number
  lunch_minutes: number
  total_minutes: number
  is_working: boolean
  is_on_lunch: boolean
  created_at: string | null
  updated_at: string | null
}

export interface ManualTimeEntryInput {
  work_date: string
  work_minutes: number
  lunch_minutes: number
}

export interface AdminTimeEntry extends TimeEntry {
  employee_name?: string | null
}
