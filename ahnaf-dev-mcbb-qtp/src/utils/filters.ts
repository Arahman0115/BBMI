import { DonorRecord, FilterState } from '../types'

const parseAgeRanges = (input: string) =>
  input.split(';')
    .map(s => s.trim())
    .map(s => {
      const [a, b] = s.split('-').map(Number)
      return !isNaN(a) && !isNaN(b) ? { min: a, max: b } : null
    })
    .filter(Boolean) as { min: number; max: number }[]

export const applyFilters = (records: DonorRecord[], f: FilterState): DonorRecord[] =>
  records.filter(r => {
    if (f.idSearch) {
      const q = f.idSearch.toLowerCase()
      const match =
        r.npid?.toLowerCase().includes(q) ||
        r.autopsy_id?.toLowerCase().includes(q) ||
        String(r.id).includes(q) ||
        (r.mayo_clinic_id?.toLowerCase().includes(q) ?? false) ||
        (r.truncated_mayo_clinic_id?.toLowerCase().includes(q) ?? false) ||
        (r.nacc_ptid?.toLowerCase().includes(q) ?? false)
      if (!match) return false
    }
    if (f.sex && r.sex !== f.sex) return false
    if (f.race?.length && !f.race.includes(r.race)) return false
    if (f.primaryDiagnosis?.length && !f.primaryDiagnosis.includes(r.primary_diagnosis)) return false
    if (f.ad_type?.length && r.ad_type && !f.ad_type.includes(r.ad_type)) return false
    if (f.apoe?.length && !f.apoe.includes(r.apoe)) return false
    if (f.mapt?.length && !f.mapt.includes(r.mapt)) return false
    if (f.ageRanges) {
      const ranges = parseAgeRanges(f.ageRanges)
      if (ranges.length > 0 && !ranges.some(r2 => r.age_at_death >= r2.min && r.age_at_death <= r2.max)) return false
    }
    if (f.braakStages?.length && !f.braakStages.includes(r.braak_stage)) return false
    if (f.thalPhases?.length && !f.thalPhases.includes(r.thal_phase)) return false
    if (f.ceradScores?.length && r.cerad_np && !f.ceradScores.includes(r.cerad_np)) return false
    if (f.frozenOnly && !r.tissue.frozen_available) return false
    if (f.ffpeOnly && !r.tissue.ffpe_available) return false
    return true
  })
