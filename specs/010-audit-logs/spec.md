# Feature Specification: Audit Logs

**Feature Branch**: `010-audit-logs`
**Created**: 2026-05-17
**Status**: Implemented (backfill spec)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Review backend-recorded admin activity (Priority: P1)

An admin or clinical_ops user needs to review a chronological record of actions taken within the admin backend — for example, to investigate a complaint, verify that a specific action was taken, or satisfy a compliance audit. They navigate to the Audit Logs screen and see a table of backend-recorded events with enough detail to identify who did what, when, and with what outcome.

**Why this priority**: Audit visibility is a HIPAA operational requirement. The ability to trace admin actions to actors and outcomes is non-negotiable for compliance and trust.

**Independent Test**: Sign in as admin or clinical_ops → navigate to Audit Logs → confirm a table appears with columns: timestamp, actor role, actor ID, action, patient ID, result, correlation ID, metadata keys → confirm support_agent cannot access this screen.

**Acceptance Scenarios**:

1. **Given** an authenticated admin or clinical_ops user navigates to the Audit Logs screen, **When** the screen loads, **Then** a table is displayed showing all available audit log entries.
2. **Given** the table is populated, **Then** each row contains: timestamp, actor role, actor ID, action name, patient ID (when present), result, correlation ID, and metadata key names.
3. **Given** the screen is loading data, **When** the fetch is in-flight, **Then** a loading skeleton is shown in place of the table rows.
4. **Given** a support_agent role session navigates to the Audit Logs route, **Then** the screen must not be accessible; the user must see an access-denied state or be redirected.

---

### User Story 2 — Filter audit log entries by patient ID (Priority: P2)

When investigating a specific patient's history, an admin or clinical_ops user needs to narrow the log table to only entries associated with a particular patient. They enter a patient ID into a filter field and the table updates to show only matching records.

**Why this priority**: Unfiltered audit logs may contain hundreds or thousands of entries. The ability to scope to a single patient is essential for any targeted investigation.

**Independent Test**: Navigate to Audit Logs → enter a known patient ID in the filter field → confirm the table updates to show only rows where the patient ID column matches → clear the filter → confirm all log entries return.

**Acceptance Scenarios**:

1. **Given** the Audit Logs screen is loaded, **When** the admin enters a patient ID in the filter field, **Then** the table updates to show only audit entries associated with that patient ID.
2. **Given** the patient ID filter is applied and returns no results, **Then** an explicit empty state message is shown referencing the filtered patient ID.
3. **Given** a patient ID filter is active, **When** the admin clears the field, **Then** the table reverts to showing all available log entries.
4. **Given** the admin is typing a patient ID, **When** they pause, **Then** the filter is applied; the backend is not queried on every keystroke.

---

### User Story 3 — Export the full audit log (Priority: P2)

An admin user (but not clinical_ops or support_agent) needs to download the complete audit log as a file for offline analysis, reporting, or regulatory submission. They click an Export button and the file download begins automatically.

**Why this priority**: Compliance teams and external auditors may require audit data in a portable format. Export is a necessary operational capability but is intentionally restricted to the highest-privilege role to prevent bulk data extraction by lower-privilege staff.

**Independent Test**: Sign in as admin → navigate to Audit Logs → confirm an Export button is visible → click it → confirm a file download is triggered → sign in as clinical_ops → confirm the Export button is not shown.

**Acceptance Scenarios**:

1. **Given** an admin user is on the Audit Logs screen, **Then** an Export button is visible in the filter bar.
2. **Given** the admin clicks Export, **When** the backend returns the export data, **Then** a file download begins automatically in the browser.
3. **Given** the export request is in-flight, **Then** the Export button is disabled and the label indicates the export is in progress.
4. **Given** the export succeeds, **Then** a brief success confirmation is shown and the button returns to its default state.
5. **Given** the export fails, **Then** a safe error message is shown without exposing backend details.
6. **Given** a clinical_ops user is on the Audit Logs screen, **Then** no Export button is shown.

---

### Edge Cases

- What happens when no audit log entries exist? An explicit empty state message is shown; the table is not rendered.
- What happens when the patient ID filter matches no records? A message explicitly states no entries were found for that patient ID.
- What happens when the backend returns a 403 for the audit logs endpoint (support_agent attempting access)? A clear access-denied state is shown; no partial data is rendered.
- What happens if the export backend call fails partway through a large response? The error state is shown on the screen; no partial file is saved.
- What happens when a metadata field has many keys? Metadata keys are displayed as individual labelled pills; the row expands to accommodate them rather than truncating silently.
- What happens when the correlation ID is very long? It is displayed in a fixed-width format and does not break the table layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST restrict access to the Audit Logs screen to admin and clinical_ops roles only; support_agent MUST NOT be able to access this screen.
- **FR-002**: The system MUST display a table of audit log entries with the following columns: timestamp, actor role, actor ID, action, patient ID, result, correlation ID, metadata keys.
- **FR-003**: Metadata keys MUST be displayed as a list of key names only; metadata values MUST NOT be shown.
- **FR-004**: The system MUST provide an optional patient ID filter input that, when populated, restricts the table to entries matching that patient ID.
- **FR-005**: The patient ID filter input MUST be debounced so that the backend is not queried on every keystroke.
- **FR-006**: The system MUST display a loading skeleton while audit log data is being fetched.
- **FR-007**: The system MUST display an explicit empty state when no log entries match the current filter or when no entries exist.
- **FR-008**: The system MUST display a safe, non-technical error message when the backend returns an error; it MUST NOT expose internal error codes or stack traces.
- **FR-009**: The system MUST display an Export button only when the authenticated user has the admin role.
- **FR-010**: Clicking Export MUST trigger a file download via the browser; the file content is determined entirely by the backend.
- **FR-011**: The Export button MUST be disabled while an export request is in-flight.
- **FR-012**: The system MUST display a brief success confirmation when export completes, and a safe error message when it fails.
- **FR-013**: The admin portal MUST NOT write audit records; it is a read-only consumer of backend-generated audit data.
- **FR-014**: Audit log data and export data MUST NOT be persisted to local browser storage.

### Key Entities

- **Audit Log Entry**: A backend-generated, immutable record of a single admin-initiated or system-initiated event. Contains: audit log ID (internal), timestamp, actor role, actor ID, action name, patient ID (optional), result (success/failure/etc.), correlation ID (for cross-system tracing), and a list of metadata key names (values are redacted at the API layer).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin user can load the Audit Logs screen and see all available entries without any configuration or filter required.
- **SC-002**: A support_agent session cannot reach the Audit Logs screen through any available navigation path.
- **SC-003**: A patient ID filter narrows the displayed records to only those associated with that patient within the same page load, without requiring a full page refresh.
- **SC-004**: An admin user can trigger an audit log export and receive a downloaded file within a single click, without any additional confirmation steps.
- **SC-005**: No audit log metadata values (only key names) are visible in the table for any role.

## Assumptions

- Audit records are written exclusively by the backend (Firebase Cloud Functions); the admin portal has no write path to the audit log collection.
- The backend handles all PHI scoping within audit entries; the portal renders exactly what the backend returns.
- Export file format and content are determined by the backend; the portal is responsible only for initiating the download and handling success/failure states.
- The patient ID filter is passed as a query parameter to the backend; filtering is not performed client-side.
- Correlation IDs are opaque identifiers used for cross-system debugging; the portal displays them verbatim without attempting to resolve or link them.
- The audit log table does not paginate in the current release; the backend determines the result set size.
