const express = require('express')
const router  = express.Router()
const admin   = require('firebase-admin')
const User    = require('../models/User')

const requireAdmin = (req, res, next) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  next()
}

router.use(requireAdmin)

// GET /api/admin/users — list all users with Firebase email + role
router.get('/users', async (req, res) => {
  try {
    const dbUsers = await User.find({}).lean()
    const enriched = await Promise.all(
      dbUsers.map(async u => {
        try {
          const fbUser = await admin.auth().getUser(u.uid)
          return { uid: u.uid, email: fbUser.email ?? null, role: u.role ?? 'researcher' }
        } catch {
          return { uid: u.uid, email: null, role: u.role ?? 'researcher' }
        }
      })
    )
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/admin/users/:uid/role
router.put('/users/:uid/role', async (req, res) => {
  const { role } = req.body
  if (!['admin', 'researcher'].includes(role))
    return res.status(400).json({ error: 'Invalid role' })
  try {
    await User.findOneAndUpdate(
      { uid: req.params.uid },
      { role },
      { upsert: true }
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
