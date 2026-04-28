const fs           = require('fs')
const { unserialize } = require('php-serialize')
const applyFilters  = require('./applyFilters')

const DERIVED_COLUMNS = new Set(['PrimaryDiagnosis', 'SecondaryDiagnoses'])

function loadDocs(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  // Strip PHP header (e.g. "<?php exit(); ?>\n") if present
  const serialized = raw.replace(/^<\?php[\s\S]*?\?>\s*/m, '').trim()
  const parsed = unserialize(serialized)

  // unserialize returns an object keyed by index when PHP array is sequential
  const arr = Array.isArray(parsed) ? parsed : Object.values(parsed)
  return arr.map((doc, i) => ({ _id: String(i), ...doc }))
}

function compareVal(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function buildPhpAdapter(filePath) {
  console.log(`[db] MongoDB unavailable — loading PHP fallback from ${filePath}`)
  const docs = loadDocs(filePath)
  console.log(`[db] PHP adapter loaded ${docs.length} records`)

  return {
    async find(params, { sortBy = 'NPID', sortDir = 'asc', page = 1, limit = 50 } = {}) {
      const filtered = applyFilters(docs, params)
      const total    = filtered.length

      const sortField = DERIVED_COLUMNS.has(sortBy) ? 'NPID' : sortBy
      const sorted = filtered.slice().sort((a, b) => {
        const cmp = compareVal(a[sortField], b[sortField])
        return sortDir === 'desc' ? -cmp : cmp
      })

      const skip    = (page - 1) * limit
      const records = sorted.slice(skip, skip + limit)
      return { records, total }
    },

    async count(params) {
      return applyFilters(docs, params).length
    },
  }
}

module.exports = buildPhpAdapter
