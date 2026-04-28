const Sample = require('../models/Sample')

const DERIVED_COLUMNS = new Set(['PrimaryDiagnosis', 'SecondaryDiagnoses'])

function buildQuery(params) {
  const {
    idSearch, sex, race, ageRanges,
    thalPhases, braakStages, ceradScores,
    primaryDiagnosis, ad_type, secondaryDiagnoses,
    apoe, mapt, studySource,
    tissueAvailable,
    diagnosisOrderDx, diagnosisOrderMin, diagnosisOrderMax,
  } = params

  const TISSUE_FIELD_MAP = {
    frozen:           'FrozenTissueAvailable',
    ffpe:             'FixedTissueAvailable',
    unstained_slides: 'UnstainedSlidesAvailable',
    spinal_cord:      'SpinalCord',
    olfactory_bulb:   'OlfactoryBulb',
    csf:              'CSF',
  }

  const toIn = val => { const a = [].concat(val); return a.length === 1 ? a[0] : { $in: a } }
  const filters = []

  if (idSearch) {
    const re = new RegExp(idSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filters.push({ $or: [{ NPID: re }, { AutopsyID: re }, { MayoClinicID: re }, { NACCPtid: re }] })
  }

  if (sex)         filters.push({ Sex:          toIn(sex) })
  if (race)        filters.push({ Race:         toIn(race) })
  if (studySource) filters.push({ StudySource:  toIn(studySource) })
  if (apoe)        filters.push({ APOEGenotype: toIn(apoe) })
  if (mapt)        filters.push({ MAPT:         toIn(mapt) })

  if (ageRanges) {
    const ranges = ageRanges.split(';').map(s => {
      const [a, b] = s.trim().split('-').map(Number)
      return (!isNaN(a) && !isNaN(b)) ? { AgeAtDeath: { $gte: a, $lte: b } } : null
    }).filter(Boolean)
    if (ranges.length > 0) filters.push({ $or: ranges })
  }

  if (thalPhases)  filters.push({ ThalPhase: { $in: [].concat(thalPhases).map(Number) } })
  if (braakStages) filters.push({ BraakStage: { $in: [].concat(braakStages).map(Number) } })
  if (ceradScores) filters.push({ CERADNP: { $in: [].concat(ceradScores) } })

  if (primaryDiagnosis) {
    filters.push({ diagnosis: { $elemMatch: { DiagnosisOrder: 1, DiseaseCategory: { $in: [].concat(primaryDiagnosis) } } } })
  }
  if (secondaryDiagnoses) {
    filters.push({ diagnosis: { $elemMatch: { DiagnosisOrder: { $gt: 1 }, DiseaseCategory: { $in: [].concat(secondaryDiagnoses) } } } })
  }
  if (ad_type) {
    filters.push({ diagnosis: { $elemMatch: { DiagnosisOrder: 1, DiseaseSubtype: { $in: [].concat(ad_type) } } } })
  }
  if (diagnosisOrderDx) {
    const min = Math.max(1, parseInt(diagnosisOrderMin) || 1)
    const max = Math.max(min, parseInt(diagnosisOrderMax) || 99)
    filters.push({ diagnosis: { $elemMatch: { DiseaseCategory: diagnosisOrderDx, DiagnosisOrder: { $gte: min, $lte: max } } } })
  }

  if (tissueAvailable) {
    ;[].concat(tissueAvailable).forEach(t => {
      const field = TISSUE_FIELD_MAP[t]
      if (field) filters.push({ [field]: { $gt: 0 } })
    })
  }

  return filters.length > 0 ? { $and: filters } : {}
}

const mongoAdapter = {
  async find(params, { sortBy = 'NPID', sortDir = 'asc', page = 1, limit = 50 } = {}) {
    const query     = buildQuery(params)
    const skip      = (page - 1) * limit
    const sortField = DERIVED_COLUMNS.has(sortBy) ? 'NPID' : sortBy
    const sort      = { [sortField]: sortDir === 'desc' ? -1 : 1 }

    const [records, total] = await Promise.all([
      Sample.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Sample.countDocuments(query),
    ])
    return { records, total }
  },

  async count(params) {
    return Sample.countDocuments(buildQuery(params))
  },
}

module.exports = mongoAdapter
