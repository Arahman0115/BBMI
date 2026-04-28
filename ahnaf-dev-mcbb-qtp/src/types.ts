// ============================================================
// types.ts
// Central type definitions for the Brain Bank Data Platform.
// ============================================================


// ------------------------------------------------------------
// PRIMITIVES / UNION TYPES  (used in FilterState)
// ------------------------------------------------------------

export type BraakStage  = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ThalPhase   = 0 | 1 | 2 | 3 | 4 | 5;
export type Sex         = 'Male' | 'Female';
export type ApoeGenotype  = '22' | '23' | '24' | '33' | '34' | '44';
export type AlzheimersType = 'Amnestic AD' | 'Atypical AD';
export type MaptHaplotype  = 'H1/H1' | 'H1/H2' | 'H2/H2';
export type ApoeMethod     = 'PCR-RFLP' | 'TaqMan Genotyping' | 'Sanger Sequencing' | 'SNP Array';
export type CeradScore     = 'Absent' | 'Sparse' | 'Moderate' | 'Frequent';


// ------------------------------------------------------------
// DIAGNOSIS ENTRY  (replaces primary_diagnosis / secondary_diagnoses)
// DiagnosisOrder === 1 is the primary diagnosis; 2+ are secondary.
// ------------------------------------------------------------
export interface DiagnosisEntry {
  NPID?:                string | null;
  DiagnosisOrder?:      number | null;
  DiseaseCategory?:     string | null;
  DiseaseSubtype?:      string | null;
  DiseaseSpecificType?: string | null;
  DiseaseStage?:        string | null;
  DiseaseDescriptor?:   string | null;
  DiseaseRegion?:       string | null;
  DiagnosisComments?:   string | null;
}


// ------------------------------------------------------------
// SLIDE ENTRY
// ------------------------------------------------------------
export interface SlideEntry {
  npid?:         string | null;
  brain_region?: string | null;
  stain_target?: string | null;
  hash?:         string | null;
}


// ------------------------------------------------------------
// DONOR RECORD
// ------------------------------------------------------------
export interface DonorRecord {
  _id?:                   string;

  // ── Identifiers ──────────────────────────────────────────
  ID?:                    string | null;
  NPID:                   string;
  AutopsyID?:             string | null;
  MayoClinicID?:          string | null;
  TruncatedMayoClinicID?: string | null;
  NACCPtid?:              string | null;
  PTNUM?:                 string | null;

  // ── Intake ───────────────────────────────────────────────
  DateReceived?:       string | null;
  BrainSource?:        string | null;
  StudySource?:        string | null;
  StateOfOriginOfBrain?: string | null;
  IRBNumber?:          string | null;
  IRBAlerts?:          string | null;
  ReceiveComments?:    string | null;

  // ── Demographics ─────────────────────────────────────────
  DOB?:        string | null;
  DOD?:        string | null;
  AgeAtDeath?: number | null;
  Sex?:        string | null;
  Race?:       string | null;

  // ── Clinical ─────────────────────────────────────────────
  ClinicalDiagnosis?:         string | null;
  ClinicalDiagnosisComments?: string | null;
  FamilyHistory?:             string | null;
  AgeAtOnset?:                number | null;
  DateOfOnset?:               string | null;
  DateOfSymptomOnset?:        string | null;
  Duration?:                  number | null;
  CognitiveStatus?:           string | null;
  MMSEScore?:                 number | null;
  MoCAScore?:                 number | null;
  CDRScore?:                  number | null;
  CDRSBScore?:                number | null;
  ALSFRSRScore?:              number | null;
  ImagingAvailable?:          boolean | number | null;
  SleepStudyAvailable?:       boolean | number | null;

  // ── Autopsy ──────────────────────────────────────────────
  BrainCuttingDate?:       string | null;
  BrainWeight?:            number | null;
  PostmortemInterval?:     number | null;
  GrossCharacteristics?:   string | null;
  MCJDiener?:              string | null;
  AutopsyNotes?:           string | null;
  UnstainedSlidesAvailable?: number | null;
  NumberStainedSlides?:    number | null;
  OriginalPathDx?:         string | null;
  OutsidePathDx?:          string | null;
  DigitalReportAvailable?: boolean | number | null;
  SignOutDate?:            string | null;
  CPCConferenceDate?:      string | null;

  // ── Neuropathology ───────────────────────────────────────
  ThalPhase?:            number | null;
  BraakStage?:           number | null;
  CERADNP?:              string | null;
  ABCScore?:             string | null;
  AScore?:               number | null;
  BScore?:               number | null;
  CScore?:               number | null;
  NIAReaganScore?:       string | null;
  ADSubtype?:            string | null;
  NIAAABiomarkerProfile?: string | null;
  PDBraakStage?:         number | null;
  LBDType?:              string | null;
  CDLBLikelihood?:       string | null;
  VaDSummary?:           string | null;
  VaDKalaria?:           string | null;
  KalariaModified?:      string | null;
  TDP43?:                boolean | number | null;
  TDPType?:              string | null;
  TDPTypeOld?:           string | null;

  // ── Tissue ───────────────────────────────────────────────
  SpinalCord?:              number | null;
  OlfactoryBulb?:           number | null;
  CSF?:                     number | null;
  FixedTissueAvailable?:    number | null;
  FixedTissueUnit?:         string | null;
  FixedTissueBoxNumber?:    string | null;
  FrozenTissueAvailable?:   number | null;
  FrozenTissueQuality?:     string | null;
  FrozenTissueCaseValue?:   string | null;
  FreezerNumber?:           string | null;
  FreezerBox?:              string | null;
  FreezeThawTimes?:         number | null;
  FrozenTissueComments?:    string | null;
  DNAExtracted?:            number | null;
  ExtractedDNANotInFreezer?: number | null;
  DNALocation?:             string | null;
  RNASeq?:                  number | null;

  // ── Genetics ─────────────────────────────────────────────
  APOEGenotype?:          string | null;
  APOEDeterminationMethod?: string | null;
  GBAGenotype?:           string | null;
  GRNGenotype?:           string | null;
  GRNrs5848?:             string | null;
  MAPT?:                  string | null;
  MOBP?:                  string | null;
  RIN?:                   number | null;
  SNCA?:                  string | null;
  TMEM106brs1990622?:     string | null;
  TMEM106brs3173615?:     string | null;

  // ── Diagnoses (ordered array) ─────────────────────────────
  diagnosis?: DiagnosisEntry[];

  // ── Slides ───────────────────────────────────────────────
  slides?: SlideEntry[];
}


// ------------------------------------------------------------
// FILTER STATE
// ------------------------------------------------------------
export interface FilterState {
  idSearch?:          string;
  sex?:               Sex;
  race?:              string[];
  ageRanges?:         string;
  thalPhases?:        ThalPhase[];
  braakStages?:       BraakStage[];
  ceradScores?:       CeradScore[];
  studySource?:       string[];
  primaryDiagnosis?:  string[];
  ad_type?:           AlzheimersType[];
  secondaryDiagnoses?: string[];
  apoe?:              ApoeGenotype[];
  apoeMethod?:        ApoeMethod;
  mapt?:              MaptHaplotype[];
  tissueAvailable?:   string[];
  diagnosisOrder?:    { diagnosis: string; min: number; max: number };
}
