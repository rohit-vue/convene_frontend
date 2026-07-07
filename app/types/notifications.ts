export interface Notification {
  id: string
  type: string
  title: string
  body?: string | null
  meeting_id?: string | null
  read_at?: string | null
  created_at: string
}
