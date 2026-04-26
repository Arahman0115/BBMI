# How Express, Firebase, and Mongoose Work Together

This document explains what each technology does, how they fit together, and walks through the actual code in this project.

---

## The Big Picture

Think of a request going through three gates before it gets a response:

```
Frontend (React)
       │
       │  HTTP request with a token in the header
       ▼
┌──────────────────────────────────────────────┐
│              Express (server.js)             │  ← The web server
│                                              │
│  Gate 1: verifyToken  (Firebase Admin SDK)   │  ← "Is this a real logged-in user?"
│  Gate 2: loadRole     (Mongoose/MongoDB)     │  ← "What role does this user have?"
│  Gate 3: route handler (Mongoose/MongoDB)    │  ← "OK, do the actual work"
└──────────────────────────────────────────────┘
       │
       ▼
  MongoDB (the database)
```

Each technology owns a different piece of that chain.

---

## 1. Express — The Web Server

**What it is:** Express is a Node.js framework that listens for HTTP requests and routes them to the right handler function.

**What it does in this project:**
- Starts an HTTP server on port 3000
- Parses incoming JSON request bodies
- Defines which URL paths map to which code
- Runs middleware (code that runs before the final handler)

### Key Express syntax

**Starting the server** (`server.js:12–29`):
```js
const app = express()

app.use(cors())          // Allow requests from the frontend domain
app.use(express.json())  // Parse JSON bodies automatically

app.listen(3000, () => console.log('API running on http://localhost:3000'))
```

**Registering middleware for a path prefix** (`server.js:21–22`):
```js
app.use('/api', verifyToken)  // Run verifyToken before every /api/* route
app.use('/api', loadRole)     // Then run loadRole
```
`app.use(path, fn)` means: for every request whose URL starts with `path`, run `fn` first.

**Mounting a router** (`server.js:24–26`):
```js
app.use('/api/samples', samplesRouter)
```
This says: hand off any request starting with `/api/samples` to `samplesRouter`. The router then handles the rest of the URL (e.g. `/api/samples/count` → the `/count` handler inside that router).

**Defining routes inside a router** (`routes/samples.js:72`):
```js
const router = express.Router()

router.get('/', async (req, res) => {      // GET /api/samples
  res.json({ records: [...] })
})

router.get('/count', async (req, res) => { // GET /api/samples/count
  res.json({ count: 42 })
})

router.get('/:id', async (req, res) => {   // GET /api/samples/123
  // req.params.id === "123"
  res.json({ ... })
})
```

**The req and res objects:**
- `req` — the incoming request. Holds `req.query` (URL params like `?page=2`), `req.body` (JSON body), `req.params` (path wildcards like `:id`), and `req.headers`.
- `res` — the outgoing response. `res.json(data)` sends JSON back. `res.status(404).json(...)` sends a specific HTTP status code first.

**What middleware is:**
A middleware function has the signature `(req, res, next)`. It can read/modify `req` and `res`, then call `next()` to pass control to the next middleware or route handler. If it never calls `next()`, the request stops there.

---

## 2. Firebase Admin SDK — Authentication

**What it is:** Firebase is Google's backend platform. The *Admin SDK* is a server-side library that can verify tokens issued by Firebase Auth (the login system used by your frontend).

**What it does in this project:**
- The frontend logs in via Firebase Auth and receives a short-lived *ID token* (a signed JWT string).
- The frontend sends that token on every API request in the `Authorization` header.
- The backend uses Firebase Admin to verify the token is real and not expired.
- If valid, it extracts the user's unique ID (`uid`) and attaches it to `req`.

### Key Firebase Admin syntax

**Initializing Firebase once** (`middleware/auth.js:1–7`):
```js
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../service_account.json')),
  })
}
```
`service_account.json` is a private key file downloaded from the Firebase console. It proves to Google that this server is authorized to use your Firebase project. The `if (!admin.apps.length)` guard prevents double-initialization if this file is required multiple times.

**Verifying a token** (`middleware/auth.js:9–21`):
```js
const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization          // "Bearer eyJhbGci..."
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = header.slice(7)                     // Strip "Bearer " prefix
  const decoded = await admin.auth().verifyIdToken(token)
  req.uid = decoded.uid                             // Attach uid to request
  next()                                            // Pass to next middleware
}
```
`admin.auth().verifyIdToken(token)` makes a call to Google's servers to validate the token's signature and check it hasn't expired. If it's invalid, it throws and we return 401. If it's valid, `decoded.uid` is the user's permanent Firebase UID (a string like `"xK9mP2abc..."`).

**Looking up a Firebase user by UID** (`routes/admin.js:19–22`):
```js
const fbUser = await admin.auth().getUser(u.uid)
fbUser.email   // The user's email address from Firebase
```
This is used in the admin panel to show who each user is (their email), since the MongoDB `users` collection only stores UIDs.

---

## 3. Mongoose — Database Access

