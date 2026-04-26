const express = require('express')
const router  = express.Router()
const User    = require('../models/User')

// GET /api/users/:uid/preferences
router.get('/:uid/preferences', async (req, res) => {
  if (req.uid !== req.params.uid)
    return res.status(403).json({ error: 'Forbidden' })
  try {
    const user = await User.findOne({ uid: req.params.uid }).lean()
    res.json({ columnPrefs: user?.columnPrefs ?? null, role: user?.role ?? 'researcher' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/users/:uid/preferences
router.put('/:uid/preferences', async (req, res) => {
  if (req.uid !== req.params.uid)
    return res.status(403).json({ error: 'Forbidden' })
  try {
    await User.findOneAndUpdate(
      { uid: req.params.uid },
      { columnPrefs: req.body.columnPrefs },
      { upsert: true }
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
