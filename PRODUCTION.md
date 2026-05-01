# MCBB Query Tool — Production Architecture

## Overview

The application has three components running on the VM `rofgl1001a`:

```
Browser
  └─→ Apache (port 8080)
        ├─ serves frontend static files from /apps/html/dist-serve
        └─ proxies /api/* → Node.js on localhost:3000
                              └─ connects to MongoDB on 127.0.0.1:27017
```

---

## Frontend

- **Served by:** Apache on port 8080
- **Directory:** `/apps/html/dist-serve`
- **URL:** `http://rofgl1001a:8080/dist-serve/`
- **Build:** run `npm run build` in `ahnaf-dev-mcbb-qtp/`, then copy the contents of `dist/` into `/apps/html/dist-serve`

The frontend communicates with the backend exclusively through the `/api` path on the same origin — it never contacts port 3000 directly.

---

## Backend (Node.js / Express)

- **Location:** `/apps/s-account-home/s018392/backend` *(subject to change once final shared directory is confirmed)*
- **Internal port:** 3000 (not exposed externally)
- **Start:**
  ```bash
  cd /apps/s-account-home/s018392/backend
  npm install
  node server.js
  # or with pm2 to keep it alive across crashes:
  pm2 start server.js --name mcbb-api
  ```

### Environment variables (`.env` in the backend directory)

```
DATABASE_URL=mongodb://<user>:<password>@127.0.0.1:27017/brainbank
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service_account.json
```

`<user>` and `<password>` are the credentials provided by IT for the MongoDB user account.

---

## MongoDB

- **Set up by:** IT
- **Bound to:** `127.0.0.1` (localhost only — not reachable from outside the VM)
- **Port:** 27017 (default)
- **Accounts:** IT will provide admin and application-user credentials
- **Database name:** `brainbank`
- **Collection:** `samples`

---

## Apache Proxy (`.htaccess`)

Place this in `/apps/html/dist-serve/.htaccess` to forward API requests from Apache to Node:

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

Requires `mod_proxy`, `mod_proxy_http`, and `mod_rewrite` to be enabled on the Apache instance. Verify with:

```bash
apache2ctl -M 2>/dev/null | grep -E "proxy|rewrite"
```

---

## Authentication

- **Current:** Firebase Auth (temporary)
  - The Firebase service account JSON file must be present on the VM and its path set in `FIREBASE_SERVICE_ACCOUNT_PATH`
- **Planned:** Mayo Clinic SSO / internal auth (to replace Firebase at a later date)

---

## Roles

Roles are stored in MongoDB and managed via the `/admin` page (admin users only).

| Role         | Access |
|--------------|--------|
| `admin`      | Full record data including all PHI fields |
| `researcher` | PHI fields stripped from all responses (NPID, DOB, DOD, MayoClinicID, etc.) |

New users are automatically assigned `researcher` role on first login.

---

## Deployment Checklist

1. Build frontend: `npm run build` in `ahnaf-dev-mcbb-qtp/`
2. Copy `dist/` contents to `/apps/html/dist-serve`
3. Place `.htaccess` proxy config in `/apps/html/dist-serve`
4. Copy `backend/` to its directory on the VM
5. Create `backend/.env` with MongoDB credentials and Firebase path
6. `npm install` in the backend directory
7. Start Node: `node server.js` or `pm2 start server.js --name mcbb-api`
8. Verify: `http://rofgl1001a:8080/dist-serve/`
