// This has two purposes, one is to of course load the role of the user that is currently using the application
// But additionally assign the role of a researcher to a new user
// The researcher role has the least priviledges, while admin has the highest
// we can add more roles as we go, I've also created a frontend admin page that can see all users and then assign roles
// them
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
