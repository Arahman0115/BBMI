require('dotenv').config()
const express     = require('express')
const mongoose    = require('mongoose')
const cors        = require('cors')
const verifyToken = require('./middleware/auth')
const loadRole    = require('./middleware/loadRole')
const mongoAdapter = require('./db/mongoAdapter')
const buildPhpAdapter = require('./db/phpAdapter')

const samplesRouter = require('./routes/samples')
const usersRouter   = require('./routes/users')
const adminRouter   = require('./routes/admin')

const app = express()
app.use(cors())
app.use(express.json())

async function startServer() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { serverSelectionTimeoutMS: 5000 })
    console.log('[db] Connected to MongoDB')
    app.locals.db = mongoAdapter
  } catch (err) {
    console.warn(`[db] MongoDB unavailable (${err.message})`)
    const phpPath = process.env.PHP_DB_PATH
    if (!phpPath) {
      console.error('[db] PHP_DB_PATH not set — cannot start without a database')
      process.exit(1)
    }
    app.locals.db = buildPhpAdapter(phpPath)
  }

  app.use('/api', verifyToken)
  app.use('/api', loadRole)
  app.use('/api/samples', samplesRouter)
  app.use('/api/users',   usersRouter)
  app.use('/api/admin',   adminRouter)

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`[api] Running on http://localhost:${PORT}`))
}

startServer()
