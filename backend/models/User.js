const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  uid:         { type: String, required: true, unique: true },
  role:        { type: String, enum: ['admin', 'researcher'], default: 'researcher' },
  columnPrefs: { type: mongoose.Schema.Types.Mixed },
}, { collection: 'users' })

module.exports = mongoose.model('User', userSchema)
