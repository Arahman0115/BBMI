// ============================================================
// types.ts
// Central type definitions for the Brain Bank Data Platform.
// ============================================================


// ------------------------------------------------------------
// PRIMITIVES / UNION TYPES
// ------------------------------------------------------------

export type BraakStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ThalPhase = 0 | 1 | 2 | 3 | 4 | 5;
export type Sex = 'Male' | 'Female';
export type ApoeGenotype = '22' | '23' | '24' | '33' | '34' | '44';
export type AlzheimersType = 'Amnestic AD' | 'Atypical AD';
export type MaptHaplotype = 'H1/H1' | 'H1/H2' | 'H2/H2';
export type ApoeMethod = 'PCR-RFLP' | 'TaqMan Genotyping' | 'Sanger Sequencing' | 'SNP Array';
export type CeradScore = 'Absent' | 'Sparse' | 'Moderate' | 'Frequent';
export type FrozenTissueQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type CdlbLikelihood = 'High' | 'Intermediate' | 'Low' | 'No LBD';
export type LbdType = 'Diffuse' | 'Limbic' | 'Neocortical' | 'Brainstem' | 'None';
export type CognitiveStatus = 'NCI' | 'MCI' | 'Dementia';
export type NiaReaganScore = 'High' | 'Intermediate' | 'Low' | 'Not AD';


// ------------------------------------------------------------
// TISSUE
// ------------------------------------------------------------
export interface Tissue {
  // Fixed / FFPE
  ffpe_available: boolean;
  fixed_tissue_unit?: string;
  fixed_tissue_box_number?: string;

  // Frozen
  frozen_available: boolean;
  frozen_tissue_quality?: FrozenTissueQuality;
  frozen_tissue_case_value?: string;
  freezer_number?: string;
  freezer_box?: string;
  freeze_thaw_times?: number;
  frozen_tissue_comments?: string;

  // Nucleic acids
  dna_extracted: boolean;
  extracted_dna_not_in_freezer?: boolean;
  dna_location?: string;
  rna_seq_available: boolean;

  // General inventory
  blocks_available: number;
  regions_sampled: string[];
  postmortem_interval_hours: number;

  // Other biospecimens
  spinal_cord_available: boolean;
  olfactory_bulb_available: boolean;
  csf_available: boolean;
  unstained_slides_available: boolean;
  number_stained_slides: number;
}


// ------------------------------------------------------------
// DONOR RECORD
// ------------------------------------------------------------
export interface DonorRecord {
  // ── Identifiers ──────────────────────────────────────────
  id: number;
  npid: string;
  autopsy_id: string;
  mayo_clinic_id?: string;
  truncated_mayo_clinic_id?: string;
  nacc_ptid?: string;
  ptnum: string;
  irb_number: string;
  irb_alerts?: string;

  // ── Intake ───────────────────────────────────────────────
  date_received: string;
  brain_source: string;
  study_source: string;
  state_of_origin: string;
  receive_comments?: string;

  // ── Demographics ─────────────────────────────────────────
  dob: string;
  dod: string;
  age_at_death: number;
  sex: Sex;
  race: string;

  // ── Clinical ─────────────────────────────────────────────
  clinical_diagnosis: string;
  clinical_diagnosis_comments?: string;
  family_history?: string;
  age_at_onset?: number;
  date_of_onset?: string;
  date_of_symptom_onset?: string;
  duration_years?: number;
  cognitive_status: CognitiveStatus;
  mmse_score?: number;
  moca_score?: number;
  cdr_score?: number;
  cdr_sb_score?: number;
  alsfrs_r_score?: number;
  imaging_available: boolean;
  sleep_study_available: boolean;

  // ── Autopsy ──────────────────────────────────────────────
  brain_cutting_date: string;
  brain_weight_grams: number;
  gross_characteristics?: string;
  mcj_diener?: string;
  autopsy_notes?: string;
  original_path_dx: string;
  outside_path_dx?: string;
  digital_report_available: boolean;
  sign_out_date: string;
  cpc_conference_date?: string;

  // ── Neuropathology ───────────────────────────────────────
  braak_stage: BraakStage;
  thal_phase: ThalPhase;
  cerad_np?: CeradScore;
  abc_score?: string;
  a_score?: number;
  b_score?: number;
  c_score?: number;
  nia_reagan_score?: NiaReaganScore;
  primary_diagnosis: string;
  ad_type?: AlzheimersType;
  secondary_diagnoses: string[];
  nia_aa_biomarker_profile?: string;
  pd_braak_stage?: number;
  lbd_type?: LbdType;
  cdlb_likelihood?: CdlbLikelihood;
  va_d_summary?: string;
  va_d_kalaria?: string;
  kalaria_modified?: string;
  tdp43: boolean;
  tdp_type?: string;
  tdp_type_old?: string;

  // ── Genetics ─────────────────────────────────────────────
  apoe: ApoeGenotype;
  apoe_method: ApoeMethod;
  gba_genotype?: string;
  grn_genotype?: string;
  grn_rs5848?: string;
  mapt: MaptHaplotype;
  mobp?: string;
  rin?: number;
  snca?: string;
  tmem106b_rs1990622?: string;
  tmem106b_rs3173615?: string;

  // ── Tissue ───────────────────────────────────────────────
  tissue: Tissue;
}


// ------------------------------------------------------------
// FILTER STATE
// ------------------------------------------------------------
export interface FilterState {
  idSearch?: string;
  sex?: Sex;
  race?: string[];
  ageRanges?: string;
  thalPhases?: ThalPhase[];
  braakStages?: BraakStage[];
  ceradScores?: CeradScore[];
  primaryDiagnosis?: string[];
  ad_type?: AlzheimersType[];
  hasSecondaryDiagnosis?: boolean;
  secondaryDiagnosis?: string;
  apoe?: ApoeGenotype[];
  apoeMethod?: ApoeMethod;
  mapt?: MaptHaplotype[];
  frozenOnly?: boolean;
  ffpeOnly?: boolean;
}
