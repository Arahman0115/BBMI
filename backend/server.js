require('dotenv').config()
const express     = require('express')
const mongoose    = require('mongoose')
const cors        = require('cors')
const verifyToken = require('./middleware/auth')
const loadRole    = require('./middleware/loadRole')

const samplesRouter = require('./routes/samples')
const usersRouter   = require('./routes/users')
const adminRouter   = require('./routes/admin')

const isProd = process.env.NODE_ENV === 'production'

const app = express()
if (isProd) app.set('trust proxy', 1)
if (!isProd) app.use(cors())
app.use(express.json())

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.use('/api', verifyToken)
app.use('/api', loadRole)

app.use('/api/samples', samplesRouter)
app.use('/api/users',   usersRouter)
app.use('/api/admin',   adminRouter)

const PORT = process.env.PORT || 3000
const HOST = isProd ? '127.0.0.1' : 'localhost'
app.listen(PORT, HOST, () => console.log(`API running on http://${HOST}:${PORT}`))
