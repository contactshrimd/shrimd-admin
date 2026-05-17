# Tasks: Patient Search Screen

**Input**: `specs/04-screens/patient-search.md`, `specs/09-api-client-contract.md`

## Phase 1: API Client Wiring (Foundational)

- [x] T001 Create `src/api/types.ts` — export `AdminPatientSummary` type from API contract
- [x] T002 Create `src/api/useAdminApi.ts` — hook returning memoized `AdminApiClient` wired to `auth.currentUser.getIdToken()` and `env.API_BASE_URL`
- [x] T003 Create `src/api/hooks/usePatientSearch.ts` — React Query hook calling `GET /admin/patients/search?q=<query>`; disabled when query is empty; staleTime 30s; no caching to localStorage

## Phase 2: Patient Search Screen (P1)

**Goal**: Search input + results table; all three roles can access.

**Independent Test**: Sign in → navigate to Patient Search → type a query → see results table (or empty/error state).

- [x] T004 [US1] Create `src/screens/PatientSearchScreen.tsx` — controlled search input (debounced 400ms), results table showing `displayName`, `state`, `lifecycleState`, `reviewStatus`, `subscriptionStatus`, `updatedAt`; loading skeleton; empty state; API error state with safe message
- [x] T005 [US1] Update `src/App.tsx` — render `<PatientSearchScreen>` when active route id is `patient-search` instead of the metadata panel

## Phase 3: Polish

- [x] T006 Add patient search styles to `src/styles.css` — search bar, table layout, status badges, skeleton rows
- [x] T007 Update `src/main.tsx` — clear React Query cache on sign-out (call `queryClient.clear()` when auth user becomes null)
- [x] T008 Run `npm run type-check` and fix errors
- [x] T009 Run `npm run build` and confirm success
