export type Sex            = 'Male' | 'Female'
export type ApoeGenotype   = '22' | '23' | '24' | '33' | '34' | '44'
export type AlzheimersType = 'Amnestic AD' | 'Atypical AD'
export type MaptHaplotype  = 'H1H1' | 'H1H2' | 'H2H2'
export type CeradScore     = 'None' | 'Sparse' | 'Moderate' | 'Frequent' | 'None - Sparse' | 'Sparse - Moderate' | 'Moderate - Frequent'
export type BraakStage     = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ThalPhase      = 0 | 1 | 2 | 3 | 4 | 5


// ------------------------------------------------------------
// SUBDOCUMENTS
// ------------------------------------------------------------

export interface Identifier {
  type?:  string | null
  value?: string | null
}

export interface GeneticRecord {
  marker?: string | null
  value?:  string | null
  method?: string | null
  source?: string | null
  notes?:  string | null
}

export interface DiagnosisRecord {
  order?:       number | null
  category?:    string | null
  subtype?:     string | null
  specificType?: string | null
  stage?:       string | null
  descriptor?:  string | null
  region?:      string | null
  comments?:    string | null
}

export interface SlideEntry {
  slideId?:     string | null
  brainRegion?: string | null
  stainTarget?: string | null
  filePath?:    string | null
  hash?:        string | null
}

export interface GrossImage {
  imageIndex?:       number | null
  originalFilename?: string | null
  hash?:             string | null
}


// ------------------------------------------------------------
// DONOR RECORD
// ------------------------------------------------------------

export interface ClinicalDiagnosisRecord {
  diagnosis?: string | null
  comments?:  string | null
}

export interface DonorRecord {
  _id?: string

  npid?: string

  identifiers?: Identifier[]

  demographics?: {
    dob?:        string | null
    dod?:        string | null
    ageAtDeath?: number | null
    sex?:        string | null
    race?:       string | null
  }

  intake?: {
    dateReceived?:    string | null
    brainSource?:     string | null
    studySource?:     string | null
    stateOfOrigin?:   string | null
    irbNumber?:       string | null
    irbAlerts?:       string | null
    receiveComments?: string | null
  }

  clinical?: {
    clinicalDiagnosis?: ClinicalDiagnosisRecord[]
    familyHistory?:     boolean | null
    cognitiveStatus?:   string | null
    ageAtOnset?:        number | null
    mmse?:              number | null
    moca?:              number | null
    cdr?:               number | null
    cdrsb?:             number | null
  }

  pathology?: {
    originalPathDx?:  string | null
    outsidePathDx?:   string | null
    thalPhase?:       number | null
    braakStage?:      number | null
    ceradNp?:         string | null
    abcScore?:        string | null
    niaReaganScore?:  string | null
    adSubtype?:       string | null
    lbdType?:         string | null
    cdlbLikelihood?:  string | null
    vaDSummary?:      string | null
    tdp43?:           boolean | null
    tdpType?:         string | null
  }

  tissue?: {
    blocksAvailable?:  number | null
    fixedAvailable?:   boolean | null
    fixedUnit?:        string | null
    fixedBox?:         string | null
    frozenAvailable?:  boolean | null
    frozenQuality?:    string | null
    frozenCaseValue?:  string | number | null
    dnaExtracted?:     boolean | null
    rnaSeq?:           boolean | null
    spinalCord?:       boolean | null
    olfactoryBulb?:    boolean | null
    csf?:              boolean | null
    unstainedSlides?:  boolean | null
    postmortemInterval?: number | null
    brainCuttingDate?: string | null
    brainWeight?:      number | null
  }

  genetics?:    GeneticRecord[]
  diagnosis?:   DiagnosisRecord[]
  contributing?: DiagnosisRecord[]
  incidental?:  DiagnosisRecord[]

  slides?:      SlideEntry[]
  grossImages?: GrossImage[]

  reports?: {
    clinicalReport?: { reportID?: string | null; hash?: string | null }
    npReport?:       { reportID?: string | null; hash?: string | null; observations?: string[] }
  }
}


// ------------------------------------------------------------
// FILTER STATE
// ------------------------------------------------------------

export interface FilterState {
  idSearch?:          string
  sex?:               Sex
  race?:              string[]
  ageRanges?:         string
  thalPhases?:        ThalPhase[]
  braakStages?:       BraakStage[]
  ceradScores?:       CeradScore[]
  studySource?:       string[]
  primaryDiagnosis?:  string[]
  ad_type?:           AlzheimersType[]
  secondaryDiagnoses?: string[]
  apoe?:              ApoeGenotype[]
  mapt?:              MaptHaplotype[]
  tissueAvailable?:   string[]
  diagnosisOrder?:    { diagnosis: string; min: number; max: number }
}
