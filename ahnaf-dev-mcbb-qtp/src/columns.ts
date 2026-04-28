import { DonorRecord } from './types'

export type ColumnGroup =
  | 'Identifiers'
  | 'Demographics'
  | 'Clinical'
  | 'Neuropathology'
  | 'Genetics'
  | 'Tissue'
  | 'Intake'

// Keys match MongoDB field names for server-side sort.
// Derived fields (PrimaryDiagnosis, SecondaryDiagnoses) are not directly sortable.
export type ColumnKey =
  // Identifiers
  | 'NPID' | 'AutopsyID' | 'ID' | 'MayoClinicID' | 'TruncatedMayoClinicID' | 'NACCPtid' | 'PTNUM'
  // Demographics
  | 'AgeAtDeath' | 'Sex' | 'Race' | 'DOB' | 'DOD'
  // Clinical
  | 'CognitiveStatus' | 'ClinicalDiagnosis' | 'MMSEScore' | 'MoCAScore'
  | 'CDRScore' | 'CDRSBScore' | 'ImagingAvailable' | 'SleepStudyAvailable'
  // Neuropathology
  | 'PrimaryDiagnosis' | 'SecondaryDiagnoses' | 'BraakStage' | 'ThalPhase'
  | 'CERADNP' | 'ABCScore' | 'NIAReaganScore' | 'ADSubtype'
  | 'NIAAABiomarkerProfile' | 'LBDType' | 'CDLBLikelihood' | 'TDP43' | 'TDPType'
  // Genetics
  | 'APOEGenotype' | 'APOEDeterminationMethod' | 'MAPT' | 'GBAGenotype' | 'GRNGenotype'
  | 'RIN' | 'TMEM106brs1990622' | 'TMEM106brs3173615'
  // Tissue
  | 'FrozenTissueAvailable' | 'FixedTissueAvailable' | 'PostmortemInterval'
  | 'DNAExtracted' | 'RNASeq' | 'SpinalCord' | 'CSF'
  | 'FrozenTissueQuality' | 'UnstainedSlidesAvailable' | 'NumberStainedSlides'
  // Intake
  | 'BrainSource' | 'StudySource' | 'StateOfOriginOfBrain' | 'DateReceived'
  | 'IRBNumber' | 'BrainWeight'

export interface ColumnDef {
  key:            ColumnKey
  label:          string
  group:          ColumnGroup
  defaultVisible: boolean
  selector:       (row: DonorRecord) => string | number
  sortable?:      boolean
}

const primaryDx = (r: DonorRecord) =>
  r.diagnosis?.find(d => d.DiagnosisOrder === 1)?.DiseaseCategory ?? '—'

const secondaryDx = (r: DonorRecord) =>
  r.diagnosis?.filter(d => (d.DiagnosisOrder ?? 0) > 1)
    .sort((a, b) => (a.DiagnosisOrder ?? 0) - (b.DiagnosisOrder ?? 0))
    .map(d => d.DiseaseCategory).filter(Boolean).join(', ') || '—'

const yn = (v: boolean | number | null | undefined) => (v ? 'Yes' : 'No')

