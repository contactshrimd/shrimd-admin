# ShriMD Admin

React + Vite admin portal for ShriMD operations. Web-only — no mobile build.

## Prerequisites

- Node.js 20
- npm

Install dependencies:

```bash
npm install
```

## Run Modes

### Mode 1 — Firebase emulators (local, no GCP project required)

**Terminal 1 — start emulators:**
```bash
cd ../shrimd-backend
npm install
npm run emulators
# Functions: http://127.0.0.1:5001/demo-shrimd/us-central1/api
# Auth:      http://127.0.0.1:9099
```

**Terminal 2 — seed demo data:**
```bash
cd ../shrimd-backend
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed:emulator
```

**`.env.local` — create from `.env.example` and set:**
```
VITE_API_BASE_URL=http://127.0.0.1:5001/demo-shrimd/us-central1/api
VITE_FIREBASE_API_KEY=fake-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-shrimd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-shrimd
VITE_FIREBASE_APP_ID=1:000000000000:web:demo00000000000
VITE_FIREBASE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

```bash
npm run dev
# http://localhost:5173
```

Login with `super@shrimd.com` / `admin123` (seeded by `seed:emulator`).

---

### Mode 2 — Real Firebase project

Fill in real values from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps:

```
VITE_API_BASE_URL=https://us-central1-shrimd-dev.cloudfunctions.net/api
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=shrimd-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shrimd-dev
VITE_FIREBASE_APP_ID=1:123...:web:abc...
```

```bash
npm run dev
```

---

## Useful Scripts

```bash
npm run dev          # start dev server (http://localhost:5173)
npm run build        # type-check + production build → dist/
npm run type-check   # TypeScript check only (no emit)
npm run preview      # serve the dist/ build locally
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. `.env.local` is gitignored and loaded automatically by Vite.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | `shrimd-backend` base URL. Emulator: `http://127.0.0.1:5001/demo-shrimd/us-central1/api`. Production: `https://us-central1-<project>.cloudfunctions.net/api`. |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase project API key. Any string works with emulator (e.g. `fake-api-key`). |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain e.g. `shrimd-dev.firebaseapp.com`. Use `demo-shrimd.firebaseapp.com` for emulator. |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID e.g. `shrimd-dev`. Use `demo-shrimd` for emulator. |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID from Firebase Console. Any string works with emulator. |
| `VITE_FIREBASE_EMULATOR` | No | `true` = redirect Auth SDK to local emulator on port 9099. Default: `false`. |
| `VITE_FIREBASE_AUTH_EMULATOR_HOST` | No | Auth emulator host. Default: `127.0.0.1:9099`. |

## Access

The admin portal is **web-only**. Admin users sign in with email/password via Firebase Auth. Access is gated by the `admin_role` custom claim on the Firebase ID token — users without the claim are denied entry.

Custom claims are set by the `shrimd-backend` admin provisioning flow and must be granted before a user can log in.
