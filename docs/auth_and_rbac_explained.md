# Authentication & Role-Based Access Control
### A complete guide — written for someone who just found out what a computer is

---

## Table of Contents

1. [The Big Picture — What Problem Are We Solving?](#1-the-big-picture)
2. [Two Halves of the App — Frontend vs Backend](#2-frontend-vs-backend)
3. [What is Authentication?](#3-what-is-authentication)
4. [What is Firebase?](#4-what-is-firebase)
5. [The Login Flow — Step by Step](#5-the-login-flow-step-by-step)
6. [What is a Token?](#6-what-is-a-token)
7. [How the Frontend Stores the Logged-In User](#7-how-the-frontend-stores-the-logged-in-user)
8. [How the Frontend Talks to the Backend](#8-how-the-frontend-talks-to-the-backend)
9. [What is a Backend Server?](#9-what-is-a-backend-server)
10. [What is Middleware?](#10-what-is-middleware)
11. [How the Backend Verifies the Token](#11-how-the-backend-verifies-the-token)
12. [What is Role-Based Access Control?](#12-what-is-role-based-access-control)
13. [How Roles Are Stored](#13-how-roles-are-stored)
14. [How the Role Gets Loaded on Every Request](#14-how-the-role-gets-loaded-on-every-request)
15. [How the Frontend Learns the Role](#15-how-the-frontend-learns-the-role)
16. [How the Role Changes What You See](#16-how-the-role-changes-what-you-see)
17. [How the Role Changes What Data You Get](#17-how-the-role-changes-what-data-you-get)
18. [The Admin Panel](#18-the-admin-panel)
19. [Complete File Map — Every File and What It Does](#19-complete-file-map)
20. [The Full Journey — Login to Seeing Data](#20-the-full-journey)

---

## 1. The Big Picture

Imagine a hospital filing room.

- There is a **receptionist** at the front desk. You cannot walk straight into the filing room. You must first tell the receptionist who you are. This is **authentication** — proving your identity.
- Once the receptionist confirms you are who you say you are, they give you a **badge**. This badge says your name and your job title.
- When you try to open a filing cabinet, the badge reader checks your title. A **researcher** can open some cabinets. An **admin** can open all of them. This is **role-based access control** — what you are allowed to do depends on your role.

This app works exactly the same way. The receptionist is Firebase. The badge is a token. The filing room is the backend server. The filing cabinets are the API routes that return data.

---

## 2. Frontend vs Backend

Before anything else, you need to understand that this app is actually **two separate programs** that talk to each other.

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────────┐
│           FRONTEND                  │      │           BACKEND                   │
│                                     │      │                                     │
│  The part you see in your browser.  │ ───▶ │  A program running on a server.     │
│  Built with React + TypeScript.     │      │  Built with Node.js + Express.      │
│  Lives in:  redcap-vis/src/         │      │  Lives in:  backend/                │
│                                     │ ◀─── │                                     │
└─────────────────────────────────────┘      └─────────────────────────────────────┘
             Your browser                              Your computer (port 3000)
```

**The frontend** is everything the user sees — buttons, tables, forms, the login page. It runs entirely inside the user's browser. It cannot safely store secrets or directly access a database, because anyone could open the browser's developer tools and read everything.

**The backend** is a hidden program. Users never see it directly. It runs on a server (or your laptop during development on port 3000). It is the only part that connects to MongoDB (the database) and the only part that should enforce rules. Whatever the backend says is the truth — the frontend can only display what the backend gives it.

> **Why does this matter for auth?** Because if you checked "is this user an admin?" only in the frontend, any user could open the browser console and change that value. The backend must be the final authority on what data to return and what operations to allow.

---

## 3. What is Authentication?

**Authentication** answers one question: **Who are you?**

It is the process of a user proving their identity. The most common way is a username (email) and password. The system checks if those match what it has on record. If they do, the user is considered "authenticated" — their identity is confirmed.

Authentication is **not** the same as deciding what you are allowed to do. That is called **authorization**. These two words are often confused:

| Word | Question it answers | Example |
|------|---------------------|---------|
| **Authentication** | Who are you? | Logging in with email + password |
| **Authorization** | What are you allowed to do? | Only admins can see PHI columns |

In this app, Firebase handles authentication. MongoDB + our backend handles authorization (roles).

---

## 4. What is Firebase?

Firebase is a service made by Google. Instead of building a login system from scratch (storing passwords, sending reset emails, handling security), we use Firebase to do all of that for us.

Think of Firebase as a **specialist receptionist company** that we hired. They are experts at identity verification. We tell them "here are our users and their passwords." When a user tries to log in, we hand them off to Firebase. Firebase checks the credentials and, if correct, hands back a **token** (explained in section 6).

Firebase has two parts relevant to us:

1. **Firebase Auth (client SDK)** — the code that runs in the browser. It provides functions like `signInWithEmailAndPassword`. This lives in the frontend.

2. **Firebase Admin SDK** — the code that runs on the backend server. It can verify tokens and look up user information. This lives in the backend.

The separation is deliberate. The client SDK is for users interacting with the browser. The admin SDK is for your server to independently verify and trust what the client says.

---

## 5. The Login Flow — Step by Step

Here is exactly what happens when a user types their email and password and clicks "Sign In":

```
User types email + password
         │
         ▼
┌─────────────────────┐
│    LoginPage.tsx    │  calls  signInWithEmailAndPassword(auth, email, password)
│  (React component)  │  ────────────────────────────────────────────────────────▶
└─────────────────────┘
         │
         │  This function is provided by Firebase's client library.
         │  It sends the email + password to Firebase's servers over HTTPS.
         ▼
┌─────────────────────────────────┐
│      Firebase Servers           │
│  (Google's infrastructure)      │  Checks if the email + password match
│                                 │  what is stored in the Firebase project.
└─────────────────────────────────┘
         │
         │  If correct, Firebase sends back a TOKEN (a long string of letters/numbers).
         │  If wrong, Firebase sends back an error (wrong password, user not found, etc.)
         ▼
┌─────────────────────────────────┐
│       Firebase client SDK       │
│  (running in the browser)       │  Stores the token automatically in memory.
│                                 │  Fires the onAuthStateChanged event.
└─────────────────────────────────┘
         │
         │  onAuthStateChanged is like a doorbell — it rings whenever
         │  the login state changes (logged in or logged out).
         ▼
┌─────────────────────────────────┐
│       AuthContext.tsx           │  Is listening for that doorbell.
│  (React Context provider)       │  When it rings, it saves the user object
│                                 │  and fetches the role from MongoDB.
└─────────────────────────────────┘
         │
         ▼
  App now knows the user is logged in. ProtectedRoutes allow access.
```

### The code in LoginPage.tsx

```tsx
// src/pages/LoginPage.tsx  (simplified)

import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'   // our Firebase connection

const handleSubmit = async (e) => {
  e.preventDefault()  // stops the page from refreshing (default form behavior)

  try {
    // This is the one function call that does everything:
    // sends email+password to Firebase, gets a token back
    await signInWithEmailAndPassword(auth, email, password)

    // If we reach here, login worked. Firebase automatically
    // stores the token and fires onAuthStateChanged.
    navigate('/query-tool')  // send user to the main page

  } catch (error) {
    // Firebase sends back specific error codes we can translate
    if (error.code === 'auth/wrong-password') setError('Incorrect password.')
    if (error.code === 'auth/user-not-found') setError('No account with that email.')
  }
}
```

### The firebase.ts file — connecting to our Firebase project

```ts
// src/firebase.ts

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// These values identify WHICH Firebase project to connect to.
// They are not secret — they are safe to include in frontend code.
const firebaseConfig = {
  apiKey: "...",        // a public identifier for API calls
  authDomain: "...",    // the domain Firebase uses for auth
  projectId: "...",     // which Firebase project
  // ... etc
}

// initializeApp sets up the Firebase connection using our config
const app = initializeApp(firebaseConfig)

// getAuth gives us the authentication service for this app
export const auth = getAuth(app)
```

> `auth` is an object that represents our Firebase Auth connection. We import it anywhere we need to do something auth-related (get the current user, get a token, sign out).

---

## 6. What is a Token?

A **token** (specifically a JWT — JSON Web Token) is a long string that Firebase generates after a successful login. It looks like this:

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL...
```

It is not random gibberish. It is a **cryptographically signed package of information**. Inside it (in an encoded form) is data like:

```json
{
  "uid": "D4jVgPoSdide6rn9LtMIgK9nxK13",
  "email": "researcher@mayo.edu",
  "iss": "https://securetoken.google.com/bbmipoc",
  "exp": 1714123456
}
```

The important properties:
- `uid` — a unique ID Firebase assigns to every user (never changes, even if they change their email)
- `exp` — expiry time (tokens expire after 1 hour, for security)

**The key insight about tokens:** Firebase signs the token with a **private key** that only Google has. This means:

- Anyone can **read** the contents of a token (it is just encoded, not encrypted)
- But **no one can fake** a valid token without Google's private key
- Our backend can **verify** a token using Firebase's corresponding public key

This is the mechanism that makes the whole system secure. The user presents their token to the backend. The backend asks Firebase Admin: "is this token genuinely issued by you and not expired?" Firebase Admin checks the cryptographic signature and says yes or no.

**Analogy:** A token is like a government-issued ID. Anyone can look at it. But only the government can produce a real one. When a business checks your ID, they're not calling the government — they're just verifying the physical security features (holograms, etc.) to confirm it's genuine.

---

## 7. How the Frontend Stores the Logged-In User

Firebase's client SDK automatically keeps track of the current logged-in user. It stores the token in memory and refreshes it automatically before it expires. We never have to manage the token's lifetime manually.

We built a **React Context** to make the current user and their role available to every component in the app without passing them as props through every layer.

### What is React Context?

React Context is a way to share data across the entire app without having to pass it down manually through props at every level. Think of it as a global bulletin board that any component can read from.

```
                    AuthContext (the bulletin board)
                    ┌─────────────────────────────────┐
                    │  currentUser: { uid, email }    │
                    │  role: 'admin' | 'researcher'   │
                    │  loading: true | false          │
                    └─────────────────────────────────┘
                              │    │    │
              ┌───────────────┘    │    └────────────────┐
              ▼                    ▼                     ▼
         NavBar.tsx         QueryToolPageB.tsx    PreferencesPanel.tsx
   (reads role to decide    (reads loading to     (reads role to decide
    which nav links show)    show spinner)         which columns to lock)
```

### The AuthContext.tsx file

```tsx
// src/context/AuthContext.tsx  (simplified with annotations)

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { fetchUserProfile } from '../api/preferences'

// Step 1: Define what information the context will hold
interface AuthContextType {
  currentUser: User | null        // the Firebase user object, or null if not logged in
  loading: boolean                // true while we're still figuring out if user is logged in
  role: 'admin' | 'researcher'   // the user's role from MongoDB
}

// Step 2: Create the context with default values
// These defaults are only used before AuthProvider finishes loading
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  role: 'researcher'
})

// Step 3: The Provider — this component wraps the entire app
// and makes the context values available to all children
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [role, setRole]               = useState('researcher')

  useEffect(() => {
    // onAuthStateChanged is Firebase's "doorbell"
    // It calls our function whenever login state changes
    // user = the Firebase user object if logged in, null if logged out
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // User just logged in — fetch their role from our MongoDB
        const profile = await fetchUserProfile()
        setRole(profile?.role ?? 'researcher')  // default to researcher if not found
      } else {
        // User logged out — reset role
        setRole('researcher')
      }

      setLoading(false)  // we now know the login state, stop showing spinner
    })

    return unsubscribe  // cleanup: stop listening when component unmounts
  }, [])

  return (
    // Provide the values to all children
    // {!loading && children} means: don't render the app until we know if user is logged in
    // (prevents a flash where the login page shows briefly before redirect)
    <AuthContext.Provider value={{ currentUser, loading, role }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Step 4: A hook so components can easily read the context
// Instead of: const ctx = useContext(AuthContext)
// Components do: const { currentUser, role } = useAuth()
export const useAuth = () => useContext(AuthContext)
```

### How AuthProvider wraps the app (App.tsx)

```tsx
// src/App.tsx

const App = () => {
  return (
    <AuthProvider>          {/* ← wraps everything, makes auth available everywhere */}
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/query-tool' element={
          <ProtectedRoute>
            <QueryToolPageB />
          </ProtectedRoute>
        } />
        {/* ... more routes */}
      </Routes>
    </AuthProvider>
  )
}
```

---

## 8. How the Frontend Talks to the Backend

Every time the React app needs data (sample records, user preferences), it makes an **HTTP request** to the backend. An HTTP request is like sending a letter to the backend and waiting for a reply.

But there is a problem: the backend needs to know **who** is asking. Otherwise anyone — even someone not logged in — could send requests and get data.

The solution: **attach the token to every request.** The backend reads the token, verifies it with Firebase Admin, and knows exactly who is asking.

### The getAuthHeaders function

```ts
// src/api/auth.ts

import { auth } from '../firebase'

// This function creates an "Authorization header" containing the token.
// A header is metadata attached to an HTTP request — like writing your name
// on the outside of an envelope before sending it.
export async function getAuthHeaders(): Promise<HeadersInit> {
  // auth.currentUser is the currently logged-in Firebase user (or null)
  // getIdToken() retrieves the current token, refreshing it if it's about to expire
  const token = await auth.currentUser?.getIdToken()

  // If we have a token, return it in the standard "Bearer" format
  // Bearer means "the person bearing (carrying) this token should be trusted"
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

### How every API call uses it

```ts
// src/api/samples.ts  (example fetch call)

export async function fetchSamples(filters, page, limit) {
  const res = await fetch(
    `http://localhost:3000/api/samples?page=${page}`,
    {
      headers: await getAuthHeaders()
      //        ^^^ this attaches the token to the request
      //        The backend will read this header to verify identity
    }
  )
  return res.json()
}
```

When the backend receives this request, it sees a header that looks like:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQ...
```

---

## 9. What is a Backend Server?

The backend is a Node.js program running Express. 

**Node.js** is a way to run JavaScript outside the browser — on a server.

**Express** is a library that makes it easy to receive HTTP requests and send responses. You define **routes** — combinations of a URL path and an HTTP method that trigger specific code.

```
                    Backend server (Express)
                    running on localhost:3000

HTTP Request ──▶   app.get('/api/samples', ...)      ──▶ queries MongoDB, returns JSON
HTTP Request ──▶   app.get('/api/users/:uid/prefs',...)──▶ returns user preferences
HTTP Request ──▶   app.put('/api/admin/users/:uid',...)──▶ updates a user's role
```

The backend is organized into files:

```
backend/
├── server.js              ← Entry point. Starts the server. Connects to MongoDB.
│                            Registers all middleware and routes.
├── middleware/
│   ├── auth.js            ← Verifies the Firebase token on every request
│   └── loadRole.js        ← Looks up the user's role in MongoDB
├── routes/
│   ├── samples.js         ← Handles /api/samples — returns donor records
│   ├── users.js           ← Handles /api/users — handles preferences
│   └── admin.js           ← Handles /api/admin — admin-only operations
└── models/
    ├── Sample.js          ← Defines what a Sample document looks like in MongoDB
    └── User.js            ← Defines what a User document looks like in MongoDB
```

---

## 10. What is Middleware?

**Middleware** is one of the most important concepts in Express. It is a function that runs **between** receiving a request and sending a response — in the middle.

Think of it as a security checkpoint or inspection station on a highway. Every car (request) must pass through the checkpoint before it can reach its destination (the route handler).

```
Incoming HTTP Request
        │
        ▼
┌───────────────────┐
│   cors()          │  Middleware 1: Allows requests from different origins
│   (built-in)      │  (lets the browser on port 5173 talk to server on port 3000)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   express.json()  │  Middleware 2: Reads JSON body from POST/PUT requests
│   (built-in)      │  (so req.body contains the parsed data)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   verifyToken()   │  Middleware 3 (OUR CODE): Checks Firebase token
│   auth.js         │  Sets req.uid if valid. Blocks with 401 if invalid.
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   loadRole()      │  Middleware 4 (OUR CODE): Looks up role in MongoDB
│   loadRole.js     │  Sets req.role = 'admin' or 'researcher'
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Route Handler   │  The actual code for this specific endpoint.
│   (e.g. samples)  │  By the time it runs, req.uid and req.role are already set.
└───────────────────┘
        │
        ▼
HTTP Response sent back to browser
```

Each middleware function receives three arguments: `req` (the request), `res` (the response), and `next` (a function to call to pass to the next middleware).

```js
// The signature of every middleware function:
const someMiddleware = (req, res, next) => {
  // req  = the incoming request object (headers, body, params, etc.)
  // res  = the response object (use to send data back, e.g. res.json(), res.status())
  // next = call this to hand off to the next middleware or route handler

  // If something is wrong, send an error response and DON'T call next():
  if (somethingWrong) {
    return res.status(401).json({ error: 'Unauthorized' })
    // The request stops here. The route handler never runs.
  }

  // If everything is fine, attach data to req and call next():
  req.someValue = computedValue
  next()  // proceed to the next middleware or the route handler
}
```

---

## 11. How the Backend Verifies the Token

The `verifyToken` middleware in `backend/middleware/auth.js` is the security gate. Every single `/api` request must pass through it.

```js
// backend/middleware/auth.js  (annotated)

const admin = require('firebase-admin')

// Initialize Firebase Admin SDK using our service account credentials.
// The service account JSON file contains a private key that proves to Firebase
// that this server is authorized to verify tokens for our project.
// This initialization only runs once when the server starts.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../service_account.json'))
    //                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //  This file was downloaded from Firebase Console → Project Settings → Service Accounts
    //  It contains a private key — keep it secret, never commit to git
  })
}

const verifyToken = async (req, res, next) => {

  // Every authenticated request includes a header like:
  // Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
  const header = req.headers.authorization

  // If no Authorization header exists, reject immediately
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
    //         ^^^
    //  HTTP status 401 = "you need to log in"
  }

  try {
    // Extract just the token part (remove "Bearer " prefix)
    const token = header.slice(7)  // removes the first 7 characters ("Bearer ")

    // The most important line: ask Firebase Admin to verify the token
    // Firebase Admin contacts Firebase's servers, checks the cryptographic signature,
    // checks that the token hasn't expired, and returns the decoded contents
    const decoded = await admin.auth().verifyIdToken(token)

    // decoded looks like: { uid: 'D4jVgPoSdide6rn9LtMIgK9nxK13', email: '...', exp: ... }
    // Attach the uid to req so all subsequent middleware and route handlers can use it
    req.uid = decoded.uid

    next()  // token is valid, continue to the next middleware

  } catch (error) {
    // verifyIdToken throws if the token is invalid or expired
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = verifyToken
```

### How it is registered in server.js

```js
// backend/server.js

// Apply verifyToken to ALL routes that start with /api
// This one line protects every single API endpoint
app.use('/api', verifyToken)

// Apply loadRole to ALL /api routes too (after verifyToken)
app.use('/api', loadRole)
```

The order here matters. `verifyToken` must come before `loadRole` because `loadRole` uses `req.uid`, which is set by `verifyToken`. If `verifyToken` fails and rejects the request, `loadRole` never runs.

---

## 12. What is Role-Based Access Control?

**Role-Based Access Control (RBAC)** is a system where what you are allowed to do depends on the **role** assigned to your account, not who you are specifically.

Instead of writing rules like:
- ❌ "afroza@mayo.edu can see PHI data, joe@mayo.edu cannot"

You write rules like:
- ✅ "Users with role `admin` can see PHI data, users with role `researcher` cannot"

Then you assign roles to users. This is much easier to manage — to give someone new access, you just change their role. You never have to touch the rule itself.

In this app there are two roles:

| Role | What they can do |
|------|-----------------|
| `admin` | See all columns including PHI (patient identifiers). Manage user roles via Admin Panel. Full access to all data. |
| `researcher` | See all non-PHI data. Cannot see: NPID, Autopsy ID, Mayo Clinic ID, NACC PTID, PTNUM, DOB, DOD, IRB Number. Cannot access Admin Panel. |

**PHI** stands for Protected Health Information — data that could identify a specific patient.

---

## 13. How Roles Are Stored

Roles are stored in MongoDB in a `users` collection. Each document in this collection represents one user:

```json
// A document in the MongoDB "users" collection
{
  "_id": "648c3f2a1e4b3d001e8a7c12",  // MongoDB's automatic unique ID
  "uid": "D4jVgPoSdide6rn9LtMIgK9nxK13",  // The Firebase UID — links this to a Firebase account
  "role": "researcher",                    // 'admin' or 'researcher'
  "columnPrefs": {                         // their saved column visibility preferences
    "npid": true,
    "age_at_death": true,
    // ...
  }
}
```

The `uid` field is the bridge between Firebase and MongoDB:
- Firebase knows the user's **email and password** and manages login
- MongoDB knows the user's **role and preferences**
- The `uid` (assigned by Firebase, never changes) links them together

### The User model (backend/models/User.js)

```js
// backend/models/User.js

const mongoose = require('mongoose')

// A "schema" is a blueprint that defines the shape and rules for documents
// in a MongoDB collection — like defining columns in a spreadsheet
const userSchema = new mongoose.Schema({

  uid: {
    type: String,       // must be a string
    required: true,     // must be present — cannot save a user without it
    unique: true        // no two users can have the same uid
  },

  role: {
    type: String,
    enum: ['admin', 'researcher'],   // only these two values are allowed
    default: 'researcher'            // if not specified, default to researcher
  },

  columnPrefs: {
    type: mongoose.Schema.Types.Mixed   // can hold any shape of object
  }

}, { collection: 'users' })  // specifies the MongoDB collection name

// mongoose.model creates a class we can use to query/create/update documents
module.exports = mongoose.model('User', userSchema)
```

---

## 14. How the Role Gets Loaded on Every Request

After `verifyToken` confirms who the user is (setting `req.uid`), the `loadRole` middleware looks up that user in MongoDB to find their role:

```js
// backend/middleware/loadRole.js  (annotated)

const User = require('../models/User')

const loadRole = async (req, res, next) => {
  try {
    // findOneAndUpdate does three things in one database operation:
    //   1. Looks for a document where uid matches req.uid
    //   2. If NOT FOUND: creates a new document with role 'researcher' ($setOnInsert)
    //      ($setOnInsert means "only apply these fields when inserting, not when updating")
    //   3. Returns the found or newly created document
    const user = await User.findOneAndUpdate(
      { uid: req.uid },                            // find by this uid
      { $setOnInsert: {                            // if inserting (new user):
          uid: req.uid,
          role: 'researcher',                      //   default role
          columnPrefs: null                        //   no prefs yet
        }
      },
      { upsert: true, new: true }
      //  upsert: true = create if not found (upsert = update + insert)
      //  new: true    = return the new/updated document, not the old one
    )

    // Attach the role to the request object
    // All route handlers that run after this can access req.role
    req.role = user?.role ?? 'researcher'
    //                     ^^
    //  ?? means "if the left side is null/undefined, use the right side"
    //  (fallback to researcher if something unexpected happens)

  } catch (err) {
    console.error('loadRole error:', err)
    req.role = 'researcher'   // fail safe — if DB is down, default to most restricted role
  }

  next()   // always call next() — we never block a request here, we just set the role
}

module.exports = loadRole
```

> **Why auto-create the user document?** When a new user is added to Firebase and logs in for the first time, they have no MongoDB document. Rather than requiring a manual setup step, `loadRole` automatically creates their document with the default `researcher` role on their very first API request. An admin can then change their role via the Admin Panel.

---

## 15. How the Frontend Learns the Role

The frontend needs to know the role in order to:
- Show/hide the Admin link in the navigation
- Lock PHI columns in the Preferences Panel
- Enforce restrictions in the column preferences hook

This happens inside `AuthContext.tsx`, right after login is detected:

```tsx
// Inside AuthContext.tsx — the part that fetches the role

onAuthStateChanged(auth, async (user) => {
  setCurrentUser(user)

  if (user) {
    // User logged in — we need to know their role
    // fetchUserProfile() calls GET /api/users/:uid/preferences
    // The backend returns { columnPrefs: {...}, role: 'researcher' }
    const profile = await fetchUserProfile()
    setRole(profile?.role ?? 'researcher')
  }

  setLoading(false)
})
```

```ts
// src/api/preferences.ts — the fetchUserProfile function

export async function fetchUserProfile(): Promise<UserProfile | null> {
  const uid = auth.currentUser?.uid
  if (!uid) return null

  const res = await fetch(
    `http://localhost:3000/api/users/${uid}/preferences`,
    { headers: await getAuthHeaders() }   // attach the token
  )

  const data = await res.json()
  // data = { columnPrefs: {...}, role: 'researcher' }

  return {
    columnPrefs: data.columnPrefs ?? null,
    role: data.role ?? 'researcher'
  }
}
```

```js
// backend/routes/users.js — the route that responds to this request

router.get('/:uid/preferences', async (req, res) => {
  // Security check: you can only get YOUR OWN preferences
  // req.uid was set by verifyToken (from the Firebase token)
  // req.params.uid is the uid in the URL path
  if (req.uid !== req.params.uid)
    return res.status(403).json({ error: 'Forbidden' })
    //         ^^^
    //  HTTP 403 = "you are identified but not allowed to do this"

  const user = await User.findOne({ uid: req.params.uid }).lean()

  // Return both columnPrefs AND role — frontend needs both
  res.json({
    columnPrefs: user?.columnPrefs ?? null,
    role: user?.role ?? 'researcher'
  })
})
```

---

## 16. How the Role Changes What You See

Once the role is in `AuthContext`, every component in the app can read it with `useAuth()`.

### Navigation — hiding the Admin link

```tsx
// src/components/NavBar.tsx

const NavBar = () => {
  const { role } = useAuth()   // read the role from context

  // Admin nav item only added to the list if role is 'admin'
  const navItems = role === 'admin'
    ? [...BASE_NAV_ITEMS, { to: '/admin', label: 'Admin', icon: '⚙' }]
    : BASE_NAV_ITEMS

  // render navItems...
}
```

### Preferences Panel — locking PHI columns

```tsx
// src/components/PreferencesPanel.tsx

const PreferencesPanel = ({ visible, role, onToggle, ... }) => {

  // A column is "locked" if the user is a researcher AND it is a PHI column
  const locked = (key) => role === 'researcher' && PHI_COLUMNS.includes(key)

  return (
    // For each column, render a toggle switch
    // If locked: checkbox is disabled, label is greyed, shows "PHI" badge
    <label className={locked(col.key) ? 'pref-col-locked' : ''}>
      <input
        type='checkbox'
        checked={visible[col.key]}
        onChange={() => onToggle(col.key)}
        disabled={locked(col.key)}   // ← cannot toggle if locked
      />
      {col.label}
      {locked(col.key) && <span className='pref-phi-badge'>PHI</span>}
    </label>
  )
}
```

### Column preferences hook — enforcing restrictions in state

```ts
// src/hooks/useColumnPreferences.ts

// PHI_COLUMNS = ['npid', 'autopsy_id', 'mayo_clinic_id', 'nacc_ptid',
//                'ptnum', 'dob', 'dod', 'irb_number', ...]

function enforcePHI(prefs) {
  const next = { ...prefs }
  PHI_COLUMNS.forEach(key => { next[key] = false })  // force all PHI columns to hidden
  return next
}

export function useColumnPreferences() {
  const { role } = useAuth()

  // Toggle function — silently ignores attempts to toggle PHI columns for researchers
  const toggle = (key) => {
    if (role === 'researcher' && PHI_COLUMNS.includes(key)) return  // blocked
    // ... otherwise toggle normally
  }
}
```

---

## 17. How the Role Changes What Data You Get

The frontend restrictions above are helpful, but they are not sufficient alone. A determined user could modify the JavaScript in their browser to bypass them. The backend is the true enforcer.

When the backend fetches sample records, it checks `req.role` (set by `loadRole`) and strips PHI fields before sending the response:

```js
// backend/routes/samples.js

// The list of fields that identify a patient — must not go to researchers
const PHI_FIELDS = [
  'npid', 'autopsy_id', 'mayo_clinic_id',
  'truncated_mayo_clinic_id', 'nacc_ptid',
  'ptnum', 'dob', 'dod', 'irb_number'
]

// This function removes PHI fields from a record object
function stripPHI(record) {
  const r = { ...record }                     // copy the record (don't modify original)
  PHI_FIELDS.forEach(field => delete r[field])  // remove each PHI field
  return r
}

// GET /api/samples — paginated results
router.get('/', async (req, res) => {
  const rawRecords = await Sample.find(query).sort(sort).skip(skip).limit(limit).lean()

  // req.role was set by loadRole middleware
  // If researcher: strip PHI from every record before sending
  // If admin:      send the full records as-is
  const records = req.role === 'researcher'
    ? rawRecords.map(stripPHI)
    : rawRecords

  res.json({ records, total, page, totalPages })
})
```

**This is defense in depth** — the same restriction is enforced in two places:
1. **Frontend**: hides PHI columns from the UI, prevents toggling them on
2. **Backend**: strips PHI fields from the actual data being sent

Even if someone bypassed the frontend restrictions entirely, they would still receive records with PHI fields missing. The data simply isn't there.

---

## 18. The Admin Panel

The Admin Panel is a protected page at `/admin` that only admins can access. It lets admins see all users and change their roles.

### Route protection

```tsx
// src/App.tsx
<Route path='/admin' element={
  <ProtectedRoute>      {/* ← checks if logged in */}
    <AdminPage />
  </ProtectedRoute>
} />
```

`ProtectedRoute` only checks if the user is logged in. The admin-only enforcement is done inside `AdminPage` itself and on the backend.

### AdminPage redirects non-admins

```tsx
// src/pages/AdminPage.tsx

const AdminPage = () => {
  const { role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If a researcher navigates to /admin, redirect them away immediately
    if (role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [role])

  // ...
}
```

### Backend — admin route also enforces the role

```js
// backend/routes/admin.js

// This middleware runs before any admin route handler
const requireAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}

// Apply requireAdmin to all routes in this router
router.use(requireAdmin)

// GET /api/admin/users
router.get('/users', async (req, res) => {
  // Get all users from MongoDB
  const dbUsers = await User.find({}).lean()

  // Enrich with email from Firebase (MongoDB only stores uid, not email)
  const enriched = await Promise.all(
    dbUsers.map(async (u) => {
      const fbUser = await admin.auth().getUser(u.uid)
      return { uid: u.uid, email: fbUser.email, role: u.role }
    })
  )
  res.json(enriched)
})

// PUT /api/admin/users/:uid/role
router.put('/users/:uid/role', async (req, res) => {
  const { role } = req.body

  // Validate: only accept known role values
  if (!['admin', 'researcher'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  // Update the role in MongoDB
  await User.findOneAndUpdate(
    { uid: req.params.uid },
    { role },
    { upsert: true }   // create document if it doesn't exist yet
  )

  res.json({ ok: true })
})
```

---

## 19. Complete File Map

Every file involved in auth and RBAC, what it does, and how it connects to others:

```
FRONTEND  (redcap-vis/src/)
│
├── firebase.ts
│   PURPOSE: Initializes the Firebase connection using our project config.
│   EXPORTS: auth (the Firebase Auth object)
│   USED BY: api/auth.ts, api/preferences.ts, context/AuthContext.tsx,
│             pages/LoginPage.tsx, all query tool pages (for signOut)
│
├── context/AuthContext.tsx
│   PURPOSE: Makes currentUser and role available to all components.
│   READS FROM: firebase.ts (listens to auth state changes)
│   READS FROM: api/preferences.ts (fetches role after login)
│   EXPORTS: AuthProvider (wraps the app), useAuth (hook for components)
│   USED BY: App.tsx (AuthProvider), NavBar, PreferencesPanel,
│             QueryToolPages, AdminPage, useColumnPreferences
│
├── components/ProtectedRoute.tsx
│   PURPOSE: Redirects to /login if user is not logged in.
│   READS FROM: AuthContext (useAuth)
│   USED BY: App.tsx (wraps all non-login routes)
│
├── pages/LoginPage.tsx
│   PURPOSE: The login form. Calls Firebase signInWithEmailAndPassword.
│   READS FROM: firebase.ts (auth object, signIn function)
│
├── api/auth.ts
│   PURPOSE: Provides getAuthHeaders() — attaches the token to API calls.
│   READS FROM: firebase.ts (auth.currentUser.getIdToken())
│   USED BY: api/samples.ts, api/preferences.ts, api/admin.ts
│
├── api/preferences.ts
│   PURPOSE: Fetches and saves user column preferences and role.
│   READS FROM: api/auth.ts (getAuthHeaders)
│   CALLS: GET /api/users/:uid/preferences
│   CALLS: PUT /api/users/:uid/preferences
│   USED BY: context/AuthContext.tsx (fetchUserProfile),
│             hooks/useColumnPreferences.ts (fetchColumnPrefs, saveColumnPrefs)
│
├── api/admin.ts
│   PURPOSE: Fetches user list and updates roles (admin only).
│   READS FROM: api/auth.ts (getAuthHeaders)
│   CALLS: GET /api/admin/users
│   CALLS: PUT /api/admin/users/:uid/role
│   USED BY: pages/AdminPage.tsx
│
├── hooks/useColumnPreferences.ts
│   PURPOSE: Manages which columns are visible. Enforces PHI restrictions.
│   READS FROM: AuthContext (role)
│   READS FROM: api/preferences.ts (fetchColumnPrefs, saveColumnPrefs)
│   READS FROM: columns.ts (PHI_COLUMNS, DEFAULT_VISIBLE)
│   USED BY: all QueryToolPages
│
├── components/NavBar.tsx
│   PURPOSE: Shows nav links. Hides Admin link for researchers.
│   READS FROM: AuthContext (role)
│
├── components/PreferencesPanel.tsx
│   PURPOSE: Column toggle UI. Greys out / locks PHI columns for researchers.
│   RECEIVES: role (passed as prop from QueryToolPages)
│   READS FROM: columns.ts (PHI_COLUMNS)
│
└── pages/AdminPage.tsx
    PURPOSE: Admin UI for viewing users and changing roles.
    READS FROM: AuthContext (role — redirects non-admins)
    READS FROM: api/admin.ts


BACKEND  (backend/)
│
├── server.js
│   PURPOSE: Starts the server. Registers middleware. Registers routes.
│   CONNECTS TO: MongoDB via mongoose
│   USES MIDDLEWARE: verifyToken (from middleware/auth.js)
│                    loadRole (from middleware/loadRole.js)
│   REGISTERS ROUTES: /api/samples, /api/users, /api/admin
│
├── middleware/auth.js
│   PURPOSE: Verifies the Firebase token on EVERY /api request.
│   READS: Authorization header from req.headers
│   SETS: req.uid (the Firebase user ID)
│   USES: Firebase Admin SDK + service_account.json
│
├── middleware/loadRole.js
│   PURPOSE: Looks up the user's role in MongoDB. Auto-creates new users.
│   READS: req.uid (set by auth.js)
│   SETS: req.role ('admin' or 'researcher')
│   USES: models/User.js
│
├── models/User.js
│   PURPOSE: Mongoose schema/model for the users collection.
│   FIELDS: uid, role, columnPrefs
│   USED BY: middleware/loadRole.js, routes/users.js, routes/admin.js
│
├── models/Sample.js
│   PURPOSE: Mongoose schema/model for the samples collection.
│   USED BY: routes/samples.js
│
├── routes/samples.js
│   PURPOSE: Returns donor records. Strips PHI for researchers.
│   READS: req.role (set by loadRole)
│   ENFORCES: PHI stripping when req.role === 'researcher'
│
├── routes/users.js
│   PURPOSE: Get/set column preferences. Returns role alongside prefs.
│   ENFORCES: users can only access their own data (req.uid === req.params.uid)
│
└── routes/admin.js
    PURPOSE: Admin-only user management.
    ENFORCES: req.role must be 'admin' (via requireAdmin middleware)
    USES: Firebase Admin SDK (to get emails), models/User.js (to update roles)
```

---

## 20. The Full Journey — Login to Seeing Data

Here is the complete story of what happens from the moment a user opens the app to the moment they see data on the screen:

```
1. Browser opens the app
   └─ App.tsx renders, AuthProvider mounts
   └─ onAuthStateChanged starts listening for login state
   └─ loading = true, nothing rendered yet

2. Firebase client checks if there is a stored session
   └─ If returning user: fires onAuthStateChanged with their User object
   └─ If not logged in: fires onAuthStateChanged with null → redirect to /login

3. User enters email + password on LoginPage, clicks Sign In
   └─ signInWithEmailAndPassword(auth, email, password) called
   └─ Firebase verifies credentials on their servers
   └─ Firebase returns a token (JWT) stored in memory by the SDK
   └─ onAuthStateChanged fires with the User object

4. AuthContext receives the User object
   └─ setCurrentUser(user) — stores the user
   └─ fetchUserProfile() called — GET /api/users/:uid/preferences
      └─ getAuthHeaders() gets the current token from Firebase
      └─ Request sent to backend with Authorization: Bearer <token>
      └─ verifyToken middleware checks the token with Firebase Admin
      └─ loadRole middleware looks up uid in MongoDB
         └─ If user not found: creates document with role 'researcher'
         └─ req.role = user.role
      └─ Route handler returns { columnPrefs: {...}, role: 'researcher' }
   └─ setRole('researcher') — stores the role
   └─ setLoading(false) — app renders

5. User is now on /query-tool (QueryToolPageB)
   └─ ProtectedRoute checks currentUser ≠ null — passes
   └─ NavBar renders — role is 'researcher', no Admin link shown
   └─ useColumnPreferences loads saved prefs from localStorage
      └─ enforcePHI() forces all PHI column prefs to false

6. User sets filters and clicks Search
   └─ search() called — copies pendingFilters to committedFilters
   └─ useEffect in useSamplesQuery fires
   └─ fetchSamples(committedFilters, page, perPage) called
      └─ getAuthHeaders() gets the token
      └─ GET /api/samples?page=1&... sent to backend
      └─ verifyToken: token verified, req.uid set
      └─ loadRole: role looked up, req.role = 'researcher'
      └─ Route handler queries MongoDB
      └─ stripPHI() called on every record (because req.role === 'researcher')
         └─ npid, autopsy_id, mayo_clinic_id, dob, dod, etc. deleted from each record
      └─ Stripped records returned as JSON

7. Records arrive in the browser
   └─ DataTable renders with visible columns
   └─ PHI columns (npid, autopsy_id, etc.) are set to false — not rendered
   └─ If user opens Preferences Panel:
      └─ PHI columns show greyed out with a "PHI" badge
      └─ Toggle inputs are disabled (cannot turn them on)
      └─ Even if they somehow tried, the column would be empty (data was never sent)
```

---

*This document covers the complete authentication and RBAC implementation as of April 2026. Key technologies: Firebase Auth (client + admin SDK), Express middleware, Mongoose/MongoDB, React Context.*
