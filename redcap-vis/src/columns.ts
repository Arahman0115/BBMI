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
  | 'npid' | 'autopsy_id' | 'id' | 'mayo_clinic_id' | 'truncated_mayo_clinic_id' | 'nacc_ptid' | 'ptnum'
  // Demographics
  | 'age_at_death' | 'sex' | 'race' | 'dob' | 'dod'
  // Clinical
  | 'cognitive_status' | 'clinical_diagnosis' | 'mmse_score' | 'moca_score'
  | 'cdr_score' | 'cdr_sb_score' | 'imaging_available' | 'sleep_study_available'
  // Neuropathology
  | 'primary_diagnosis' | 'secondary_diagnoses' | 'braak_stage' | 'thal_phase'
  | 'cerad_np' | 'abc_score' | 'nia_reagan_score' | 'ad_type'
  | 'nia_aa_biomarker_profile' | 'lbd_type' | 'cdlb_likelihood' | 'tdp43' | 'tdp_type'
  // Genetics
  | 'apoe' | 'apoe_method' | 'mapt' | 'gba_genotype' | 'grn_genotype'
  | 'rin' | 'tmem106b_rs1990622' | 'tmem106b_rs3173615'
  // Tissue
  | 'frozen_available' | 'ffpe_available' | 'blocks_available' | 'postmortem_interval'
  | 'dna_extracted' | 'rna_seq_available' | 'spinal_cord_available' | 'csf_available'
  | 'frozen_tissue_quality' | 'unstained_slides_available' | 'number_stained_slides'
  // Intake
  | 'brain_source' | 'study_source' | 'state_of_origin' | 'date_received'
  | 'irb_number' | 'brain_weight_grams'

export interface ColumnDef {
  key: ColumnKey
  label: string
  group: ColumnGroup
  defaultVisible: boolean
  selector: (row: DonorRecord) => string | number
  sortable?: boolean
}

