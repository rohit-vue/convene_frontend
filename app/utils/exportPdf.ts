import type { UpworkBid } from '~/types/bids'
import type { Meeting } from '~/types/meetings'
import type { AdminDailyLog, Project } from '~/types/projects'
import {
  bidJobTypeLabel,
  bidStatusLabel,
  formatBidAmount,
} from '~/utils/bids'
import {
  assignmentStatusLabel,
  upworkAccountLabel,
} from '~/utils/meetings'
import {
  jobTypeLabel,
  projectStatusLabel,
} from '~/utils/projects'

export type PdfTableColumn = {
  header: string
  /** Relative width hint for autoTable (optional). */
  width?: number
}

export type ExportTablePdfOptions = {
  title: string
  subtitle?: string
  filename: string
  columns: PdfTableColumn[]
  rows: string[][]
  orientation?: 'portrait' | 'landscape'
}

const MAX_CELL_LENGTH = 500

function assertClient() {
  if (!import.meta.client) {
    throw new Error('PDF export is only available in the browser.')
  }
}

function sanitizeCell(value: unknown): string {
  if (value == null) return '—'
  let text = String(value).replace(/\s+/g, ' ').trim()
  if (!text) return '—'
  if (text.length > MAX_CELL_LENGTH) {
    text = `${text.slice(0, MAX_CELL_LENGTH - 1)}…`
  }
  return text
}

function todayFileStamp(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDateOnly(value?: string | null): string {
  if (!value) return '—'
  const key = value.slice(0, 10)
  const [year, month, day] = key.split('-').map(Number)
  if (!year || !month || !day) return '—'
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTrackerMinutes(minutes?: number | null): string {
  const total = Number(minutes) || 0
  if (total <= 0) return '0h'
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}

function safeFilename(name: string): string {
  return name
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code < 32 || '<>:"/\\|?*'.includes(ch)) return '-'
      if (/\s/.test(ch)) return '-'
      return ch
    })
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

/**
 * Generate and download a landscape/portrait PDF table.
 * Uses dynamic imports so Nuxt SSR never loads jsPDF.
 */
export async function exportTablePdf(options: ExportTablePdfOptions): Promise<void> {
  assertClient()

  const columns = options.columns || []
  const rows = options.rows || []

  if (!columns.length) {
    throw new Error('Nothing to export: missing columns.')
  }
  if (!rows.length) {
    throw new Error('Nothing to export: no rows match the current filters.')
  }

  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const orientation = options.orientation || 'landscape'
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 36
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(30, 41, 59)
  doc.text(options.title, marginX, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)

  const metaParts = [
    options.subtitle,
    `${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`,
    `Generated ${generatedAt}`,
  ].filter(Boolean)
  doc.text(metaParts.join(' · '), marginX, 56)

  const head = [columns.map((c) => c.header)]
  const body = rows.map((row) =>
    columns.map((_, index) => sanitizeCell(row[index])),
  )

  const columnStyles: Record<number, { cellWidth?: number | 'auto' | 'wrap' }> = {}
  const widths = columns.map((c) => c.width).filter((w): w is number => typeof w === 'number' && w > 0)
  if (widths.length === columns.length) {
    const usable = pageWidth - marginX * 2
    const total = widths.reduce((sum, w) => sum + w, 0)
    columns.forEach((_, index) => {
      columnStyles[index] = { cellWidth: (usable * widths[index]) / total }
    })
  }

  autoTable(doc, {
    head,
    body,
    startY: 68,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 5,
      overflow: 'linebreak',
      valign: 'top',
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    margin: { left: marginX, right: marginX, top: 48, bottom: 40 },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('Convene', marginX, pageHeight - 18)
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - marginX,
      pageHeight - 18,
      { align: 'right' },
    )
  }

  const baseName = safeFilename(options.filename)
  const filename = baseName.toLowerCase().endsWith('.pdf') ? baseName : `${baseName}.pdf`

  doc.save(filename)
}

export async function exportMeetingsPdf(meetings: Meeting[]): Promise<void> {
  await exportTablePdf({
    title: 'Meetings',
    subtitle: 'Admin export',
    filename: `convene-meetings-${todayFileStamp()}.pdf`,
    orientation: 'landscape',
    columns: [
      { header: 'Project', width: 18 },
      { header: 'Client', width: 14 },
      { header: 'Employee', width: 14 },
      { header: 'Upwork account', width: 14 },
      { header: 'Date & time', width: 16 },
      { header: 'Status', width: 10 },
    ],
    rows: meetings.map((m) => [
      m.project_name || '—',
      m.client_name || '—',
      m.employee_name || '—',
      upworkAccountLabel(m.upwork_account),
      formatDateTime(m.meeting_at),
      assignmentStatusLabel(m.assignment_status),
    ]),
  })
}

export async function exportProjectsPdf(projects: Project[]): Promise<void> {
  await exportTablePdf({
    title: 'Projects',
    subtitle: 'Admin export',
    filename: `convene-projects-${todayFileStamp()}.pdf`,
    orientation: 'landscape',
    columns: [
      { header: 'Project', width: 18 },
      { header: 'Client', width: 14 },
      { header: 'Employee', width: 14 },
      { header: 'Assignment', width: 10 },
      { header: 'Status', width: 10 },
      { header: 'Start date', width: 12 },
      { header: 'Project type', width: 10 },
    ],
    rows: projects.map((p) => [
      p.name || '—',
      p.client_name || '—',
      p.assignee_name || '—',
      assignmentStatusLabel(p.assignment_status),
      projectStatusLabel(p.status),
      formatDateOnly(p.start_date),
      jobTypeLabel(p.job_type),
    ]),
  })
}

export async function exportBidsPdf(bids: UpworkBid[]): Promise<void> {
  await exportTablePdf({
    title: 'Upwork Bids',
    subtitle: 'Admin export',
    filename: `convene-bids-${todayFileStamp()}.pdf`,
    orientation: 'landscape',
    columns: [
      { header: 'Bid date', width: 10 },
      { header: 'Upwork account', width: 12 },
      { header: 'Job link', width: 22 },
      { header: 'Status', width: 8 },
      { header: 'Project type', width: 8 },
      { header: 'Amount', width: 8 },
      { header: 'Notes', width: 16 },
      { header: 'Added at', width: 12 },
    ],
    rows: bids.map((bid) => [
      formatDateOnly(bid.bid_date || bid.created_at),
      upworkAccountLabel(bid.upwork_account),
      bid.job_link || '—',
      bidStatusLabel(bid.status),
      bidJobTypeLabel(bid.job_type),
      formatBidAmount(bid),
      bid.notes || '—',
      formatDateTime(bid.created_at),
    ]),
  })
}

export async function exportDailyLogsPdf(logs: AdminDailyLog[]): Promise<void> {
  await exportTablePdf({
    title: 'Daily Logs',
    subtitle: 'Admin export',
    filename: `convene-daily-logs-${todayFileStamp()}.pdf`,
    orientation: 'landscape',
    columns: [
      { header: 'Date', width: 12 },
      { header: 'Employee', width: 12 },
      { header: 'Project', width: 16 },
      { header: 'Client', width: 12 },
      { header: 'Tasks done', width: 34 },
      { header: 'Tracker', width: 8 },
    ],
    rows: logs.map((entry) => [
      formatDateOnly(entry.log_date),
      entry.logged_by_name || '—',
      entry.project_name || '—',
      entry.client_name || '—',
      entry.tasks_done || '—',
      entry.job_type === 'hourly' ? formatTrackerMinutes(entry.tracker_minutes) : '—',
    ]),
  })
}
