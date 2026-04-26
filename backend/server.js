require('dotenv').config()
const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const verifyToken = require('./middleware/auth')
const loadRole    = require('./middleware/loadRole')

const samplesRouter = require('./routes/samples')
const usersRouter   = require('./routes/users')
const adminRouter   = require('./routes/admin')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// All /api routes require a valid Firebase token + role lookup
app.use('/api', verifyToken)
app.use('/api', loadRole)

app.use('/api/samples', samplesRouter)
app.use('/api/users',   usersRouter)
app.use('/api/admin',   adminRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
