const mongoose = require('mongoose')

// Only the fields we filter/sort on are typed explicitly.
// strict:false passes all other document fields through in responses.
const sampleSchema = new mongoose.Schema({
  id:                Number,
  npid:              String,
  autopsy_id:        String,
  mayo_clinic_id:    String,
  nacc_ptid:         String,
  sex:               String,
  race:              String,
  age_at_death:      Number,
  primary_diagnosis: String,
  ad_type:           String,
  braak_stage:       Number,
  thal_phase:        Number,
  apoe:              String,
  mapt:              String,
}, { strict: false, collection: 'samples' })

module.exports = mongoose.model('Sample', sampleSchema)
