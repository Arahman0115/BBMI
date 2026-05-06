import React, { useState } from 'react'
import FilterComp from '../components/FilterComp'
import CollapsibleSidebar from '../components/CollapsibleSidebar'
import NavBar from '../components/NavBar'
import UserMenu from '../components/UserMenu'
import DataTable from '../components/DataTable'
import PreferencesPanel from '../components/PreferencesPanel'
import RecordDrawer from '../components/RecordDrawer'
import ActionPanel from '../components/ActionPanel'
import ChartsPanel from '../components/ChartsPanel'
import { useColumnPreferences } from '../hooks/useColumnPreferences'
import { useSamplesQuery } from '../hooks/useSamplesQuery'
import { useAuth } from '../context/AuthContext'
import { ALL_COLUMNS, ColumnDef } from '../columns'
import { ChartIcon, ExportIcon, ColumnsIcon } from '../components/icons'
import { exportCSV } from '../utils/exportCSV'
import './QueryToolPage.css'
import './QueryToolPageB.css'

const QueryToolPageB: React.FC = () => {
  const [chartsOpen,      setChartsOpen]      = useState(false)
  const [prefOpen,        setPrefOpen]        = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [selectedId,      setSelectedId]      = useState<string | undefined>()
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const { role } = useAuth()
  const { visible, toggle, setGroup, reset: resetCols } = useColumnPreferences()

  const {
    pendingFilters, setPendingFilters,
    records, total, page, setPage, perPage, setPerPage, totalPages,
    loading, hasSearched,
    search, reset,
  } = useSamplesQuery()

  const doExport = (cols: ColumnDef[]) => {
    if (!records.length) return
    exportCSV(records, cols)
    setExportModalOpen(false)
  }

  const actions = [
    {
      icon: <ColumnsIcon />,
      label: 'Columns',
      onClick: () => setPrefOpen(true),
    },
    {
      icon: <ChartIcon />,
      label: chartsOpen ? 'Hide Charts' : 'Create Charts',
      onClick: () => setChartsOpen(o => !o),
      active: chartsOpen,
    },
    {
      icon: <ExportIcon />,
      label: 'Export Page',
      onClick: () => setExportModalOpen(true),
      disabled: records.length === 0,
    },
  ]

  return (
    <div className='query-tool-page-main'>

      <div className='query-tool-page-header'>
        <img src={`${import.meta.env.BASE_URL}logo_mayo.svg`} alt='Mayo Clinic' className='header-logo' />
        <div className='header-divider' />
        <NavBar />
        <div className='header-spacer' />
        <UserMenu />
      </div>

      <div className='query-tool-page-body'>
        <CollapsibleSidebar>
          <FilterComp filterState={pendingFilters} setFilterState={setPendingFilters} onReset={reset}
            onSearch={() => { setSelectedId(undefined); search() }}
            onExpand={() => setFiltersExpanded(true)} />
          {hasSearched && (
            <div className='qpb-search-footer'>
              <span className='qpb-live-count'>{total.toLocaleString()} records</span>
            </div>
          )}
        </CollapsibleSidebar>

        <div className='qpb-content-area'>
          <div className='data-table'>
            <DataTable
              data={records}
              visibleColumns={visible}
              onRowClick={row => { if (!row._id) return; setSelectedId(prev => prev === row._id ? undefined : row._id) }}
              selectedId={selectedId}
              emptyMessage={hasSearched ? 'No records match these filters' : 'Set filters and press Search'}
              server={{ total, page, totalPages, perPage, loading,
                onPageChange: setPage, onPerPageChange: setPerPage }}
            />
          </div>
          <ActionPanel actions={actions} />
        </div>

        {filtersExpanded && (
          <div className='qpb-charts-backdrop' onClick={() => setFiltersExpanded(false)}>
            <div className='qpb-filters-modal' onClick={e => e.stopPropagation()}>
              <div className='qpb-charts-modal-header'>
                <span className='qpb-charts-modal-title'>Filters</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {hasSearched && <span className='qpb-live-count' style={{ fontSize: 10 }}>{total.toLocaleString()} records</span>}
                  <button className='qpb-search-btn' style={{ padding: '5px 16px', fontSize: 11 }}
                    onClick={() => { setSelectedId(undefined); search(); setFiltersExpanded(false) }}>
                    Search
                  </button>
                  <button className='qpb-charts-close' onClick={() => setFiltersExpanded(false)}>✕</button>
                </div>
              </div>
              <div className='qpb-filters-modal-body'>
                <FilterComp
                  filterState={pendingFilters} setFilterState={setPendingFilters}
                  onReset={reset} expanded
                />
              </div>
            </div>
          </div>
        )}

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
        record={selectedId != null ? (records.find(r => r._id === selectedId) ?? null) : null}
        onClose={() => setSelectedId(undefined)}
      />

      {exportModalOpen && (
        <div className='qpb-charts-backdrop' onClick={() => setExportModalOpen(false)}>
          <div className='qpb-export-modal' onClick={e => e.stopPropagation()}>
            <div className='qpb-charts-modal-header'>
              <span className='qpb-charts-modal-title'>Export CSV</span>
              <button className='qpb-charts-close' onClick={() => setExportModalOpen(false)}>✕</button>
            </div>
            <div className='qpb-export-modal-body'>
              <p className='qpb-export-modal-desc'>Which columns would you like to export?</p>
              <div className='qpb-export-modal-actions'>
                <button className='qpb-search-btn' onClick={() => doExport(ALL_COLUMNS.filter(c => visible[c.key]))}>
                  Visible Columns
                </button>
                <button className='qpb-search-btn qpb-search-btn--secondary' onClick={() => doExport(ALL_COLUMNS)}>
                  All Columns
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default QueryToolPageB
