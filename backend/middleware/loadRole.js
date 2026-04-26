const User = require('../models/User')

const loadRole = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.uid },
      { $setOnInsert: { uid: req.uid, role: 'researcher', columnPrefs: null } },
      { upsert: true, new: true }
    )
    req.role = user?.role ?? 'researcher'
  } catch (err) {
    console.error('loadRole error:', err)
    req.role = 'researcher'
  }
  next()
}

module.exports = loadRole
