import React, { useState, useEffect } from 'react'
import _DataTableLib, { createTheme } from 'react-data-table-component'
const DataTableLib = (_DataTableLib as any).default ?? _DataTableLib
import { DonorRecord } from '../types'
import { ALL_COLUMNS, ColumnKey } from '../columns'
import './DataTable.css'

createTheme('brainBank', {
  background:       { default: 'transparent' },
  text:             { primary: '#c4cdd6', secondary: '#6b7d8e' },
  divider:          { default: 'rgba(255,255,255,0.05)' },
  highlightOnHover: { default: 'rgba(255,255,255,0.03)', text: '#e8edf2' },
  sortFocus:        { default: '#0068b1' },
  striped:          { default: 'rgba(255,255,255,0.02)', text: '#c4cdd6' },
})

const PER_PAGE_OPTIONS = [10, 15, 25, 50]

const braakColor = (s: number) => s >= 5 ? 'high' : s >= 3 ? 'mid' : 'low'
const thalColor  = (p: number) => p >= 4 ? 'high' : p >= 2 ? 'mid' : 'low'

const CUSTOM_CELLS: Partial<Record<ColumnKey, (row: DonorRecord) => React.ReactNode>> = {
  BraakStage: r => (
    <span className={`dt-badge dt-badge--${braakColor(r.BraakStage ?? 0)}`}>{r.BraakStage ?? '—'}</span>
  ),
  ThalPhase: r => (
    <span className={`dt-badge dt-badge--${thalColor(r.ThalPhase ?? 0)}`}>{r.ThalPhase ?? '—'}</span>
  ),
  FrozenTissueAvailable: r => r.FrozenTissueAvailable
    ? <span className='dt-pill dt-pill--frozen'>Frozen</span>
    : <span className='dt-dim'>—</span>,
  FixedTissueAvailable: r => r.FixedTissueAvailable
    ? <span className='dt-pill dt-pill--ffpe'>FFPE</span>
    : <span className='dt-dim'>—</span>,
}

type ServerSideProps = {
  total: number
  page: number
  totalPages: number
  perPage: number
  onPageChange: (p: number) => void
  onPerPageChange: (n: number) => void
  loading?: boolean
}

type Props = {
  data: DonorRecord[]
  visibleColumns: Record<ColumnKey, boolean>
  onOpenColumns: () => void
  onRowClick?: (row: DonorRecord) => void
  selectedId?: string
  emptyMessage?: string
  server?: ServerSideProps
}

const DataTable: React.FC<Props> = ({
  data, visibleColumns, onOpenColumns, onRowClick, selectedId,
  emptyMessage = 'No records match the current filters',
  server,
}) => {
  const [localPage,    setLocalPage]    = useState(1)
  const [localPerPage, setLocalPerPage] = useState(15)

  useEffect(() => { if (!server) setLocalPage(1) }, [data, server])

  const page       = server ? server.page       : localPage
  const perPage    = server ? server.perPage    : localPerPage
  const totalPages = server ? server.totalPages : Math.max(1, Math.ceil(data.length / localPerPage))
  const total      = server ? server.total      : data.length
  const displayData = server ? data : data.slice((localPage - 1) * localPerPage, localPage * localPerPage)
  const loading    = server?.loading ?? false

  const goTo = (p: number) => server ? server.onPageChange(p) : setLocalPage(p)
  const changePerPage = (n: number) => {
    if (server) { server.onPerPageChange(n); server.onPageChange(1) }
    else        { setLocalPerPage(n); setLocalPage(1) }
  }

  const columns = ALL_COLUMNS
    .filter(col => visibleColumns[col.key])
    .map(col => ({
      name:     col.label,
      selector: col.selector,
      sortable: col.sortable ?? false,
      ...(CUSTOM_CELLS[col.key] ? { cell: CUSTOM_CELLS[col.key] } : {}),
    }))

  return (
    <div className='dt-wrapper'>
      <div className='dt-bar'>
        <div className='dt-bar-left'>
          {total > 0 && (
            <span className='dt-record-count'>
              {total} record{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className='dt-bar-center'>
          {total > 0 && <>
            <button className='dt-pag-btn' onClick={() => goTo(1)}          disabled={page === 1}>«</button>
            <button className='dt-pag-btn' onClick={() => goTo(page - 1)}   disabled={page === 1}>‹</button>
            <span className='dt-pag-info'>Page {page} of {totalPages}</span>
            <button className='dt-pag-btn' onClick={() => goTo(page + 1)}   disabled={page === totalPages}>›</button>
            <button className='dt-pag-btn' onClick={() => goTo(totalPages)}  disabled={page === totalPages}>»</button>
          </>}
        </div>
        <div className='dt-bar-right'>
          <select className='dt-perpage' value={perPage} onChange={e => changePerPage(Number(e.target.value))}>
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} rows</option>)}
          </select>
          <button className='dt-columns-btn' onClick={onOpenColumns}>Columns</button>
        </div>
      </div>
      <div className={`dt-scroll${loading ? ' dt-loading' : ''}`}>
        <DataTableLib
          columns={columns}
          data={displayData}
          theme="brainBank"
          striped
          highlightOnHover
          pointerOnHover
          onRowClicked={(row: DonorRecord) => onRowClick?.(row)}
          conditionalRowStyles={[{
            when: (row: DonorRecord) => row._id === selectedId,
            style: { background: 'rgba(0, 104, 177, 0.10) !important' },
          }]}
          noDataComponent={<span className='dt-empty'>{emptyMessage}</span>}
        />
      </div>
    </div>
  )
}

export default DataTable
