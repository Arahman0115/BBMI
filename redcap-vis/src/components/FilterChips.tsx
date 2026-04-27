import React from 'react'
import { FilterState } from '../types'
import './FilterChips.css'

type Chip = { key: keyof FilterState; label: string }

function buildChips(f: FilterState): Chip[] {
  const chips: Chip[] = []
  if (f.idSearch)            chips.push({ key: 'idSearch',         label: `ID: ${f.idSearch}` })
  if (f.sex)                 chips.push({ key: 'sex',              label: `Sex: ${f.sex}` })
  if (f.race?.length)        chips.push({ key: 'race',             label: `Race: ${f.race.join(', ')}` })
  if (f.ageRanges)           chips.push({ key: 'ageRanges',        label: `Age: ${f.ageRanges}` })
  if (f.primaryDiagnosis?.length) chips.push({ key: 'primaryDiagnosis', label: `Dx: ${f.primaryDiagnosis.join(', ')}` })
  if (f.ad_type?.length)     chips.push({ key: 'ad_type',          label: f.ad_type.join(', ') })
  if (f.apoe?.length)        chips.push({ key: 'apoe',             label: `APOE: ${f.apoe.join(', ')}` })
  if (f.mapt?.length)        chips.push({ key: 'mapt',             label: `MAPT: ${f.mapt.join(', ')}` })
  if (f.thalPhases?.length)  chips.push({ key: 'thalPhases',       label: `Thal: ${f.thalPhases.join(', ')}` })
  if (f.braakStages?.length) chips.push({ key: 'braakStages',      label: `Braak: ${f.braakStages.join(', ')}` })
  if (f.ceradScores?.length) chips.push({ key: 'ceradScores',      label: `CERAD: ${f.ceradScores.join(', ')}` })
  if (f.frozenOnly)          chips.push({ key: 'frozenOnly',       label: 'Frozen only' })
  if (f.ffpeOnly)            chips.push({ key: 'ffpeOnly',         label: 'FFPE only' })
  return chips
}

type Props = {
  filters: FilterState
  total: number
  onRemove: (key: keyof FilterState) => void
  onEdit: () => void
  onNewSearch: () => void
}

const FilterChips: React.FC<Props> = ({ filters, total, onRemove, onEdit, onNewSearch }) => {
  const chips = buildChips(filters)

  return (
    <div className='fc-bar'>
      <span className='fc-result-count'>{total.toLocaleString()} records</span>
      <div className='fc-chips'>
        {chips.map(chip => (
          <span key={chip.key} className='fc-chip'>
            {chip.label}
            <button className='fc-chip-remove' onClick={() => onRemove(chip.key)}>×</button>
          </span>
        ))}
      </div>
      <div className='fc-actions'>
        <button className='fc-btn fc-btn--edit' onClick={onEdit}>Edit Filters</button>
        <button className='fc-btn fc-btn--new'  onClick={onNewSearch}>New Search</button>
      </div>
    </div>
  )
}

export default FilterChips
