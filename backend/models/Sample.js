const mongoose = require('mongoose')

const identifierSchema = new mongoose.Schema({
  type:  String,
  value: String,
}, { _id: false })

const geneticSchema = new mongoose.Schema({
  marker: String,
  value:  String,
  method: String,
  source: String,
  notes:  String,
}, { _id: false })

const diagnosisSchema = new mongoose.Schema({
  order:       Number,
  category:    String,
  subtype:     String,
  specificType: String,
  stage:       String,
  descriptor:  String,
  region:      String,
  comments:    String,
}, { _id: false })

const slideSchema = new mongoose.Schema({
  slideId:     String,
  brainRegion: String,
  stainTarget: String,
  filePath:    String,
  hash:        String,
}, { _id: false })

const grossImageSchema = new mongoose.Schema({
  imageIndex:       Number,
  originalFilename: String,
  hash:             String,
}, { _id: false })

const clinicalDiagnosisSchema = new mongoose.Schema({
  diagnosis: String,
  comments:  String,
}, { _id: false })

const sampleSchema = new mongoose.Schema({
  npid: { type: String, index: true },

  identifiers: [identifierSchema],

  demographics: {
    dob:        String,
    dod:        String,
    ageAtDeath: Number,
    sex:        String,
    race:       String,
  },

  intake: {
    dateReceived:    String,
    brainSource:     String,
    studySource:     String,
    stateOfOrigin:   String,
    irbNumber:       String,
    irbAlerts:       String,
    receiveComments: String,
  },

  clinical: {
    clinicalDiagnosis: [clinicalDiagnosisSchema],
    familyHistory:     Boolean,
    cognitiveStatus:   String,
    ageAtOnset:        Number,
    mmse:              Number,
    moca:              Number,
    cdr:               Number,
    cdrsb:             Number,
  },

  pathology: {
    originalPathDx:  String,
    outsidePathDx:   String,
    thalPhase:       Number,
    braakStage:      Number,
    ceradNp:         String,
    abcScore:        String,
    niaReaganScore:  String,
    adSubtype:       String,
    lbdType:         String,
    cdlbLikelihood:  String,
    vaDSummary:      String,
    tdp43:           Boolean,
    tdpType:         String,
  },

  tissue: {
    blocksAvailable:   Number,
    fixedAvailable:    Boolean,
    fixedUnit:         String,
    fixedBox:          String,
    frozenAvailable:   Boolean,
    frozenQuality:     String,
    frozenCaseValue:   mongoose.Schema.Types.Mixed,
    dnaExtracted:      Boolean,
    rnaSeq:            Boolean,
    spinalCord:        Boolean,
    olfactoryBulb:     Boolean,
    csf:               Boolean,
    unstainedSlides:   Boolean,
    postmortemInterval: Number,
    brainCuttingDate:  String,
    brainWeight:       Number,
  },

  genetics:    [geneticSchema],
  diagnosis:   [diagnosisSchema],
  contributing: [diagnosisSchema],
  incidental:  [diagnosisSchema],

  slides:      [slideSchema],
  grossImages: [grossImageSchema],

  reports: {
    clinicalReport: { reportID: String, hash: String },
    npReport:       { reportID: String, hash: String, observations: [String] },
  },

}, { strict: false, collection: 'samples' })

module.exports = mongoose.model('Sample', sampleSchema)
