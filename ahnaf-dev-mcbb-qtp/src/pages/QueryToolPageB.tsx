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

const ColumnsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <rect x="2"  y="3" width="4" height="14" rx="1" />
    <rect x="8"  y="3" width="4" height="14" rx="1" />
    <rect x="14" y="3" width="4" height="14" rx="1" />
  </svg>
)

const QueryToolPageB: React.FC = () => {
  const [chartsOpen,     setChartsOpen]     = useState(false)
  const [prefOpen,       setPrefOpen]       = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [selectedId,     setSelectedId]     = useState<string | undefined>()
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
    const gene = (r: import('../types').DonorRecord, marker: string) =>
      r.genetics?.find(g => g.marker === marker)?.value ?? ''
    const flatten = (r: import('../types').DonorRecord) => ({
      npid:               r.npid ?? '',
      sex:                r.demographics?.sex ?? '',
      race:               r.demographics?.race ?? '',
      age_at_death:       r.demographics?.ageAtDeath ?? '',
      state_of_origin:    r.intake?.stateOfOrigin ?? '',
      clinical_diagnosis: r.clinical?.clinicalDiagnosis?.map(d => d.diagnosis).filter(Boolean).join('; ') ?? '',
      family_history:     r.clinical?.familyHistory ?? '',
      primary_dx:         r.diagnosis?.find(d => d.order === 1)?.category ?? '',
      primary_subtype:    r.pathology?.adSubtype ?? '',
      secondary_dx:       r.diagnosis?.filter(d => (d.order ?? 0) > 1).map(d => d.category).join('; ') ?? '',
      braak_stage:        r.pathology?.braakStage ?? '',
      thal_phase:         r.pathology?.thalPhase ?? '',
      cerad:              r.pathology?.ceradNp ?? '',
      nia_reagan:         r.pathology?.niaReaganScore ?? '',
      apoe_genotype:      gene(r, 'APOE'),
      mapt:               gene(r, 'MAPT'),
      gba:                gene(r, 'GBA'),
      grn:                gene(r, 'GRN'),
      frozen:             r.tissue?.frozenAvailable ?? '',
      ffpe:               r.tissue?.fixedAvailable ?? '',
      dna_extracted:      r.tissue?.dnaExtracted ?? '',
      rna_seq:            r.tissue?.rnaSeq ?? '',
      spinal_cord:        r.tissue?.spinalCord ?? '',
      olfactory_bulb:     r.tissue?.olfactoryBulb ?? '',
      csf:                r.tissue?.csf ?? '',
      pmi_hours:          r.tissue?.postmortemInterval ?? '',
      brain_source:       r.intake?.brainSource ?? '',
      study_source:       r.intake?.studySource ?? '',
    })
    const flat    = records.map(flatten)
    const headers = Object.keys(flat[0]).join(',')
    const rows    = flat.map(f =>
      Object.values(f).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
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
      onClick: handleExportCSV,
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

    </div>
  )
}

export default QueryToolPageB
