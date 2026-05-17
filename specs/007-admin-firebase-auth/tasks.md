# Tasks: Admin Firebase Auth

**Input**: Design documents from `specs/007-admin-firebase-auth/`

## Phase 1: Setup

**Purpose**: Firebase config and environment wiring

- [x] T001 Add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` to `src/env.ts`
- [x] T002 Create `src/firebase.ts` — initialize Firebase app with env vars and export `auth` (`getAuth` instance)

---

## Phase 2: Foundational — Auth Context & Route Guard

**Purpose**: Core auth infrastructure that every protected screen depends on

**⚠️ CRITICAL**: No screen implementation can begin until this phase is complete

- [x] T003 Create `src/auth/AuthContext.tsx` — define `AuthContext` with shape `{ user, role, loading }` and `AuthProvider` that subscribes to `onIdTokenChanged`, reads `admin_role` custom claim, and calls `signOut` + sets access-denied error if claim is absent or unrecognized
- [x] T004 Create `src/auth/useAuth.ts` — hook that reads `AuthContext` and throws if used outside `AuthProvider`
- [x] T005 Create `src/auth/ProtectedRoute.tsx` — renders a loading spinner while `loading: true`; redirects to `/sign-in` (with `replace`) when `user` is `null`; renders `children` when authenticated
- [x] T006 Update `src/main.tsx` — wrap `<App>` with `<AuthProvider>` (inside `QueryClientProvider`)

**Checkpoint**: Auth context is live — sign-in screen and app shell update can proceed

---

## Phase 3: User Story 1 — Admin Sign-In (Priority: P1) 🎯 MVP

**Goal**: Admin users can sign in with email/password; role from ID token drives navigation; invalid credentials show a safe error message.

**Independent Test**: Open `/sign-in` → enter `super@shrimd.com` / wrong password → see "Incorrect email or password." → enter correct credentials → land on Patient Search with role-appropriate nav.

- [x] T007 [US1] Create `src/auth/SignInPage.tsx` — controlled form with `email` + `password` fields, submit calls `signInWithEmailAndPassword`, maps Firebase error codes to user-safe messages (see `research.md` error table), disables submit while in-flight
- [x] T008 [US1] Add sign-in route to `src/App.tsx` — replace the single-page shell with a minimal client-side router: `/sign-in` renders `<SignInPage>`, `/` and all other paths render the existing admin shell wrapped in `<ProtectedRoute>`
- [x] T009 [US1] Update `src/App.tsx` — remove the role picker `<select>`; read `role` from `useAuth()` and pass to `getVisibleRoutes()`; show the user's email in the topbar header

---

## Phase 4: User Story 2 — Persistent Session (Priority: P2)

**Goal**: Refreshing the browser does not require re-login when the Firebase session is still valid.

**Independent Test**: Sign in → hard-refresh (`Ctrl+R`) → page loads directly into the portal without the sign-in screen appearing.

- [x] T010 [US2] Verify `AuthProvider` loading gate — confirm the `loading: true` state prevents any redirect before `onIdTokenChanged` fires; fix if the ProtectedRoute redirects prematurely on page load (no code change needed if T003 is correct — add a brief manual test step)

*Note*: Firebase's default `browserLocalPersistence` handles session survival across refreshes automatically. This phase is primarily a validation checkpoint.

---

## Phase 5: User Story 3 — Sign-Out (Priority: P3)

**Goal**: Clicking Sign out clears the session and returns the user to sign-in; back button does not restore portal.

**Independent Test**: Sign in → click Sign out → at sign-in screen → press browser back button → still at sign-in screen.

- [x] T011 [US3] Add a "Sign out" button to the topbar in `src/App.tsx` — calls `signOut(auth)` from the Firebase SDK; the `onIdTokenChanged` listener in `AuthProvider` fires and the `ProtectedRoute` redirects to `/sign-in`
- [x] T012 [US3] Add sign-out styles to `src/styles.css` — button should be visually distinct (top-right of topbar)

---

## Phase 6: Polish & Cross-Cutting

- [x] T013 Add `.env.example` to repo root with all `VITE_FIREBASE_*` keys set to `REPLACE_ME` (no real values)
- [x] T014 Update `src/styles.css` — add sign-in page styles (centered card, form layout, error message styling)
- [x] T015 Run `npm run type-check` and fix any TypeScript errors
- [x] T016 Run `npm run build` and confirm the production build succeeds

---

## Dependencies

```
T001 → T002 → T003 → T004, T005
T006 depends on T003
T007 depends on T004 (useAuth)
T008 depends on T005, T007
T009 depends on T004, T008
T010 depends on T003, T005, T008 (validation only)
T011 depends on T009
T012 depends on T011
T013, T014 can run anytime
T015, T016 after all implementation tasks
```

## Parallel Opportunities

- T001 and T013 can run in parallel (different files)
- T004 and T005 can run in parallel after T003 (different files)
- T007 and T011 can run in parallel after their respective phase prerequisites

## Implementation Strategy

**MVP** = Phase 1 + Phase 2 + Phase 3 (T001–T009): Delivers a working sign-in gate with role-based navigation.
Phase 4 is a validation checkpoint (no new code if T003 is correct).
Phase 5 adds sign-out (T011–T012).
Phase 6 is polish and build verification.
