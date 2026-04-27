import React from 'react'
import { FilterState, Sex, ApoeGenotype, MaptHaplotype, BraakStage, ThalPhase, AlzheimersType, CeradScore } from '../types'
import MultiSelect, { MSOption } from './MultiSelect'
import './FilterComp.css'

type Props = {
  filterState: FilterState
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>
  onReset?: () => void
}

const SEX_OPTS:       MSOption<Sex>[]           = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]
const RACE_OPTS:      MSOption<string>[]         = [
  { value: 'White',                      label: 'White' },
  { value: 'Black or African American',  label: 'Black or African American' },
  { value: 'Asian',                      label: 'Asian' },
  { value: 'Hispanic or Latino',         label: 'Hispanic or Latino' },
]
const DX_OPTS:        MSOption<string>[]         = [
  { value: "Alzheimer's Disease",        label: "Alzheimer's Disease" },
  { value: 'Mild Cognitive Impairment',  label: 'Mild Cognitive Impairment' },
  { value: 'No Cognitive Impairment',    label: 'No Cognitive Impairment' },
]
const AD_TYPE_OPTS:   MSOption<AlzheimersType>[] = [
  { value: 'Amnestic AD', label: 'Amnestic AD' },
  { value: 'Atypical AD', label: 'Atypical AD' },
]
const APOE_OPTS:      MSOption<ApoeGenotype>[]   = (['22','23','24','33','34','44'] as ApoeGenotype[]).map(g => ({ value: g, label: `ε${g}` }))
const MAPT_OPTS:      MSOption<MaptHaplotype>[]  = [
  { value: 'H1/H1', label: 'H1/H1' },
  { value: 'H1/H2', label: 'H1/H2' },
  { value: 'H2/H2', label: 'H2/H2' },
]
const THAL_OPTS:      MSOption<ThalPhase>[]      = ([0,1,2,3,4,5] as ThalPhase[]).map(p => ({ value: p, label: `Phase ${p}` }))
const BRAAK_OPTS:     MSOption<BraakStage>[]     = ([0,1,2,3,4,5,6] as BraakStage[]).map(s => ({ value: s, label: `Stage ${s}` }))
const CERAD_OPTS:     MSOption<CeradScore>[]     = [
  { value: 'Absent',   label: 'Absent' },
  { value: 'Sparse',   label: 'Sparse' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Frequent', label: 'Frequent' },
]

const FilterComp: React.FC<Props> = ({ filterState, setFilterState, onReset }) => {
  const set = (patch: Partial<FilterState>) =>
    setFilterState(prev => ({ ...prev, ...patch }))

  const showAdType = filterState.primaryDiagnosis?.includes("Alzheimer's Disease")

  return (
    <div className='filter-comp-box'>

      <div className='filter-comp-header'>
        <span className='filter-comp-title'>Filters</span>
        <div className='filter-clear-wrap'>
          <button className='filter-clear-btn' onClick={() => { setFilterState({}); onReset?.() }}>
            <svg width='13' height='14' viewBox='0 0 13 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M1 3.5h11M4.5 3.5V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5.5 6.5v4M7.5 6.5v4M2 3.5l.7 7.6A1 1 0 0 0 3.7 12h5.6a1 1 0 0 0 1-.9L11 3.5' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </button>
          <span className='filter-clear-tooltip'>Clear filters</span>
        </div>
      </div>

      <input className='filter-comp-input' placeholder='Search IDs (NPID, Autopsy, Mayo, NACC…)'
        value={filterState.idSearch ?? ''}
        onChange={e => set({ idSearch: e.target.value || undefined })} />

      <div className='filter-section'>
        <span className='filter-section-label'>Demographics</span>

        <input className='filter-comp-input' placeholder='Age ranges e.g. 50-55;70-80'
          value={filterState.ageRanges ?? ''}
          onChange={e => set({ ageRanges: e.target.value || undefined })} />

        <div className='filter-check-row'>
          {SEX_OPTS.map(opt => (
            <label key={opt.value} className='filter-check-label'>
              <input
                type='radio'
                name='sex'
                checked={filterState.sex === opt.value}
                onChange={() => set({ sex: opt.value })}
              />
              {opt.label}
            </label>
          ))}
          {filterState.sex && (
            <label className='filter-check-label'>
              <input type='radio' name='sex' checked={false} onChange={() => set({ sex: undefined })} />
              Any
            </label>
          )}
        </div>

        <MultiSelect<string>
          placeholder='Race (any)'
          options={RACE_OPTS}
          selected={filterState.race ?? []}
          onChange={v => set({ race: v.length ? v : undefined })}
        />
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Diagnosis</span>

        <MultiSelect<string>
          placeholder='Primary Diagnosis (any)'
          options={DX_OPTS}
          selected={filterState.primaryDiagnosis ?? []}
          onChange={v => set({ primaryDiagnosis: v.length ? v : undefined, ad_type: undefined })}
        />

        {showAdType && (
          <MultiSelect<AlzheimersType>
            placeholder='AD Subtype (any)'
            options={AD_TYPE_OPTS}
            selected={filterState.ad_type ?? []}
            onChange={v => set({ ad_type: v.length ? v : undefined })}
          />
        )}
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Neuropathology</span>

        <div className='filter-group'>
          <span className='filter-group-label'>Thal Phase</span>
          <MultiSelect<ThalPhase>
            placeholder='Any phase'
            options={THAL_OPTS}
            selected={filterState.thalPhases ?? []}
            onChange={v => set({ thalPhases: v.length ? v : undefined })}
          />
        </div>

        <div className='filter-group'>
          <span className='filter-group-label'>Braak Stage</span>
          <MultiSelect<BraakStage>
            placeholder='Any stage'
            options={BRAAK_OPTS}
            selected={filterState.braakStages ?? []}
            onChange={v => set({ braakStages: v.length ? v : undefined })}
          />
        </div>

        <div className='filter-group'>
          <span className='filter-group-label'>CERAD</span>
          <MultiSelect<CeradScore>
            placeholder='Any score'
            options={CERAD_OPTS}
            selected={filterState.ceradScores ?? []}
            onChange={v => set({ ceradScores: v.length ? v : undefined })}
          />
        </div>
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Genetics</span>

        <MultiSelect<ApoeGenotype>
          placeholder='APOE (any)'
          options={APOE_OPTS}
          selected={filterState.apoe ?? []}
          onChange={v => set({ apoe: v.length ? v : undefined })}
        />

        <MultiSelect<MaptHaplotype>
          placeholder='MAPT (any)'
          options={MAPT_OPTS}
          selected={filterState.mapt ?? []}
          onChange={v => set({ mapt: v.length ? v : undefined })}
        />
      </div>

      <div className='filter-section'>
        <span className='filter-section-label'>Tissue</span>
        <div className='filter-check-row'>
          <label className='filter-check-label'>
            <input type='checkbox'
              checked={filterState.frozenOnly ?? false}
              onChange={e => set({ frozenOnly: e.target.checked || undefined })} />
            Frozen
          </label>
          <label className='filter-check-label'>
            <input type='checkbox'
              checked={filterState.ffpeOnly ?? false}
              onChange={e => set({ ffpeOnly: e.target.checked || undefined })} />
            FFPE
          </label>
        </div>
      </div>

    </div>
  )
}

export default FilterComp
