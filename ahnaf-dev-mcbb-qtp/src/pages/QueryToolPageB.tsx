import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import FilterComp from '../components/FilterComp'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import NavBar from '../components/NavBar'
import DataTable from '../components/DataTable'
import PreferencesPanel from '../components/PreferencesPanel'
import RecordDrawer from '../components/RecordDrawer'
import ActionPanel from '../components/ActionPanel'
import ChartsPanel from '../components/ChartsPanel'
import { useColumnPreferences } from '../hooks/useColumnPreferences'
import { useSamplesQuery } from '../hooks/useSamplesQuery'
import { useAuth } from '../context/AuthContext'
import './QueryToolPage.css'
import './QueryToolPageB.css'

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <rect x="2" y="10" width="3" height="8"  rx="1" />
    <rect x="7" y="6"  width="3" height="12" rx="1" />
    <rect x="12" y="3" width="3" height="15" rx="1" />
    <rect x="17" y="8" width="1" height="10" rx="0.5" />
  </svg>
)

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V3a1 1 0 011-1z" />
    <path d="M3 15a1 1 0 011 1v1h12v-1a1 1 0 112 0v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1a1 1 0 011-1z" />
  </svg>
)

const QueryToolPageB: React.FC = () => {
  const navigate = useNavigate()
  const [chartsOpen,  setChartsOpen]  = useState(false)
  const [prefOpen,    setPrefOpen]    = useState(false)
  const [selectedId,  setSelectedId]  = useState<number | undefined>()
  const { role } = useAuth()
  const { visible, toggle, setGroup, reset: resetCols } = useColumnPreferences()

  const {
    pendingFilters, setPendingFilters,
    records, total, page, setPage, perPage, setPerPage, totalPages,
    loading, hasSearched,
    search, reset,
  } = useSamplesQuery()

  const handleExportCSV = () => {
    if (!records.length) return
    const headers = Object.keys(records[0]).filter(k => k !== 'tissue').join(',')
    const rows = records.map(r =>
      Object.entries(r).filter(([k]) => k !== 'tissue')
        .map(([, v]) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `brain_bank_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const actions = [
    {
      icon: <ChartIcon />,
      label: chartsOpen ? 'Hide Charts' : 'Create Charts',
      onClick: () => setChartsOpen(o => !o),
      active: chartsOpen,
    },
    {
      icon: <ExportIcon />,
      label: 'Export Page',
      onClick: handleExportCSV,
      disabled: records.length === 0,
    },
  ]

  return (
    <div className='query-tool-page-main'>

      <div className='query-tool-page-header'>
        <NavBar />
        <img src={`${import.meta.env.BASE_URL}logo_mayo.svg`} alt='Mayo Clinic' className='header-logo' />
        <div className='header-divider' />
        <h1 className='qp-title'>Query Tool <span className='qpb-badge'>B</span></h1>
        <div className='header-spacer' />
        <button className='header-logout' onClick={() => signOut(auth).then(() => navigate('/login'))}>
          <svg width='15' height='15' viewBox='0 0 20 20' fill='currentColor'>
            <path d='M3 3h7a1 1 0 010 2H4v10h6a1 1 0 010 2H3a1 1 0 01-1-1V4a1 1 0 011-1z'/>
            <path d='M13.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 010-2h6.586l-1.293-1.293a1 1 0 010-1.414z'/>
          </svg>
          Sign Out
        </button>
      </div>

      <div className='query-tool-page-body'>
        <CollapsibleSidebar>
          <FilterComp filterState={pendingFilters} setFilterState={setPendingFilters} onReset={reset} />
          <div className='qpb-search-footer'>
            {hasSearched && (
              <span className='qpb-live-count'>{total.toLocaleString()} records</span>
            )}
            <div className='qpb-search-row'>
              <button className='qpb-search-btn' onClick={search}>Search</button>
            </div>
          </div>
        </CollapsibleSidebar>

        <div className='qpb-content-area'>
          <div className='data-table'>
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
          <ActionPanel actions={actions} />
        </div>

        {chartsOpen && (
          <div className='qpb-charts-backdrop' onClick={() => setChartsOpen(false)}>
            <div className='qpb-charts-modal' onClick={e => e.stopPropagation()}>
              <div className='qpb-charts-modal-header'>
                <span className='qpb-charts-modal-title'>Charts</span>
                <button className='qpb-charts-close' onClick={() => setChartsOpen(false)}>✕</button>
              </div>
              <ChartsPanel data={records} />
            </div>
          </div>
        )}
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

export default QueryToolPageB
