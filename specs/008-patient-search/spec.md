# Feature Specification: Patient Search

**Feature Branch**: `008-patient-search`
**Created**: 2026-05-17
**Status**: Implemented (backfill spec)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search for a patient and view summary results (Priority: P1)

An admin user (any role — admin, clinical_ops, or support_agent) needs to locate a specific patient quickly without navigating through a full patient list. They type a partial name, email address, or patient ID into a search field. After a brief pause the results table populates with matching patients, showing just enough information to identify the correct record. Clicking any row opens that patient's detail view.

**Why this priority**: Finding a patient is the gateway to every downstream admin task. Without this capability, no role-specific investigation or action is possible. It is the single most used screen in the admin portal.

**Independent Test**: Sign in with any admin role → navigate to Patient Search → type a partial name → confirm a results table appears showing display name, patient ID, state, lifecycle status, review status, and subscription status → click a row → confirm navigation to Patient Detail.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user is on the Patient Search screen, **When** they type at least one character into the search field, **Then** the system waits briefly and then queries the backend, displaying a loading indicator during the fetch.
2. **Given** a search query has been submitted, **When** the backend returns matching records, **Then** a table appears with one row per patient showing: display name, patient ID, state, lifecycle status, review status, and subscription status.
3. **Given** search results are displayed, **When** the user clicks any row, **Then** the application navigates to the Patient Detail view for that patient.
4. **Given** the search field contains text, **When** the user clears it completely, **Then** the results table is removed and a prompt to enter a search term is shown.

---

### User Story 2 — Handle no results and API errors gracefully (Priority: P2)

When a search returns no matches or the backend is temporarily unavailable, the admin user receives clear, safe feedback without seeing technical error details or being left in an ambiguous blank state.

**Why this priority**: Operational trust in the tool depends on predictable feedback. Blank or broken states cause admins to repeat searches or escalate unnecessarily.

**Independent Test**: Simulate a query that yields no results → confirm an explicit "no patients found" message is shown. Simulate a backend error → confirm a safe user-facing error message is shown without stack traces or internal codes.

**Acceptance Scenarios**:

1. **Given** a search query is submitted, **When** the backend returns an empty result set, **Then** a message explicitly states no patients were found for the query.
2. **Given** a search query is submitted, **When** the backend returns an error response, **Then** a safe, non-technical error message is shown and no partial or stale data is displayed alongside it.
3. **Given** the search is in-flight, **When** the user changes the query before results arrive, **Then** only the results matching the final query term are shown (no stale data flicker).

---

### User Story 3 — Results contain no full PHI (Priority: P1)

Search results expose the minimum data necessary for identification and triage. Full PHI such as date of birth, diagnosis, medication name, or complete address must never appear in the results table regardless of the querying role.

**Why this priority**: HIPAA minimum-necessary principle applies at the UI layer. Search results are visible on shared screens and may be captured in screenshots or browser history.

**Independent Test**: Inspect every column of the results table and confirm no field contains a diagnosis, medication, date of birth, or residential address.

**Acceptance Scenarios**:

1. **Given** search results are returned for any query, **Then** the results table contains only: display name, patient ID, US state abbreviation, lifecycle status, review status, subscription status, and last-updated timestamp.
2. **Given** a field value is absent for a patient (for example, no subscription status yet), **When** the row is rendered, **Then** the missing field is shown as a neutral placeholder, not hidden or shown as an error.

---

### Edge Cases

- What happens when the search query contains only whitespace? The system must treat a whitespace-only entry as empty and not submit a query.
- What happens when the backend is slow and the user types additional characters before results arrive? The display must reflect only the most recently settled query term.
- What happens when a patient record exists but has no display name? The row must still render with a neutral placeholder in the name column.
- What happens when the session token expires during a search? The client must surface an authentication error and redirect to the sign-in screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single text input that accepts name, email address, or patient ID as search terms.
- **FR-002**: The system MUST debounce the search input so that a backend query is not issued on every keystroke; the query must be issued only after the user has paused typing.
- **FR-003**: The system MUST display a loading indicator while a search query is in-flight.
- **FR-004**: The system MUST display a results table with the following columns: display name, patient ID, US state, lifecycle status, review status, subscription status.
- **FR-005**: The system MUST make every result row selectable, navigating to the Patient Detail screen for the selected patient on click.
- **FR-006**: The system MUST display an explicit empty state when a query returns zero results.
- **FR-007**: The system MUST display a safe, non-technical error message when the backend returns an error; it MUST NOT expose internal error codes or stack traces to the user.
- **FR-008**: The system MUST NOT include full PHI (date of birth, diagnosis, medication, residential address) in the search results table.
- **FR-009**: The system MUST suppress the query and results table when the search input is empty or contains only whitespace.
- **FR-010**: All three admin roles (admin, clinical_ops, support_agent) MUST have access to this screen; no role is excluded.
- **FR-011**: Search result data MUST NOT be persisted to local browser storage; it must live only in memory.

### Key Entities

- **Patient Summary**: A lightweight, de-identified snapshot of a patient record returned by the search endpoint. Contains: patient ID, display name (first name + last initial or equivalent), US state abbreviation, lifecycle status (e.g., intake_pending, active, cancelled), review status (e.g., pending, approved, declined), subscription status (e.g., active, paused, lapsed), and last-updated timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin user can locate a known patient by partial name, email, or patient ID within 3 user interactions (navigate to screen, type query, view result).
- **SC-002**: Search results appear within 2 seconds of the user pausing input under normal network conditions.
- **SC-003**: Zero PHI fields beyond the approved minimal set (display name, state, status fields) appear in the results table for any role.
- **SC-004**: The empty state and error state are each visually distinguishable from the loading state and from each other; a user cannot mistake one for another.
- **SC-005**: Navigating from a search result to Patient Detail and pressing Back returns the user to the same search screen with the same query intact.

## Assumptions

- All three admin roles are permitted to search; role-based restrictions apply at the Patient Detail screen, not at search.
- "Display name" returned by the backend is already de-identified to the minimum-necessary level; the admin portal does not apply additional masking to the name field.
- The backend is the authoritative source for which fields constitute PHI; the portal renders only what the backend returns in the search payload.
- Search is performed exclusively by the backend; the admin portal never filters or re-ranks results client-side.
- Session expiry and re-authentication are handled globally; the search screen does not implement its own auth recovery logic beyond surfacing the error.
- The search endpoint requires an authenticated Firebase ID token; unauthenticated requests are rejected by the backend.