export const ALL_COLUMNS: ColumnDef[] = [
  // ── Identifiers ──────────────────────────────────────────
  { key: 'npid',                    label: 'NPID',                  group: 'Identifiers',    defaultVisible: true,  sortable: true,  selector: r => r.npid },
  { key: 'autopsy_id',              label: 'Autopsy ID',            group: 'Identifiers',    defaultVisible: true,  sortable: true,  selector: r => r.autopsy_id },
  { key: 'id',                      label: 'ID',                    group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.id },
  { key: 'mayo_clinic_id',          label: 'Mayo Clinic ID',        group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.mayo_clinic_id ?? '—' },
  { key: 'truncated_mayo_clinic_id',label: 'Truncated Mayo ID',     group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.truncated_mayo_clinic_id ?? '—' },
  { key: 'nacc_ptid',               label: 'NACC PTID',             group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.nacc_ptid ?? '—' },
  { key: 'ptnum',                   label: 'PTNUM',                 group: 'Identifiers',    defaultVisible: false, sortable: true,  selector: r => r.ptnum },

  // ── Demographics ─────────────────────────────────────────
  { key: 'age_at_death',            label: 'Age at Death',          group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.age_at_death },
  { key: 'sex',                     label: 'Sex',                   group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.sex },
  { key: 'race',                    label: 'Race',                  group: 'Demographics',   defaultVisible: true,  sortable: true,  selector: r => r.race },
  { key: 'dob',                     label: 'DOB',                   group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.dob },
  { key: 'dod',                     label: 'DOD',                   group: 'Demographics',   defaultVisible: false, sortable: true,  selector: r => r.dod },

  // ── Clinical ─────────────────────────────────────────────
  { key: 'cognitive_status',        label: 'Cognitive Status',      group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.cognitive_status },
  { key: 'clinical_diagnosis',      label: 'Clinical Diagnosis',    group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.clinical_diagnosis },
  { key: 'mmse_score',              label: 'MMSE',                  group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.mmse_score ?? '—' },
  { key: 'moca_score',              label: 'MoCA',                  group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.moca_score ?? '—' },
  { key: 'cdr_score',               label: 'CDR',                   group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.cdr_score ?? '—' },
  { key: 'cdr_sb_score',            label: 'CDR-SB',                group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.cdr_sb_score ?? '—' },
  { key: 'imaging_available',       label: 'Imaging',               group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.imaging_available ? 'Yes' : 'No' },
  { key: 'sleep_study_available',   label: 'Sleep Study',           group: 'Clinical',       defaultVisible: false, sortable: true,  selector: r => r.sleep_study_available ? 'Yes' : 'No' },

  // ── Neuropathology ───────────────────────────────────────
  { key: 'primary_diagnosis',       label: 'Primary Diagnosis',     group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.primary_diagnosis },
  { key: 'secondary_diagnoses',     label: 'Co-Pathologies',        group: 'Neuropathology', defaultVisible: true,  sortable: false, selector: r => r.secondary_diagnoses?.join(', ') || '—' },
  { key: 'braak_stage',             label: 'Braak Stage',           group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.braak_stage },
  { key: 'thal_phase',              label: 'Thal Phase',            group: 'Neuropathology', defaultVisible: true,  sortable: true,  selector: r => r.thal_phase },
  { key: 'cerad_np',                label: 'CERAD NP',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.cerad_np ?? '—' },
  { key: 'abc_score',               label: 'ABC Score',             group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.abc_score ?? '—' },
  { key: 'nia_reagan_score',        label: 'NIA-Reagan',            group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.nia_reagan_score ?? '—' },
  { key: 'ad_type',                 label: 'AD Subtype',            group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.ad_type ?? '—' },
  { key: 'nia_aa_biomarker_profile',label: 'NIA-AA Profile',        group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.nia_aa_biomarker_profile ?? '—' },
  { key: 'lbd_type',                label: 'LBD Type',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.lbd_type ?? '—' },
  { key: 'cdlb_likelihood',         label: 'CDLB Likelihood',       group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.cdlb_likelihood ?? '—' },
  { key: 'tdp43',                   label: 'TDP-43',                group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.tdp43 ? 'Yes' : 'No' },
  { key: 'tdp_type',                label: 'TDP Type',              group: 'Neuropathology', defaultVisible: false, sortable: true,  selector: r => r.tdp_type ?? '—' },

  // ── Genetics ─────────────────────────────────────────────
  { key: 'apoe',                    label: 'APOE',                  group: 'Genetics',       defaultVisible: true,  sortable: true,  selector: r => r.apoe },
  { key: 'apoe_method',             label: 'APOE Method',           group: 'Genetics',       defaultVisible: true,  sortable: true,  selector: r => r.apoe_method },
  { key: 'mapt',                    label: 'MAPT',                  group: 'Genetics',       defaultVisible: true,  sortable: true,  selector: r => r.mapt },
  { key: 'gba_genotype',            label: 'GBA',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.gba_genotype ?? '—' },
  { key: 'grn_genotype',            label: 'GRN',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.grn_genotype ?? '—' },
  { key: 'rin',                     label: 'RIN',                   group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.rin ?? '—' },
  { key: 'tmem106b_rs1990622',      label: 'TMEM106B rs1990622',    group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.tmem106b_rs1990622 ?? '—' },
  { key: 'tmem106b_rs3173615',      label: 'TMEM106B rs3173615',    group: 'Genetics',       defaultVisible: false, sortable: true,  selector: r => r.tmem106b_rs3173615 ?? '—' },

  // ── Tissue ───────────────────────────────────────────────
  { key: 'frozen_available',        label: 'Frozen',                group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => r.tissue.frozen_available ? 'Yes' : 'No' },
  { key: 'ffpe_available',          label: 'FFPE',                  group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => r.tissue.ffpe_available ? 'Yes' : 'No' },
  { key: 'blocks_available',        label: 'Blocks',                group: 'Tissue',         defaultVisible: true,  sortable: true,  selector: r => r.tissue.blocks_available },
  { key: 'postmortem_interval',     label: 'PMI (hrs)',             group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.postmortem_interval_hours },
  { key: 'dna_extracted',           label: 'DNA Extracted',         group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.dna_extracted ? 'Yes' : 'No' },
  { key: 'rna_seq_available',       label: 'RNA-seq',               group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.rna_seq_available ? 'Yes' : 'No' },
  { key: 'spinal_cord_available',   label: 'Spinal Cord',           group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.spinal_cord_available ? 'Yes' : 'No' },
  { key: 'csf_available',           label: 'CSF',                   group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.csf_available ? 'Yes' : 'No' },
  { key: 'frozen_tissue_quality',   label: 'Frozen Quality',        group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.frozen_tissue_quality ?? '—' },
  { key: 'unstained_slides_available', label: 'Unstained Slides',   group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.unstained_slides_available ? 'Yes' : 'No' },
  { key: 'number_stained_slides',   label: 'Stained Slides #',      group: 'Tissue',         defaultVisible: false, sortable: true,  selector: r => r.tissue.number_stained_slides },

  // ── Intake ───────────────────────────────────────────────
  { key: 'brain_source',            label: 'Brain Source',          group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.brain_source },
  { key: 'study_source',            label: 'Study Source',          group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.study_source },
  { key: 'state_of_origin',         label: 'State of Origin',       group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.state_of_origin },
  { key: 'date_received',           label: 'Date Received',         group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.date_received },
  { key: 'irb_number',              label: 'IRB Number',            group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.irb_number },
  { key: 'brain_weight_grams',      label: 'Brain Weight (g)',      group: 'Intake',         defaultVisible: false, sortable: true,  selector: r => r.brain_weight_grams },
]

export const COLUMN_GROUPS: ColumnGroup[] = [
  'Identifiers', 'Demographics', 'Clinical', 'Neuropathology', 'Genetics', 'Tissue', 'Intake',
]

export const PHI_COLUMNS: ColumnKey[] = [
  'npid', 'autopsy_id', 'mayo_clinic_id', 'truncated_mayo_clinic_id', 'nacc_ptid', 'ptnum',
  'dob', 'dod',
  'irb_number',
]

export const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = Object.fromEntries(
  ALL_COLUMNS.map(c => [c.key, c.defaultVisible])
) as Record<ColumnKey, boolean>
