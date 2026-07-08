import * as XLSX from 'xlsx'
import type { UpworkBid } from '~/types/bids'
import {
  bidJobTypeLabel,
  bidStatusLabel,
  formatBidAmount,
} from '~/utils/bids'
import { upworkAccountLabel } from '~/utils/meetings'

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function toSheetRow(bid: UpworkBid) {
  const amount = formatBidAmount(bid)
  return {
    'Upwork Account': upworkAccountLabel(bid.upwork_account),
    'Job Link': bid.job_link || '',
    Status: bidStatusLabel(bid.status),
    'Project Type': bidJobTypeLabel(bid.job_type),
    Amount: amount === '—' ? '' : amount,
    Notes: bid.notes || '',
    'Bid Date': formatDate(bid.bid_date),
    'Added At': formatDateTime(bid.created_at),
  }
}

export function downloadBidsExcel(rows: UpworkBid[]) {
  const sheetData = rows.map(toSheetRow)
  const worksheet = XLSX.utils.json_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bids')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `upwork-bids-${date}.xlsx`)
}
