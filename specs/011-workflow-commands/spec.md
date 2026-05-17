# Feature Specification: Workflow Commands

**Feature Branch**: `011-workflow-commands`
**Created**: 2026-05-17
**Status**: Implemented (backfill spec)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Inspect the current state of backend workflow commands (Priority: P1)

An admin or clinical_ops user needs visibility into the backend queue of workflow commands — tasks that integrate with external systems such as OpenLoop, Empower Pharmacy, and Stripe. They navigate to the Workflow Commands screen and see a table summarising each command: its identity, type, current status, associated patient, retry attempts, any error code, and the names (not values) of its payload fields.

**Why this priority**: Workflow commands drive all critical async operations (intake submission, pharmacy orders, refill triggers). When operations fail or stall, this screen is the first place an admin looks to understand what the backend is doing. Without it, operational issues are invisible until a patient escalates.

**Independent Test**: Sign in as admin or clinical_ops → navigate to Workflow Commands → confirm a table appears with columns: command ID, type, status, patient ID, attempt count, error code, last attempt timestamp, next attempt timestamp, payload keys → confirm no raw payload data is visible → confirm support_agent cannot access this screen.

**Acceptance Scenarios**:

1. **Given** an authenticated admin or clinical_ops user navigates to Workflow Commands, **When** the screen loads, **Then** a table of workflow command summaries is displayed.
2. **Given** the table is loaded, **Then** each row contains: command ID, type, status, patient ID, attempt count, error code (when present), last attempt timestamp, next attempt timestamp, and payload key names.
3. **Given** a command has an attempt count of 3 or more, **Then** the attempt count is displayed with a visual highlight (e.g., a red or warning badge) to draw attention to repeated failures.
4. **Given** a support_agent navigates to the Workflow Commands route, **Then** they must not be able to access this screen; an access-denied state or redirect is shown.

---

### User Story 2 — Filter commands by status, patient ID, and type (Priority: P2)

When investigating a specific failure or tracking a particular category of command, an admin or clinical_ops user needs to narrow the table without scrolling through the entire command list. Three independent filters are available: status (from a fixed set of values), patient ID (free text), and command type (free text).

**Why this priority**: An unfiltered command list may contain many entries across multiple patients and operation types. Targeted filtering is essential for efficient operational triage.

**Independent Test**: Navigate to Workflow Commands → select "failed" from the status filter → confirm only failed commands appear → enter a patient ID in the patient ID field → confirm the table further narrows → clear all filters → confirm the full list returns.

**Acceptance Scenarios**:

1. **Given** the user selects a status from the status dropdown (queued, processing, succeeded, or failed), **Then** the table updates to show only commands with that status.
2. **Given** the user enters a patient ID in the patient ID filter, **Then** the table updates to show only commands associated with that patient.
3. **Given** the user enters a value in the command type filter, **Then** the table updates to show only commands whose type matches.
4. **Given** multiple filters are active simultaneously, **Then** the table shows only commands that satisfy all active filters.
5. **Given** a text filter field has focus and the user is typing, **When** they pause, **Then** the filter is applied; the backend is not queried on every keystroke.
6. **Given** the status dropdown is set to "All statuses" (default), **Then** the table shows commands of all statuses.

---

### User Story 3 — Confirm that raw payload data is never exposed (Priority: P1)

All workflow commands carry a payload used by the backend to execute the operation. This payload may include PHI (patient identifiers, clinical data, prescription parameters). The Workflow Commands screen must never show raw payload contents — only the names of the keys present in the payload.

**Why this priority**: Payload contents can include PHI that must not be visible in the admin portal UI. This is a compliance boundary, not a UX choice.

**Independent Test**: Load the Workflow Commands screen for any set of commands → inspect every cell in every row → confirm no column contains raw payload values → confirm only key names appear in the Payload keys column.

**Acceptance Scenarios**:

