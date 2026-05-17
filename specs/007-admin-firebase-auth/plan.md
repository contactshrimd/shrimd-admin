# Implementation Plan: Admin Firebase Auth

**Branch**: `007-admin-firebase-auth` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/007-admin-firebase-auth/spec.md`

## Summary

Wire Firebase Auth (GCP Identity Platform, email/password) into the admin portal so that all screens are protected behind authentication. On sign-in, the `admin_role` custom claim from the ID token replaces the current mock role picker. The `AdminApiClient` is connected to `getIdToken()` from the Firebase Auth SDK. A protected route guard redirects unauthenticated users to a sign-in screen. Sign-out clears the session.

## Technical Context

**Language/Version**: TypeScript 5.5 (strict)
**Primary Dependencies**: React 18, Vite 5, Firebase SDK 12 (already installed), React Query 5
**Storage**: No client-side PHI storage. Firebase Auth SDK manages session in IndexedDB internally.
**Testing**: Manual browser testing (no test runner configured in this repo yet)
**Target Platform**: Web only (modern evergreen browsers)
**Project Type**: Web application (React SPA)
**Performance Goals**: Sign-in redirect < 200 ms from page load for unauthenticated users
**Constraints**: No PHI in localStorage/sessionStorage/cookies. No direct Firestore access. HTTPS only in production.
**Scale/Scope**: ~5-20 internal admin users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Backend Authority | PASS | Auth reads ID token claim; no backend state modified client-side |
| II. API-Only Access | PASS | Firebase Auth SDK used for auth only; no Firestore SDK usage |
| III. RBAC | PASS | `admin_role` custom claim from ID token drives role; backend enforces permissions |
| IV. Minimum Necessary Access (HIPAA) | PASS | No PHI involved in auth flow |
| V. Audit Logging | PASS | Sign-in/sign-out actions are Firebase Auth events; backend logs API access via token |
| VI. Read-Heavy, Action-Light | PASS | Sign-in and sign-out are the only actions |
| VII. No Direct Data Mutation | PASS | Auth flow does not mutate any application data |
| VIII. Secure Data Handling | PASS | No PHI stored client-side; Firebase SDK manages session in IndexedDB |
| IX. Frontend Simplicity | PASS | Sign-in screen and route guard are thin; no business logic |
| X. Error Handling & Safety | PASS | Firebase error codes mapped to generic user-safe messages |
| XI. Integration Isolation | PASS | Firebase Auth SDK is the only external call; no OpenLoop/Stripe/Pharmacy |

## Project Structure

### Documentation (this feature)

```text
specs/007-admin-firebase-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit-tasks)
```

### Source Code

```text
src/
├── firebase.ts              # NEW — Firebase app init + Auth instance
├── env.ts                   # UPDATED — add VITE_FIREBASE_* vars
├── main.tsx                 # UPDATED — wrap app in AuthProvider
├── App.tsx                  # UPDATED — remove role picker; read role from auth context
├── routes.ts                # NO CHANGE — route definitions already correct
├── api/
│   └── client.ts            # NO CHANGE — already accepts getIdToken()
├── auth/
│   ├── AuthContext.tsx       # NEW — Firebase Auth context + provider
│   ├── useAuth.ts            # NEW — hook to consume AuthContext
│   ├── ProtectedRoute.tsx    # NEW — redirects unauthenticated users to /sign-in
│   └── SignInPage.tsx        # NEW — email/password sign-in form
└── styles.css               # MINOR UPDATE — sign-in form styles
```
