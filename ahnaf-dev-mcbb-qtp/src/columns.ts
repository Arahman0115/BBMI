import { DonorRecord } from './types'

export type ColumnGroup =
  | 'Identifiers'
  | 'Demographics'
  | 'Clinical'
  | 'Neuropathology'
  | 'Genetics'
  | 'Tissue'
  | 'Intake'

export type ColumnKey =
  // Identifiers
  | 'NPID'
  // Demographics
  | 'AgeAtDeath' | 'Sex' | 'Race' | 'DOB' | 'DOD' | 'StateOfOriginOfBrain'
  // Clinical
  | 'ClinicalDiagnosis' | 'FamilyHistory'
  // Neuropathology
  | 'PrimaryDiagnosis' | 'ADSubtype' | 'SecondaryDiagnoses' | 'CoPathology'
  | 'BraakStage' | 'ThalPhase' | 'CERADNP' | 'NIAReaganScore'
  // Genetics
  | 'APOEGenotype' | 'APOEDeterminationMethod' | 'MAPT'
  | 'GBAGenotype' | 'GRNGenotype' | 'TMEM106brs1990622' | 'TMEM106brs3173615'
  // Tissue
  | 'FrozenTissueAvailable' | 'FixedTissueAvailable' | 'PostmortemInterval'
  | 'DNAExtracted' | 'RNASeq' | 'SpinalCord' | 'OlfactoryBulb' | 'CSF'
  | 'UnstainedSlidesAvailable'
  // Intake / Metadata
  | 'BrainSource' | 'StudySource'

export const SORT_FIELD_MAP: Partial<Record<ColumnKey, string>> = {
  NPID:                    'npid',
  AgeAtDeath:              'demographics.ageAtDeath',
  Sex:                     'demographics.sex',
  Race:                    'demographics.race',
  DOB:                     'demographics.dob',
  DOD:                     'demographics.dod',
  StateOfOriginOfBrain:    'intake.stateOfOrigin',
  ClinicalDiagnosis:       'clinical.clinicalDiagnosis',
  BraakStage:              'pathology.braakStage',
  ThalPhase:               'pathology.thalPhase',
  CERADNP:                 'pathology.ceradNp',
  NIAReaganScore:          'pathology.niaReaganScore',
  FrozenTissueAvailable:   'tissue.frozenAvailable',
  FixedTissueAvailable:    'tissue.fixedAvailable',
  PostmortemInterval:      'tissue.postmortemInterval',
  BrainSource:             'intake.brainSource',
  StudySource:             'intake.studySource',
}

export interface ColumnDef {
  key:            ColumnKey
  label:          string
  group:          ColumnGroup
  defaultVisible: boolean
  selector:       (row: DonorRecord) => string | number
  sortable?:      boolean
}

const gene = (r: DonorRecord, marker: string) =>
  r.genetics?.find(g => g.marker === marker)?.value ?? '—'

const primaryDx = (r: DonorRecord) =>
  r.diagnosis?.find(d => d.order === 1)?.category ?? '—'

const secondaryDx = (r: DonorRecord) =>
  r.diagnosis
    ?.filter(d => (d.order ?? 0) > 1)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(d => d.category).filter(Boolean).join(', ') || '—'

const yn = (v: boolean | null | undefined) => (v ? 'Yes' : 'No')

