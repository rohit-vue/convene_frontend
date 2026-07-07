import * as XLSX from 'xlsx'
import {
  meetingOutcomeLabel,
  projectTypeLabel,
  upworkAccountLabel,
} from '~/utils/meetings'

export interface MeetingExportRow {
  employee_name?: string | null
  project_name?: string | null
  client_name?: string | null
  upwork_account?: string | null
  project_type?: string | null
  job_description?: string | null
  link_url?: string | null
  assignment_status?: string | null
  meeting_at?: string | null
  duration_minutes?: number | null
  meeting_outcome?: string | null
  budget_discussed?: string | null
  deadline?: string | null
  notes?: string | null
  requirements_discussed?: string | null
}

function toSheetRow(row: MeetingExportRow) {
  return {
    Employee: row.employee_name || '',
    'Project Name': row.project_name || '',
    'Client Name': row.client_name || '',
    'Upwork Account': upworkAccountLabel(row.upwork_account),
    'Upwork Project Type': projectTypeLabel(row.project_type),
    'Upwork Link': row.link_url || '',
    'Meeting Outcome': meetingOutcomeLabel(row.meeting_outcome),
    'Budget Discussed': row.budget_discussed || '',
    'Deadline / Expected Timeline': row.deadline || '',
  }
}

export function downloadMeetingsExcel(rows: MeetingExportRow[]) {
  const sheetData = rows.map(toSheetRow)
  const worksheet = XLSX.utils.json_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Meetings')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `meetings-${date}.xlsx`)
}