**What it is:** Mongoose is a library that connects Node.js to MongoDB. It lets you define the *shape* of your data (a Schema), then gives you a clean JavaScript API to read and write documents in the database.

**What it does in this project:**
- Connects to MongoDB at startup.
- Provides two models — `Sample` and `User` — that map to collections in the database.
- All database reads and writes go through these models.

### Key Mongoose syntax

**Connecting to the database** (`server.js:16–18`):
```js
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))
```
`DATABASE_URL` in `.env` is a MongoDB connection string like `mongodb+srv://user:pass@cluster.mongodb.net/dbname`. This opens a persistent connection pool that all models share.

**Defining a Schema** (`models/User.js`):
```js
const userSchema = new mongoose.Schema({
  uid:         { type: String, required: true, unique: true },
  role:        { type: String, enum: ['admin', 'researcher'], default: 'researcher' },
  columnPrefs: { type: mongoose.Schema.Types.Mixed },  // Can be any shape
}, { collection: 'users' })                            // Maps to the "users" collection
```
A Schema defines what fields a document has, their types, constraints (`required`, `unique`), and defaults. `Mixed` means "any JSON value."

**The Sample schema uses `strict: false`** (`models/Sample.js:20`):
```js
}, { strict: false, collection: 'samples' })
```
`strict: false` means Mongoose will return all fields from the database document, even ones not listed in the Schema. This is needed because sample records have many dynamic fields that would be tedious to enumerate, but we still want a few fields explicitly typed for filtering and sorting.

**Creating a Model** (both model files):
```js
module.exports = mongoose.model('User', userSchema)
module.exports = mongoose.model('Sample', sampleSchema)
```
`mongoose.model('Name', schema)` returns a Model class. The first argument is just an internal name. The `collection` option in the schema controls the actual MongoDB collection name.

**Common Model methods used in this project:**

```js
// Find many documents matching a filter
const records = await Sample.find({ sex: 'M' })

// Find many, then chain sorting/pagination
const records = await Sample.find(query)
  .sort({ age_at_death: 1 })   // 1 = ascending, -1 = descending
  .skip(50)                    // Skip first 50 results (pagination offset)
  .limit(25)                   // Return at most 25 results
  .lean()                      // Return plain JS objects instead of Mongoose docs (faster)

// Count matching documents without fetching them
const count = await Sample.countDocuments(query)

// Find one document
const user = await User.findOne({ uid: 'xK9mP2abc' })

// Update one document, create it if it doesn't exist (upsert)
const user = await User.findOneAndUpdate(
  { uid: req.uid },                                          // filter
  { $setOnInsert: { uid: req.uid, role: 'researcher' } },   // what to write
  { upsert: true, new: true }                               // options
)
```

**What `upsert: true` means:**
"If no document matches the filter, create one." Used in `loadRole` so that the first time a user hits the API, their record is automatically created in MongoDB with the default `researcher` role.

**What `$setOnInsert` means:**
A MongoDB operator meaning "only apply these fields when inserting — don't overwrite them on updates." Used in `loadRole` so that if the user already exists, their role isn't accidentally reset.

**What `.lean()` means:**
By default, `.find()` returns Mongoose Document objects (which have methods, change-tracking, etc.). `.lean()` skips all that and returns plain JavaScript objects — faster and lighter when you only need to read the data.

---

## How All Three Work Together — A Full Request Walkthrough

**Request:** `GET /api/samples?sex=M&page=2` with header `Authorization: Bearer <token>`

```
1. Express receives the request and matches the /api prefix.

2. verifyToken runs (Firebase Admin):
   - Reads the "Bearer <token>" header
   - Calls admin.auth().verifyIdToken(token) → Google validates the JWT
   - Attaches decoded.uid to req.uid
   - Calls next()

3. loadRole runs (Mongoose):
   - Calls User.findOneAndUpdate({ uid: req.uid }, ..., { upsert: true })
   - MongoDB either finds the existing user or creates a new one
   - Attaches the user's role to req.role
   - Calls next()

4. samplesRouter handles GET / (Mongoose):
   - Reads req.query → { sex: 'M', page: '2' }
   - Builds a MongoDB filter: { sex: 'M' }
   - Calls Sample.find(filter).sort(...).skip(50).limit(50).lean()
   - If req.role === 'researcher', strips PHI fields from each record
   - res.json({ records, total, page, totalPages })

5. Express sends the JSON response back to the frontend.
```

---

## Why Each Technology Is Needed

| Need | Technology |
|---|---|
| HTTP routing, middleware chain | Express |
| Verifying the user is logged in | Firebase Admin SDK |
| Looking up / storing user data (role, prefs) | Mongoose + MongoDB |
| Querying the sample dataset | Mongoose + MongoDB |
| Fetching a user's email for the admin panel | Firebase Admin SDK |

Firebase handles *identity* (who you are). MongoDB handles *data* (what you're allowed to see and what we store about you). Express wires everything together into a running HTTP server.
