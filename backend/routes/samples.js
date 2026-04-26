const express = require('express')
const router = express.Router()
const Sample = require('../models/Sample')

const PHI_FIELDS = ['npid', 'autopsy_id', 'mayo_clinic_id', 'truncated_mayo_clinic_id', 'nacc_ptid', 'ptnum', 'dob', 'dod', 'irb_number']

function stripPHI(record) {
  const r = { ...record }
  PHI_FIELDS.forEach(f => delete r[f])
  return r
}

// Accepts a single value or array; returns { $in: [...] } for multi, plain value for single
function toIn(val) {
  const arr = [].concat(val)
  return arr.length === 1 ? arr[0] : { $in: arr }
}

function buildQuery(params) {
  const {
    idSearch, sex, race, ageRanges,
    thalPhases, braakStages, ceradScores,
    primaryDiagnosis, ad_type,
    apoe, mapt,
    frozenOnly, ffpeOnly,
  } = params

  const filters = []

  if (idSearch) {
    const re = new RegExp(idSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filters.push({ $or: [{ npid: re }, { autopsy_id: re }, { mayo_clinic_id: re }, { nacc_ptid: re }] })
  }

  if (sex)              filters.push({ sex:               toIn(sex) })
  if (race)             filters.push({ race:              toIn(race) })
  if (primaryDiagnosis) filters.push({ primary_diagnosis: toIn(primaryDiagnosis) })
  if (ad_type)          filters.push({ ad_type:           toIn(ad_type) })
  if (apoe)             filters.push({ apoe:              toIn(apoe) })
  if (mapt)             filters.push({ mapt:              toIn(mapt) })

  if (ageRanges) {
    const ranges = ageRanges.split(';').map(s => {
      const [a, b] = s.trim().split('-').map(Number)
      return !isNaN(a) && !isNaN(b) ? { age_at_death: { $gte: a, $lte: b } } : null
    }).filter(Boolean)
    if (ranges.length > 0) filters.push({ $or: ranges })
  }

  if (thalPhases) {
    const phases = [].concat(thalPhases).map(Number)
    filters.push({ thal_phase: { $in: phases } })
  }

  if (braakStages) {
    const stages = [].concat(braakStages).map(Number)
    filters.push({ braak_stage: { $in: stages } })
  }

  if (ceradScores) {
    const scores = [].concat(ceradScores)
    filters.push({ cerad_np: { $in: scores } })
  }

  if (frozenOnly === 'true') filters.push({ 'tissue.frozen_available': true })
  if (ffpeOnly === 'true')   filters.push({ 'tissue.ffpe_available': true })

  return filters.length > 0 ? { $and: filters } : {}
}

// GET /api/samples — paginated, filtered results
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'npid', sortDir = 'asc', ...filterParams } = req.query

    const query    = buildQuery(filterParams)
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum
    const sort     = { [sortBy]: sortDir === 'desc' ? -1 : 1 }

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

// GET /api/samples/count — live count for filter preview (no data transferred)
router.get('/count', async (req, res) => {
  try {
    const count = await Sample.countDocuments(buildQuery(req.query))
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/samples/:id — single record
router.get('/:id', async (req, res) => {
  try {
    const raw = await Sample.findOne({ id: parseInt(req.params.id) }).lean()
    if (!raw) return res.status(404).json({ error: 'Not found' })
    res.json(req.role === 'researcher' ? stripPHI(raw) : raw)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
