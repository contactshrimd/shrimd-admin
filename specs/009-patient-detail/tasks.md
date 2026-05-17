# Tasks: Patient Detail Screen

**Input**: `specs/04-screens/patient-detail.md`, `specs/09-api-client-contract.md`

## Phase 1: API Hooks

- [x] T001 Create `src/api/hooks/usePatientDetail.ts` — React Query hook for `GET /admin/patients/{patientId}`; staleTime 30s; disabled when patientId is empty
- [x] T002 Create `src/api/hooks/useResendNotification.ts` — React Query mutation for `POST /admin/actions/resend-notification`; returns queued confirmation

## Phase 2: Patient Detail Screen

**Goal**: Click a search result row → full detail view with back button and resend action.

**Independent Test**: Search → click a row → see detail sections (basic info, status, optional fields shown as unavailable when missing) → click "Back to results" → return to search.

- [x] T003 [US1] Create `src/screens/PatientDetailScreen.tsx` — detail sections: identity (name, ID, state), status grid (lifecycleState, reviewStatus, subscriptionStatus), extended fields (email, refillStatus, prescriptionStatus, fulfillmentStatus — shown as unavailable when absent), resend-notification action panel, deferred actions (trigger refill review, flag issue) shown as disabled with "Coming soon" label; loading skeleton; API error state
- [x] T004 [US1] Update `src/screens/PatientSearchScreen.tsx` — add `onSelectPatient: (id: string) => void` prop; make rows clickable (cursor-pointer, hover highlight); call prop on row click
- [x] T005 [US1] Update `src/App.tsx` — add `selectedPatientId` state to `AdminShell`; when `patient-search` is active and `selectedPatientId` is set render `PatientDetailScreen`, else render `PatientSearchScreen`; pass `onSelectPatient` to search and `onBack` to detail

## Phase 3: Polish

- [x] T006 Add patient detail styles to `src/styles.css` — detail header, info grid, field groups, action panel, deferred action badges, back button
- [x] T007 Run `npm run build` — fix any type errors
