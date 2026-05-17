# Feature Specification: Patient Detail

**Feature Branch**: `009-patient-detail`
**Created**: 2026-05-17
**Status**: Implemented (backfill spec)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View a patient's full operational context (Priority: P1)

After selecting a patient from search results, an admin user needs a consolidated view of that patient's current state across identity, clinical review, subscription, and fulfillment. This allows them to answer operational questions ("Is this patient active? Has their intake been reviewed? Is their order in transit?") without navigating to multiple screens.

**Why this priority**: Patient Detail is the primary workspace for operational triage. Every downstream admin action (resending notifications, escalating issues) begins here. Without it, the search screen delivers no actionable value.

**Independent Test**: Search for a patient → click their row → confirm the detail screen appears with at minimum: patient name, patient ID, US state, lifecycle status, review status, subscription status, and last-updated timestamp → confirm a Back button returns to the search results.

**Acceptance Scenarios**:

1. **Given** an admin user has clicked a patient row in search results, **When** the detail screen loads, **Then** the patient's identity section shows display name, patient ID, and US state.
2. **Given** the detail screen has loaded, **Then** a status section shows lifecycle status, review status, subscription status, and last-updated timestamp.
3. **Given** the detail screen is loading data from the backend, **When** the fetch is in-flight, **Then** a loading skeleton is shown in place of the data sections.
4. **Given** the user has finished reviewing the patient, **When** they click the back button, **Then** they are returned to the Patient Search screen.

---

### User Story 2 — View extended patient fields, with graceful handling of role-scoped omissions (Priority: P2)

Certain fields (email address, refill status, prescription status, fulfillment status) may be absent from the backend response depending on the requesting admin's role. The detail screen must display these fields when present and show a clear "unavailable" indicator when they are absent — without treating absence as an error.

**Why this priority**: Different roles have different data access rights. Support agents may not see clinical fields; clinical_ops may not see billing fields. The screen must be usable regardless of which optional fields the backend returns, so that every role receives a consistent, trustworthy interface.

**Independent Test**: Sign in as each of the three admin roles → navigate to the same patient's detail screen → confirm that fields absent from the response are shown with a neutral unavailable indicator, and fields present are shown with their values → confirm no "load failed" error appears for omitted optional fields.

**Acceptance Scenarios**:

1. **Given** the backend response includes an email address, **When** the extended info section renders, **Then** the email field shows the address.
2. **Given** the backend response omits email (due to role scoping), **When** the extended info section renders, **Then** the email field shows a neutral unavailable indicator, not an error state.
3. **Given** any combination of refill status, prescription status, or fulfillment status is absent from the response, **Then** each absent field is individually shown as unavailable, and the section header and present fields are still rendered normally.

---

### User Story 3 — Resend a notification to a patient (Priority: P2)

An admin user needs to re-trigger a status notification (for example, re-sending an approval message if the patient reports not receiving it). They select a notification type from a predefined list and submit. The system confirms the notification has been queued by the backend.

**Why this priority**: Resend is the only live action on the detail screen in the current release. It handles the most common operational support request: "The patient says they didn't get their approval message — can you resend it?"

**Independent Test**: Navigate to any patient detail screen → locate the Resend Notification panel → select a notification type → click Resend → confirm a success confirmation message appears briefly.

**Acceptance Scenarios**:

1. **Given** an admin user is on the patient detail screen, **When** they select a notification type from the dropdown and click Resend, **Then** the button enters a disabled/sending state while the request is in-flight.
2. **Given** the resend request succeeds, **When** the backend confirms the notification is queued, **Then** a success message is displayed and the panel returns to its default state after a short delay.
3. **Given** the resend request fails, **When** the backend returns an error, **Then** a safe error message is shown and the admin can attempt the action again.
4. **Given** the notification type dropdown, **Then** it offers the following options: intake received, approved, declined, order shipped, refill reminder, payment failed.

---

### User Story 4 — See deferred actions that are not yet available (Priority: P3)

Two future workflow actions (Trigger Refill Review and Flag Issue) are visible on the screen but disabled, with a "Coming soon" label. This sets expectations without removing the visual placeholder, so admins understand these capabilities are planned.

**Why this priority**: Low operational priority but important for trust — admins should not assume these actions are broken or deliberately hidden.

