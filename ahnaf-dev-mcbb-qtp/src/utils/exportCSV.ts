import { ColumnDef } from '../columns'
import { DonorRecord } from '../types'

export function exportCSV(records: DonorRecord[], cols: ColumnDef[]): void {
  const headers = cols.map(c => `"${c.label}"`).join(',')
  const rows = records.map(r =>
    cols.map(c => `"${String(c.selector(r)).replace(/"/g, '""')}"`).join(',')
  )
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `brain_bank_export_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