1. **Given** a command row is rendered, **When** the payload keys column is populated, **Then** it shows only the names of keys present in the payload, not their values.
2. **Given** a command has no payload keys, **Then** the payload keys cell shows a neutral unavailable indicator.
3. **Given** any network inspection of the admin portal's requests, **Then** no request to the backend asks for full command payload data.

---

### Edge Cases

- What happens when no workflow commands match the current filters? An explicit message is shown indicating no commands match, referencing whether filters are active.
- What happens when no commands exist at all (empty system)? An explicit empty state message is shown.
- What happens when the backend returns an error? A safe, non-technical error message is shown; the table is not rendered with stale data.
- What happens when a command has a very large number of payload keys? They are displayed as individual labelled pills and the cell expands; keys are not truncated silently.
- What happens when a command has no associated patient ID? The patient ID cell shows a neutral placeholder; no error is triggered.
- What happens when a filter value changes while a fetch is in-flight? Only the result of the most recently settled filter set is displayed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST restrict access to the Workflow Commands screen to admin and clinical_ops roles only; support_agent MUST NOT be able to access this screen.
- **FR-002**: The system MUST display a table of workflow command summaries with the following columns: command ID, type, status, patient ID, attempt count, error code, last attempt timestamp, next attempt timestamp, payload keys.
- **FR-003**: Payload keys MUST be displayed as a list of key names only; payload values MUST NEVER be displayed.
- **FR-004**: The system MUST visually distinguish commands with an attempt count of 3 or more to indicate elevated retry activity.
- **FR-005**: The system MUST provide a status filter offering the following fixed options: all statuses (default), queued, processing, succeeded, failed.
- **FR-006**: The system MUST provide a patient ID text filter that, when populated, restricts results to commands associated with that patient.
- **FR-007**: The system MUST provide a command type text filter that, when populated, restricts results to commands of that type.
- **FR-008**: Text filter inputs MUST be debounced so that the backend is not queried on every keystroke.
- **FR-009**: All three filters MUST be combinable; when multiple filters are active, only commands satisfying all filters are shown.
- **FR-010**: The system MUST display a loading skeleton while command data is being fetched.
- **FR-011**: The system MUST display an explicit empty state when no commands match the current filters or when no commands exist.
- **FR-012**: The system MUST display a safe, non-technical error message when the backend returns an error; it MUST NOT expose internal error codes or stack traces.
- **FR-013**: The screen MUST be inspection-only; no retry, cancel, or other mutating action is available in the current release.
- **FR-014**: Workflow command data MUST NOT be persisted to local browser storage.

### Key Entities

- **Workflow Command Summary**: A backend-generated, redacted summary of a single queued or executed workflow command. Contains: command ID, type (e.g., submit_intake, place_order, trigger_refill), status (queued/processing/succeeded/failed), associated patient ID (optional), attempt count, last error code (optional), timestamps for last and next attempt, and a list of payload key names (values redacted by the backend before returning to the portal).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin user can navigate to Workflow Commands and see the current state of all commands without any filter required.
- **SC-002**: A support_agent session cannot reach the Workflow Commands screen through any available navigation path.
- **SC-003**: Commands with 3 or more attempts are visually distinguishable from commands with fewer attempts in 100% of rendered rows.
- **SC-004**: Zero payload value fields appear in the table for any role; only key names are ever visible.
- **SC-005**: Applying any single filter narrows the displayed results without requiring a page reload or manual refresh.
- **SC-006**: The screen provides no mutating actions (no Retry, Cancel, or similar buttons) in the current release.

## Assumptions

- The backend returns only redacted command summaries (payload keys, not values) to the admin portal; the portal applies no additional redaction.
- The fixed status filter options (queued, processing, succeeded, failed) are stable and do not require dynamic fetching from the backend.
- All filter parameters are passed as query parameters to the backend; the portal does not filter client-side.
- The command table does not paginate in the current release; the backend determines the result set size.
- A future release may add a retry or cancel action if the backend exposes a corresponding command endpoint; the current spec covers inspection only.
- Support_agent exclusion is enforced by both the backend (returning 403 for unauthorized roles) and the portal navigation layer (hiding the route from the sidebar).