export const ALL_COLUMNS: ColumnDef[] = [
  // ── Identifiers ──────────────────────────────────────────
  { key: 'NPID',                    label: 'NPID',               group: 'Identifiers',    defaultVisible: true,  sortable: true,  selector: r => r.npid ?? '—' },

  // ── Demographics ─────────────────────────────────────────
  { key: 'AgeAtDeath',              label: 'Age at Death',       group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.demographics?.ageAtDeath ?? '—' },
  { key: 'Sex',                     label: 'Sex',                group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.demographics?.sex ?? '—' },
  { key: 'Race',                    label: 'Race',               group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.demographics?.race ?? '—' },
  { key: 'DOB',                     label: 'DOB',                group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.demographics?.dob ?? '—' },
  { key: 'DOD',                     label: 'DOD',                group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.demographics?.dod ?? '—' },
  { key: 'StateOfOriginOfBrain',    label: 'State of Origin',    group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.intake?.stateOfOrigin ?? '—' },

  // ── Clinical ─────────────────────────────────────────────
  { key: 'ClinicalDiagnosis',       label: 'Clinical Diagnosis', group: 'Clinical',       defaultVisible: false, sortable: false, selector: r => r.clinical?.clinicalDiagnosis?.map(d => d.diagnosis).filter(Boolean).join(', ') ?? '—' },
  { key: 'FamilyHistory',           label: 'Family History',     group: 'Clinical',       defaultVisible: false, sortable: false, selector: r => yn(r.clinical?.familyHistory) },

  // ── Neuropathology ───────────────────────────────────────
  { key: 'PrimaryDiagnosis',        label: 'Primary Diagnosis',  group: 'Neuropathology', defaultVisible: true,  sortable: false, selector: r => primaryDx(r) },
  { key: 'ADSubtype',               label: 'Subtype',            group: 'Neuropathology', defaultVisible: false, sortable: false, selector: r => r.pathology?.adSubtype ?? '—' },
  { key: 'SecondaryDiagnoses',      label: 'Co-Pathologies',     group: 'Neuropathology', defaultVisible: true,  sortable: false, selector: r => secondaryDx(r) },
  { key: 'CoPathology',             label: 'Co-Pathology',       group: 'Neuropathology', defaultVisible: false, sortable: false, selector: r => yn((r.diagnosis?.length ?? 0) > 1) },
  { key: 'BraakStage',              label: 'Braak Stage',        group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.pathology?.braakStage ?? '—' },
  { key: 'ThalPhase',               label: 'Thal Phase',         group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.pathology?.thalPhase ?? '—' },
  { key: 'CERADNP',                 label: 'CERAD NP',           group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.pathology?.ceradNp ?? '—' },
  { key: 'NIAReaganScore',          label: 'NIA-Reagan',         group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.pathology?.niaReaganScore ?? '—' },

  // ── Genetics ─────────────────────────────────────────────
  { key: 'APOEGenotype',            label: 'APOE',               group: 'Genetics',       defaultVisible: true,  sortable: false, selector: r => { const v = gene(r, 'APOE'); return v !== '—' ? `ε${v}` : '—' } },
  { key: 'APOEDeterminationMethod', label: 'APOE Method',        group: 'Genetics',       defaultVisible: false, sortable: false, selector: r => r.genetics?.find(g => g.marker === 'APOE')?.method ?? '—' },
  { key: 'MAPT',                    label: 'MAPT',               group: 'Genetics',       defaultVisible: true,  sortable: false, selector: r => gene(r, 'MAPT') },
  { key: 'GBAGenotype',             label: 'GBA',                group: 'Genetics',       defaultVisible: false, sortable: false, selector: r => gene(r, 'GBA') },
  { key: 'GRNGenotype',             label: 'GRN',                group: 'Genetics',       defaultVisible: false, sortable: false, selector: r => gene(r, 'GRN') },
  { key: 'TMEM106brs1990622',       label: 'TMEM106B rs1990622', group: 'Genetics',       defaultVisible: false, sortable: false, selector: r => gene(r, 'TMEM106B_rs1990622') },
  { key: 'TMEM106brs3173615',       label: 'TMEM106B rs3173615', group: 'Genetics',       defaultVisible: false, sortable: false, selector: r => gene(r, 'TMEM106B_rs3173615') },

  // ── Tissue ───────────────────────────────────────────────
  { key: 'FrozenTissueAvailable',   label: 'Frozen',             group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => yn(r.tissue?.frozenAvailable) },
  { key: 'FixedTissueAvailable',    label: 'FFPE',               group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => yn(r.tissue?.fixedAvailable) },
  { key: 'PostmortemInterval',      label: 'PMI (hrs)',          group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue?.postmortemInterval ?? '—' },
  { key: 'DNAExtracted',            label: 'DNA Extracted',      group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.dnaExtracted) },
  { key: 'RNASeq',                  label: 'RNA-seq',            group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.rnaSeq) },
  { key: 'SpinalCord',              label: 'Spinal Cord',        group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.spinalCord) },
  { key: 'OlfactoryBulb',          label: 'Olfactory Bulb',     group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.olfactoryBulb) },
  { key: 'CSF',                     label: 'CSF',                group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.csf) },
  { key: 'UnstainedSlidesAvailable',label: 'Unstained Slides',   group: 'Tissue',         defaultVisible: false, sortable: false, selector: r => yn(r.tissue?.unstainedSlides) },

  // ── Intake / Metadata ────────────────────────────────────
  { key: 'BrainSource',             label: 'Brain Source',       group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.intake?.brainSource ?? '—' },
  { key: 'StudySource',             label: 'Study Source',       group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.intake?.studySource ?? '—' },
]

export const COLUMN_GROUPS: ColumnGroup[] = [
  'Identifiers', 'Demographics', 'Clinical', 'Neuropathology', 'Genetics', 'Tissue', 'Intake',
]

export const PHI_COLUMNS: ColumnKey[] = ['NPID', 'DOB', 'DOD']

export const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = Object.fromEntries(
  ALL_COLUMNS.map(c => [c.key, c.defaultVisible])
) as Record<ColumnKey, boolean>
