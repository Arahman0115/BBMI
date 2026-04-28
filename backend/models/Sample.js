const mongoose = require('mongoose')

// Explicitly type the fields used for filtering and sorting.
// strict:false passes all other document fields through in responses.
const diagnosisSchema = new mongoose.Schema({
  NPID:              String,
  DiagnosisOrder:    Number,
  DiseaseCategory:   String,
  DiseaseSubtype:    String,
  DiseaseSpecificType: String,
  DiseaseStage:      String,
  DiseaseDescriptor: String,
  DiseaseRegion:     String,
  DiagnosisComments: String,
}, { _id: false })

const sampleSchema = new mongoose.Schema({
  NPID:              String,
  AutopsyID:         String,
  MayoClinicID:      String,
  NACCPtid:          String,
  Sex:               mongoose.Schema.Types.Mixed,
  Race:              mongoose.Schema.Types.Mixed,
  AgeAtDeath:        Number,
  StudySource:       mongoose.Schema.Types.Mixed,
  BraakStage:        Number,
  ThalPhase:         Number,
  CERADNP:           String,
  APOEGenotype:      String,
  MAPT:              String,
  FrozenTissueAvailable: Number,
  FixedTissueAvailable:  Number,
  UnstainedSlidesAvailable: Number,
  SpinalCord:        Number,
  OlfactoryBulb:     Number,
  CSF:               Number,
  diagnosis:         [diagnosisSchema],
}, { strict: false, collection: 'samples' })

module.exports = mongoose.model('Sample', sampleSchema)
