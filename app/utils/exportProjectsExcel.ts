import * as XLSX from 'xlsx'
import { upworkAccountLabel } from '~/utils/meetings'
import {
  formatMilestoneCostLabel,
  jobCategoryLabel,
  jobTypeLabel,
  projectStatusLabel,
} from '~/utils/projects'

export interface ProjectExportRow {
  employee_name?: string | null
  project_name?: string | null
  client_name?: string | null
  upwork_account?: string | null
  job_type?: string | null
  price?: number | null
  job_category?: string | null
  link_url?: string | null
  status?: string | null
  start_date?: string | null
  due_date?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPriceForExcel(value?: number | null) {
  const formatted = formatMilestoneCostLabel(value)
  return formatted === '—' ? '' : formatted
}

function toSheetRow(row: ProjectExportRow) {
  return {
    Employee: row.employee_name || '',
    'Project Name': row.project_name || '',
    'Client Name': row.client_name || '',
    'Upwork Account': upworkAccountLabel(row.upwork_account),
    'Upwork Link': row.link_url || '',
    'Job Type': jobTypeLabel(row.job_type),
    Price: formatPriceForExcel(row.price),
    'Job Category': jobCategoryLabel(row.job_category),
    Status: projectStatusLabel(row.status),
    'Start Date': formatDate(row.start_date),
  }
}

export function downloadProjectsExcel(rows: ProjectExportRow[]) {
  const sheetData = rows.map(toSheetRow)
  const worksheet = XLSX.utils.json_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `projects-${date}.xlsx`)
}
