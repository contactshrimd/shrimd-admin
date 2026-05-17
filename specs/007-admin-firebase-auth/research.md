# Research: Admin Firebase Auth

## Firebase Auth SDK in a Vite React SPA

**Decision**: Use `initializeApp` + `getAuth` from `firebase/app` and `firebase/auth`. Initialize once in `src/firebase.ts` and export the `auth` instance.

**Rationale**: Firebase SDK 12 supports modular imports, keeping bundle size minimal. A single init file avoids duplicate app initialization errors.

**Alternatives considered**: `firebase-admin` SDK — rejected (server-only, not usable in browser).

---

## Custom Claims for Role

**Decision**: Read `admin_role` from `IdTokenResult.claims` via `user.getIdTokenResult()` after sign-in. Cache the role in React context — refresh on token refresh events via `onIdTokenChanged`.

**Rationale**: `onIdTokenChanged` fires on sign-in, sign-out, and token refresh (every ~60 min), keeping the in-memory role current without extra fetches.

**Alternatives considered**: Storing role in Firestore — rejected (violates API-only access principle; adds unnecessary read).

---

## Session Persistence

**Decision**: Use Firebase's default `browserLocalPersistence` (IndexedDB). No explicit call needed — it is the default.

**Rationale**: Survives page refresh and new tabs in the same browser. Firebase manages the session; the app never touches storage directly.

**Alternatives considered**: `browserSessionPersistence` — rejected (requires re-login on every tab close, too disruptive for operations staff).

---

## Route Protection Pattern

**Decision**: A `<ProtectedRoute>` wrapper component checks `AuthContext` for `user`. If `null` and auth state is resolved (not loading), render `<Navigate to="/sign-in" replace />`. While loading, render a spinner to avoid flash of redirect.

**Rationale**: React Router v6 pattern; avoids layout jank. `replace` prevents back-button escaping sign-in.

**Alternatives considered**: Higher-order component — rejected (hooks are cleaner in React 18).

---

## Firebase Error Code Mapping

**Decision**: Map Firebase error codes to user-safe messages in the sign-in form:

| Firebase Code | User Message |
|---|---|
| `auth/invalid-credential` | "Incorrect email or password." |
| `auth/user-not-found` | "Incorrect email or password." (same — avoids enumeration) |
| `auth/wrong-password` | "Incorrect email or password." |
| `auth/too-many-requests` | "Too many attempts. Please try again later." |
| `auth/network-request-failed` | "Network error. Check your connection and try again." |
| *(any other)* | "Sign-in failed. Please try again." |

**Rationale**: User/password errors use the same message to prevent account enumeration attacks.

---

## Firebase Config via Vite Env Vars

**Decision**: Read `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` from `import.meta.env`. Add to `src/env.ts`.

**Rationale**: Vite exposes `VITE_*` vars at build time; safe for client-side Firebase config (these are not secrets — they identify the project, not authorize access).

**Note**: Production values must be set as environment variables in the hosting environment (Vercel), not committed to source control.
