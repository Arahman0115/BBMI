const express = require('express')
const router  = express.Router()
const Sample  = require('../models/Sample')

function stripPHI(record) {
  const r = { ...record }
  delete r.npid
  if (r.demographics) {
    r.demographics = { ...r.demographics }
    delete r.demographics.dob
    delete r.demographics.dod
  }
  return r
}

const SORT_FIELD_MAP = {
  NPID:                 'npid',
  AgeAtDeath:           'demographics.ageAtDeath',
  Sex:                  'demographics.sex',
  Race:                 'demographics.race',
  DOB:                  'demographics.dob',
  DOD:                  'demographics.dod',
  StateOfOriginOfBrain: 'intake.stateOfOrigin',
  ClinicalDiagnosis:    'clinical.clinicalDiagnosis',
  BraakStage:           'pathology.braakStage',
  ThalPhase:            'pathology.thalPhase',
  CERADNP:              'pathology.ceradNp',
  NIAReaganScore:       'pathology.niaReaganScore',
  FrozenTissueAvailable: 'tissue.frozenAvailable',
  FixedTissueAvailable:  'tissue.fixedAvailable',
  PostmortemInterval:    'tissue.postmortemInterval',
  BrainSource:           'intake.brainSource',
  StudySource:           'intake.studySource',
}

const TISSUE_FIELD_MAP = {
  frozen:           'tissue.frozenAvailable',
  ffpe:             'tissue.fixedAvailable',
  unstained_slides: 'tissue.unstainedSlides',
  spinal_cord:      'tissue.spinalCord',
  olfactory_bulb:   'tissue.olfactoryBulb',
  csf:              'tissue.csf',
}

function buildQuery(params) {
  const {
    idSearch, sex, race, ageRanges,
    thalPhases, braakStages, ceradScores,
    primaryDiagnosis, ad_type, secondaryDiagnoses,
    apoe, apoeMethod, mapt, studySource,
    clinicalDiagnosis,
    tissueAvailable,
    diagnosisOrderDx, diagnosisOrderMin, diagnosisOrderMax,
  } = params

  const toIn = val => {
  const a = [].concat(val);
  return a.length === 1 ? a[0] : { $in: a } }
  const filters = []

  if (idSearch) {
    const re = new RegExp(idSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filters.push({ npid: re })
  }

  if (sex)         filters.push({ 'demographics.sex':      toIn(sex) })
  if (race)        filters.push({ 'demographics.race':     toIn(race) })
  if (studySource) filters.push({ 'intake.studySource':    toIn(studySource) })

  if (apoe)       filters.push({ genetics: { $elemMatch: { marker: 'APOE', value: toIn([].concat(apoe).map(Number)) } } })
  if (apoeMethod) filters.push({ genetics: { $elemMatch: { marker: 'APOE', method: toIn(apoeMethod) } } })
  if (mapt)       filters.push({ genetics: { $elemMatch: { marker: 'MAPT', value: toIn(mapt) } } })

  if (clinicalDiagnosis) {
    const re = new RegExp([].concat(clinicalDiagnosis)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filters.push({ 'clinical.clinicalDiagnosis': { $elemMatch: { diagnosis: re } } })
  }

  if (ageRanges) {
    const ranges = ageRanges.split(';').map(s => {
      const [a, b] = s.trim().split('-').map(Number)
      return (!isNaN(a) && !isNaN(b)) ? { 'demographics.ageAtDeath': { $gte: a, $lte: b } } : null
    }).filter(Boolean)
    if (ranges.length > 0) filters.push({ $or: ranges })
  }

  if (thalPhases)  filters.push({ 'pathology.thalPhase':  { $in: [].concat(thalPhases).map(Number) } })
  if (braakStages) filters.push({ 'pathology.braakStage': { $in: [].concat(braakStages).map(Number) } })
  if (ceradScores) filters.push({ 'pathology.ceradNp':    { $in: [].concat(ceradScores) } })

  if (primaryDiagnosis) {
    filters.push({ diagnosis: { $elemMatch: { order: 1, specificType: { $in: [].concat(primaryDiagnosis) } } } })
  }
  if (ad_type) {
    filters.push({ diagnosis: { $elemMatch: { order: 1, subtype: { $in: [].concat(ad_type) } } } })
  }
  if (secondaryDiagnoses) {
    filters.push({ diagnosis: { $elemMatch: { order: { $gt: 1 }, category: { $in: [].concat(secondaryDiagnoses) } } } })
  }
  if (diagnosisOrderDx) {
    const min = Math.max(1, parseInt(diagnosisOrderMin) || 1)
    const max = Math.max(min, parseInt(diagnosisOrderMax) || 99)
    filters.push({ diagnosis: { $elemMatch: { category: diagnosisOrderDx, order: { $gte: min, $lte: max } } } })
  }

  if (tissueAvailable) {
    const tissueConds = [].concat(tissueAvailable)
      .map(t => TISSUE_FIELD_MAP[t])
      .filter(Boolean)
      .map(field => ({ [field]: true }))
    if (tissueConds.length === 1) filters.push(tissueConds[0])
    else if (tissueConds.length > 1) filters.push({ $or: tissueConds })
  }

  return filters.length > 0 ? { $and: filters } : {}
}

// GET /api/samples
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'NPID', sortDir = 'asc', ...filterParams } = req.query
    const pageNum   = Math.max(1, parseInt(page))
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit)))
    const skip      = (pageNum - 1) * limitNum
    const sortField = SORT_FIELD_MAP[sortBy] ?? 'npid'
    const sort      = { [sortField]: sortDir === 'desc' ? -1 : 1 }

    const query = buildQuery(filterParams)
    const [rawRecords, total] = await Promise.all([
      Sample.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Sample.countDocuments(query),
    ])

    const records = req.role === 'researcher' ? rawRecords.map(stripPHI) : rawRecords
    res.json({ records, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/samples/count
router.get('/count', async (req, res) => {
  try {
    const count = await Sample.countDocuments(buildQuery(req.query))
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/samples/:npid
router.get('/:npid', async (req, res) => {
  try {
    const raw = await Sample.findOne({ npid: req.params.npid }).lean()
    if (!raw) return res.status(404).json({ error: 'Not found' })
    res.json(req.role === 'researcher' ? stripPHI(raw) : raw)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router


/* Full query would look like this if filtering on race, brak stage, prim and secondary dx and tissue availability {
  $and: [
    // Multiple races
    {
      "demographics.race": { $in: ['White', 'Black', 'Hispanic'] }
    },

    // Braak stages
    {
      "pathology.braakStage": { $in: [3, 4, 5, 6] }
    },

    // Primary diagnosis: Alzheimers
    {
      diagnosis: { $elemMatch: { order: 1, specificType: { $in: ['Alzheimers'] } } }
    },

    // Secondary diagnosis: Parkinsons
    {
      diagnosis: { $elemMatch: { order: { $gt: 1 }, category: { $in: ['Parkinsons'] } } }
    },

    // Tissue available
    {
      brainTissue: true
    },
    {
      csfTissue: true
    },
    // ... other tissue types
  ]
}*/