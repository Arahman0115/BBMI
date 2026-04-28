import { DonorRecord, FilterState } from '../types'

const parseAgeRanges = (input: string) =>
  input.split(';')
    .map(s => s.trim())
    .map(s => {
      const [a, b] = s.split('-').map(Number)
      return !isNaN(a) && !isNaN(b) ? { min: a, max: b } : null
    })
    .filter(Boolean) as { min: number; max: number }[]

const primaryDx   = (r: DonorRecord) => r.diagnosis?.find(d => d.DiagnosisOrder === 1)?.DiseaseCategory ?? null
const secondaryDxList = (r: DonorRecord) =>
  r.diagnosis?.filter(d => (d.DiagnosisOrder ?? 0) > 1).map(d => d.DiseaseCategory).filter((v): v is string => !!v) ?? []

export const applyFilters = (records: DonorRecord[], f: FilterState): DonorRecord[] =>
  records.filter(r => {
    if (f.idSearch) {
      const q = f.idSearch.toLowerCase()
      const match =
        r.NPID?.toLowerCase().includes(q) ||
        r.AutopsyID?.toLowerCase().includes(q) ||
        r.ID?.toLowerCase().includes(q) ||
        (r.MayoClinicID?.toLowerCase().includes(q) ?? false) ||
        (r.TruncatedMayoClinicID?.toLowerCase().includes(q) ?? false) ||
        (r.NACCPtid?.toLowerCase().includes(q) ?? false)
      if (!match) return false
    }

    if (f.sex && r.Sex !== f.sex) return false
    if (f.race?.length && (!r.Race || !f.race.includes(r.Race))) return false
    if (f.studySource?.length && (!r.StudySource || !f.studySource.includes(r.StudySource))) return false

    if (f.primaryDiagnosis?.length) {
      const pdx = primaryDx(r)
      if (!pdx || !f.primaryDiagnosis.includes(pdx)) return false
    }

    if (f.secondaryDiagnoses?.length) {
      const sdx = secondaryDxList(r)
      if (!f.secondaryDiagnoses.some(dx => sdx.includes(dx))) return false
    }

    if (f.ad_type?.length) {
      const primaryEntry = r.diagnosis?.find(d => d.DiagnosisOrder === 1)
      if (!primaryEntry?.DiseaseSubtype || !f.ad_type.includes(primaryEntry.DiseaseSubtype as any)) return false
    }

    if (f.apoe?.length && (!r.APOEGenotype || !f.apoe.includes(r.APOEGenotype as any))) return false
    if (f.mapt?.length && (!r.MAPT || !f.mapt.includes(r.MAPT as any))) return false

    if (f.ageRanges) {
      const ranges = parseAgeRanges(f.ageRanges)
      const age = r.AgeAtDeath ?? 0
      if (ranges.length > 0 && !ranges.some(r2 => age >= r2.min && age <= r2.max)) return false
    }

    if (f.braakStages?.length && !f.braakStages.includes(r.BraakStage as any)) return false
    if (f.thalPhases?.length  && !f.thalPhases.includes(r.ThalPhase as any))   return false
    if (f.ceradScores?.length && r.CERADNP && !f.ceradScores.includes(r.CERADNP as any)) return false

    if (f.diagnosisOrder) {
      const { diagnosis, min, max } = f.diagnosisOrder
      const entry = r.diagnosis?.find(d => d.DiseaseCategory === diagnosis)
      if (!entry || entry.DiagnosisOrder == null) return false
      if (entry.DiagnosisOrder < min || entry.DiagnosisOrder > max) return false
    }

    if (f.tissueAvailable?.length) {
      const checks: Record<string, boolean> = {
        frozen:           !!(r.FrozenTissueAvailable),
        ffpe:             !!(r.FixedTissueAvailable),
        unstained_slides: !!(r.UnstainedSlidesAvailable),
        spinal_cord:      !!(r.SpinalCord),
        olfactory_bulb:   !!(r.OlfactoryBulb),
        csf:              !!(r.CSF),
      }
      if (!f.tissueAvailable.every(t => checks[t])) return false
    }

    return true
  })