export const ALL_COLUMNS: ColumnDef[] = [
  // ── Identifiers ──────────────────────────────────────────
  { key: 'NPID',                    label: 'NPID',                  group: 'Identifiers',    defaultVisible: true,  sortable: true,  selector: r => r.NPID },
  { key: 'AutopsyID',               label: 'Autopsy ID',            group: 'Identifiers',    defaultVisible: true,  sortable: true,  selector: r => r.AutopsyID ?? '—' },
  { key: 'ID',                      label: 'ID',                    group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.ID ?? '—' },
  { key: 'MayoClinicID',            label: 'Mayo Clinic ID',        group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.MayoClinicID ?? '—' },
  { key: 'TruncatedMayoClinicID',   label: 'Truncated Mayo ID',     group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.TruncatedMayoClinicID ?? '—' },
  { key: 'NACCPtid',                label: 'NACC PTID',             group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.NACCPtid ?? '—' },
  { key: 'PTNUM',                   label: 'PTNUM',                 group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.PTNUM ?? '—' },

  // ── Demographics ─────────────────────────────────────────
  { key: 'AgeAtDeath',              label: 'Age at Death',          group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.AgeAtDeath ?? '—' },
  { key: 'Sex',                     label: 'Sex',                   group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.Sex ?? '—' },
  { key: 'Race',                    label: 'Race',                  group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.Race ?? '—' },
  { key: 'DOB',                     label: 'DOB',                   group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.DOB ?? '—' },
  { key: 'DOD',                     label: 'DOD',                   group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.DOD ?? '—' },

  // ── Clinical ─────────────────────────────────────────────
  { key: 'CognitiveStatus',         label: 'Cognitive Status',      group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.CognitiveStatus ?? '—' },
  { key: 'ClinicalDiagnosis',       label: 'Clinical Diagnosis',    group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.ClinicalDiagnosis ?? '—' },
  { key: 'MMSEScore',               label: 'MMSE',                  group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.MMSEScore ?? '—' },
  { key: 'MoCAScore',               label: 'MoCA',                  group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.MoCAScore ?? '—' },
  { key: 'CDRScore',                label: 'CDR',                   group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.CDRScore ?? '—' },
  { key: 'CDRSBScore',              label: 'CDR-SB',                group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.CDRSBScore ?? '—' },
  { key: 'ImagingAvailable',        label: 'Imaging',               group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => yn(r.ImagingAvailable) },
  { key: 'SleepStudyAvailable',     label: 'Sleep Study',           group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => yn(r.SleepStudyAvailable) },

  // ── Neuropathology ───────────────────────────────────────
  { key: 'PrimaryDiagnosis',        label: 'Primary Diagnosis',     group: 'Neuropathology', defaultVisible: true,  sortable: false, selector: r => primaryDx(r) },
  { key: 'SecondaryDiagnoses',      label: 'Co-Pathologies',        group: 'Neuropathology', defaultVisible: true,  sortable: false, selector: r => secondaryDx(r) },
  { key: 'BraakStage',              label: 'Braak Stage',           group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.BraakStage ?? '—' },
  { key: 'ThalPhase',               label: 'Thal Phase',            group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.ThalPhase ?? '—' },
  { key: 'CERADNP',                 label: 'CERAD NP',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.CERADNP ?? '—' },
  { key: 'ABCScore',                label: 'ABC Score',             group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.ABCScore ?? '—' },
  { key: 'NIAReaganScore',          label: 'NIA-Reagan',            group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.NIAReaganScore ?? '—' },
  { key: 'ADSubtype',               label: 'AD Subtype',            group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.ADSubtype ?? '—' },
  { key: 'NIAAABiomarkerProfile',   label: 'NIA-AA Profile',        group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.NIAAABiomarkerProfile ?? '—' },
  { key: 'LBDType',                 label: 'LBD Type',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.LBDType ?? '—' },
  { key: 'CDLBLikelihood',          label: 'CDLB Likelihood',       group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.CDLBLikelihood ?? '—' },
  { key: 'TDP43',                   label: 'TDP-43',                group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => yn(r.TDP43) },
  { key: 'TDPType',                 label: 'TDP Type',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.TDPType ?? '—' },

  // ── Genetics ─────────────────────────────────────────────
  { key: 'APOEGenotype',            label: 'APOE',                  group: 'Genetics',       defaultVisible: true,  sortable: true,  selector: r => r.APOEGenotype ? `ε${r.APOEGenotype}` : '—' },
  { key: 'APOEDeterminationMethod', label: 'APOE Method',           group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.APOEDeterminationMethod ?? '—' },
  { key: 'MAPT',                    label: 'MAPT',                  group: 'Genetics',       defaultVisible: true,  sortable: true,  selector: r => r.MAPT ?? '—' },
  { key: 'GBAGenotype',             label: 'GBA',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.GBAGenotype ?? '—' },
  { key: 'GRNGenotype',             label: 'GRN',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.GRNGenotype ?? '—' },
  { key: 'RIN',                     label: 'RIN',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.RIN ?? '—' },
  { key: 'TMEM106brs1990622',       label: 'TMEM106B rs1990622',    group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.TMEM106brs1990622 ?? '—' },
  { key: 'TMEM106brs3173615',       label: 'TMEM106B rs3173615',    group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.TMEM106brs3173615 ?? '—' },

  // ── Tissue ───────────────────────────────────────────────
  { key: 'FrozenTissueAvailable',   label: 'Frozen',                group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => yn(r.FrozenTissueAvailable) },
  { key: 'FixedTissueAvailable',    label: 'FFPE',                  group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => yn(r.FixedTissueAvailable) },
  { key: 'PostmortemInterval',      label: 'PMI (hrs)',             group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.PostmortemInterval ?? '—' },
  { key: 'DNAExtracted',            label: 'DNA Extracted',         group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => yn(r.DNAExtracted) },
  { key: 'RNASeq',                  label: 'RNA-seq',               group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => yn(r.RNASeq) },
  { key: 'SpinalCord',              label: 'Spinal Cord',           group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => yn(r.SpinalCord) },
  { key: 'CSF',                     label: 'CSF',                   group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => yn(r.CSF) },
  { key: 'FrozenTissueQuality',     label: 'Frozen Quality',        group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.FrozenTissueQuality ?? '—' },
  { key: 'UnstainedSlidesAvailable',label: 'Unstained Slides',      group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => yn(r.UnstainedSlidesAvailable) },
  { key: 'NumberStainedSlides',     label: 'Stained Slides #',      group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.NumberStainedSlides ?? '—' },

  // ── Intake ───────────────────────────────────────────────
  { key: 'BrainSource',             label: 'Brain Source',          group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.BrainSource ?? '—' },
  { key: 'StudySource',             label: 'Study Source',          group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.StudySource ?? '—' },
  { key: 'StateOfOriginOfBrain',    label: 'State of Origin',       group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.StateOfOriginOfBrain ?? '—' },
  { key: 'DateReceived',            label: 'Date Received',         group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.DateReceived ?? '—' },
  { key: 'IRBNumber',               label: 'IRB Number',            group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.IRBNumber ?? '—' },
  { key: 'BrainWeight',             label: 'Brain Weight (g)',      group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.BrainWeight ?? '—' },
]

export const COLUMN_GROUPS: ColumnGroup[] = [
  'Identifiers', 'Demographics', 'Clinical', 'Neuropathology', 'Genetics', 'Tissue', 'Intake',
]

export const PHI_COLUMNS: ColumnKey[] = [
  'NPID', 'AutopsyID', 'MayoClinicID', 'TruncatedMayoClinicID', 'NACCPtid', 'PTNUM',
  'DOB', 'DOD', 'IRBNumber',
]

export const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = Object.fromEntries(
  ALL_COLUMNS.map(c => [c.key, c.defaultVisible])
) as Record<ColumnKey, boolean>
