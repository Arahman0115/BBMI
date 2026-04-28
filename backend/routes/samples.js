const express = require('express')
const router  = express.Router()

const PHI_FIELDS = ['NPID', 'AutopsyID', 'MayoClinicID', 'TruncatedMayoClinicID', 'NACCPtid', 'PTNUM', 'DOB', 'DOD', 'IRBNumber']

function stripPHI(record) {
  const r = { ...record }
  PHI_FIELDS.forEach(f => delete r[f])
  if (r.diagnosis) {
    r.diagnosis = r.diagnosis.map(d => { const dd = { ...d }; delete dd.NPID; return dd })
  }
  return r
}

// GET /api/samples
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'NPID', sortDir = 'asc', ...filterParams } = req.query
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))

    const { records: rawRecords, total } = await req.app.locals.db.find(filterParams, {
      sortBy, sortDir, page: pageNum, limit: limitNum,
    })

    const records = req.role === 'researcher' ? rawRecords.map(stripPHI) : rawRecords
    res.json({ records, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/samples/count
router.get('/count', async (req, res) => {
  try {
    const count = await req.app.locals.db.count(req.query)
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/samples/:npid  (Mongo-only — PHP adapter doesn't support single-record lookup by NPID when PHI is stripped)
router.get('/:npid', async (req, res) => {
  try {
    const { records } = await req.app.locals.db.find({ idSearch: req.params.npid }, { limit: 1 })
    const raw = records[0]
    if (!raw) return res.status(404).json({ error: 'Not found' })
    res.json(req.role === 'researcher' ? stripPHI(raw) : raw)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
