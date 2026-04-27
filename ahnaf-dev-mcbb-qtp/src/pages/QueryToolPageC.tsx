import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import FilterComp from '../components/FilterComp'
import NavBar from '../components/NavBar'
import DataTable from '../components/DataTable'
import PreferencesPanel from '../components/PreferencesPanel'
import RecordDrawer from '../components/RecordDrawer'
import FilterChips from '../components/FilterChips'
import { useColumnPreferences } from '../hooks/useColumnPreferences'
import { useSamplesQuery } from '../hooks/useSamplesQuery'
import { useAuth } from '../context/AuthContext'
import { FilterState } from '../types'
import './QueryToolPageC.css'

const QueryToolPageC: React.FC = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [prefOpen,    setPrefOpen]    = useState(false)
  const [selectedId,  setSelectedId]  = useState<number | undefined>()
  const { role } = useAuth()
  const { visible, toggle, setGroup, reset: resetCols } = useColumnPreferences()

  const {
    pendingFilters, setPendingFilters,
    committedFilters,
    records, total, page, setPage, perPage, setPerPage, totalPages,
    loading, hasSearched,
    search, reset,
  } = useSamplesQuery()

  const handleSearch = () => {
    search()
    setSidebarOpen(false)
  }

  const handleNewSearch = () => {
    reset()
    setSidebarOpen(true)
  }

  const handleRemoveChip = (key: keyof FilterState) => {
    setPendingFilters(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    // Re-commit immediately so chips stay in sync with results
    setTimeout(() => search(), 0)
  }

  return (
    <div className='qpc-page'>

      <div className='qpc-header'>
        <NavBar />
        <img src='/logo_mayo.svg' alt='Mayo Clinic' className='header-logo' />
        <div className='header-divider' />
        <h1 className='qp-title'>Query Tool <span className='qpc-badge'>C</span></h1>
        <div className='header-spacer' />
        {hasSearched && !sidebarOpen && (
          <button className='qpc-export-btn' onClick={() => {
            if (!records.length) return
            const headers = Object.keys(records[0]).filter(k => k !== 'tissue').join(',')
            const rows = records.map(r =>
              Object.entries(r).filter(([k]) => k !== 'tissue')
                .map(([, v]) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                .join(',')
            )
            const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url
            a.download = `brain_bank_export_${new Date().toISOString().slice(0, 10)}.csv`
            a.click(); URL.revokeObjectURL(url)
          }}>Export Page</button>
        )}
        <button className='header-logout' onClick={() => signOut(auth).then(() => navigate('/login'))}>
          <svg width='15' height='15' viewBox='0 0 20 20' fill='currentColor'>
            <path d='M3 3h7a1 1 0 010 2H4v10h6a1 1 0 010 2H3a1 1 0 01-1-1V4a1 1 0 011-1z'/>
            <path d='M13.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z'/>
          </svg>
          Sign Out
        </button>
      </div>

      <div className='qpc-body'>

        {/* ── Sidebar (open state) ── */}
        {sidebarOpen && (
          <div className='qpc-sidebar'>
            <FilterComp filterState={pendingFilters} setFilterState={setPendingFilters} />
            <div className='qpc-search-footer'>
              {hasSearched && (
                <span className='qpc-live-count'>{total.toLocaleString()} records</span>
              )}
              <div className='qpc-search-row'>
                <button className='qpc-clear-btn' onClick={reset} title='Clear'>
                  <svg width='12' height='13' viewBox='0 0 13 14' fill='none'>
                    <path d='M1 3.5h11M4.5 3.5V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5.5 6.5v4M7.5 6.5v4M2 3.5l.7 7.6A1 1 0 0 0 3.7 12h5.6a1 1 0 0 0 1-.9L11 3.5'
                      stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'/>
                  </svg>
                </button>
                <button className='qpc-search-btn' onClick={handleSearch}>Search</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Table area ── */}
        <div className='qpc-table-area'>

          {/* Chips bar — shown after search when sidebar is collapsed */}
          {hasSearched && !sidebarOpen && committedFilters && (
            <FilterChips
              filters={committedFilters}
              total={total}
              onRemove={handleRemoveChip}
              onEdit={() => setSidebarOpen(true)}
              onNewSearch={handleNewSearch}
            />
          )}

          <div className='qpc-table-card'>
            <DataTable
              data={records}
              visibleColumns={visible}
              onOpenColumns={() => setPrefOpen(true)}
              onRowClick={row => setSelectedId(prev => prev === row.id ? undefined : row.id)}
              selectedId={selectedId}
              emptyMessage={hasSearched ? 'No records match these filters' : 'Set filters and press Search'}
              server={{ total, page, totalPages, perPage, loading,
                onPageChange: setPage, onPerPageChange: setPerPage }}
            />
          </div>
        </div>

      </div>

      {prefOpen && (
        <PreferencesPanel
          visible={visible} role={role} onToggle={toggle}
          onSetGroup={setGroup} onReset={resetCols}
          onClose={() => setPrefOpen(false)}
        />
      )}

      <RecordDrawer
        record={records.find(r => r.id === selectedId) ?? null}
        onClose={() => setSelectedId(undefined)}
      />

    </div>
  )
}

export default QueryToolPageC