**Independent Test**: Navigate to any patient detail screen → confirm "Trigger refill review" and "Flag issue" appear in an Other Actions section → confirm both are non-interactive and labelled "Coming soon".

**Acceptance Scenarios**:

1. **Given** the detail screen is loaded, **Then** an "Other actions" section is visible containing Trigger refill review and Flag issue entries.
2. **Given** the Trigger refill review and Flag issue entries are displayed, **Then** neither is clickable and both display a "Coming soon" badge.

---

### Edge Cases

- What happens when the patient ID passed to the detail screen does not exist in the backend? A safe error message is shown; the screen must not crash or show a blank view.
- What happens if the backend returns a 403 for this patient (role restriction)? A clear access-denied message is shown; no partial data is rendered.
- What happens if the resend notification request is submitted twice rapidly? The submit button is disabled while a request is in-flight, preventing duplicate submissions.
- What happens if the patient has no display name? The header renders with a neutral fallback label.
- What happens when a previously successful resend is followed immediately by a failed resend? Each response is shown independently; prior success state does not persist into a new attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a patient identity section containing: display name, patient ID, and US state.
- **FR-002**: The system MUST display a status section containing: lifecycle status, review status, subscription status, and last-updated timestamp.
- **FR-003**: The system MUST display an extended information section containing: email address, refill status, prescription status, and fulfillment status.
- **FR-004**: Each field in the extended information section that is absent from the backend response MUST be rendered with a neutral unavailable indicator; absent fields MUST NOT trigger an error state for the section or screen.
- **FR-005**: The system MUST display a Resend Notification panel allowing selection of a notification type and submission of a resend request.
- **FR-006**: The notification type selector MUST offer exactly: intake_received, approved, declined, order_shipped, refill_reminder, payment_failed.
- **FR-007**: The Resend button MUST be disabled while a resend request is in-flight to prevent duplicate submissions.
- **FR-008**: The system MUST display a success confirmation when the backend confirms the notification is queued, and MUST clear that confirmation automatically after a short delay.
- **FR-009**: The system MUST display a safe, non-technical error message when a resend request fails, and MUST allow the admin to retry.
- **FR-010**: The system MUST display a deferred actions section containing Trigger Refill Review and Flag Issue entries; both MUST be non-interactive and labelled "Coming soon" until corresponding backend endpoints are available.
- **FR-011**: The system MUST provide a Back button that returns the user to the Patient Search screen.
- **FR-012**: The system MUST show a loading skeleton while patient data is being fetched.
- **FR-013**: The system MUST display a safe error message when the patient detail fetch fails; it MUST NOT expose internal error codes or stack traces.
- **FR-014**: Patient detail data MUST NOT be persisted to local browser storage.

### Key Entities

- **Patient Detail**: An extended patient record returned by the backend, containing all Patient Summary fields plus optional role-scoped fields: email address, refill status, prescription status, and fulfillment status. The portal renders what is returned; it never derives or infers missing fields.
- **Notification Request**: A request to queue a re-delivery of a specific notification type for a specific patient. Submitted to the backend; the portal displays only the queued confirmation returned by the backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin user can navigate from a search result to a patient detail view in one click, and return to search in one click.
- **SC-002**: All three admin roles can load a patient detail screen without encountering an error state caused by missing optional fields.
- **SC-003**: A resend notification request can be submitted and confirmed in under 3 user interactions (select type, click Resend, read confirmation).
- **SC-004**: No field on the detail screen ever displays raw PHI (date of birth, full diagnosis, medication name, residential address) beyond the approved minimal set.
- **SC-005**: The deferred actions section is present and clearly non-interactive on 100% of patient detail views.

## Assumptions

- The backend is responsible for role-based field scoping; the admin portal does not implement its own PHI field suppression logic — it renders whatever the backend returns and shows unavailable indicators for absent optional fields.
- The notification types available in the resend panel are a closed, backend-enforced list; the portal does not dynamically fetch them.
- Mutating actions (including Resend Notification) are audited by the backend; the portal does not write audit records directly.
- Trigger Refill Review and Flag Issue will remain disabled until the corresponding backend endpoints are added to the OpenAPI contract and confirmed available.
- The detail screen is accessed exclusively via the Patient Search flow; there is no direct deep-link entry to a patient detail screen in the current release.
- Session expiry handling is global; the detail screen surfaces auth errors but does not implement its own re-authentication flow.
