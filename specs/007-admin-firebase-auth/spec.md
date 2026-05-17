# Feature Specification: Admin Firebase Auth

**Feature Branch**: `007-admin-firebase-auth`
**Created**: 2026-05-17
**Status**: Draft
**Input**: Firebase Auth integration for the ShriMD admin portal

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin Sign-In (Priority: P1)

An admin user opens the portal and is presented with a sign-in screen. They enter their email and password. On success, they are taken to the admin portal home (Patient Search). Their role (support_agent, admin, or clinical_ops) is read from the Firebase ID token and determines which navigation items are visible.

**Why this priority**: Nothing in the admin portal is accessible without authentication. This is the entry gate for all other features.

**Independent Test**: Navigate to `/` unauthenticated → redirected to sign-in. Enter valid credentials → land on Patient Search with role-appropriate navigation visible.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user visits any admin route, **When** the page loads, **Then** they are redirected to the sign-in screen.
2. **Given** a valid admin email/password, **When** the user submits the sign-in form, **Then** they are authenticated and routed to the Patient Search screen.
3. **Given** a successful sign-in, **When** the ID token is decoded, **Then** the `admin_role` custom claim (`support_agent`, `admin`, or `clinical_ops`) determines navigation visibility.
4. **Given** invalid credentials, **When** the user submits the form, **Then** a clear error message is shown and the user remains on the sign-in screen.
5. **Given** an empty email or password, **When** the user attempts to submit, **Then** inline validation prevents submission and highlights the missing fields.

---

### User Story 2 — Persistent Session (Priority: P2)

An admin user closes and reopens their browser tab. If their Firebase session is still valid, they are taken directly to the portal without re-entering credentials.

**Why this priority**: Avoids friction on every browser refresh during a working session. Important for operational efficiency.

**Independent Test**: Sign in → close tab → reopen → land on Patient Search without a sign-in prompt.

**Acceptance Scenarios**:

1. **Given** a previously authenticated session that is still valid, **When** the user revisits the portal, **Then** they bypass the sign-in screen and see the portal.
2. **Given** a session that has expired, **When** the user revisits the portal, **Then** they are redirected to sign-in.

---

### User Story 3 — Sign-Out (Priority: P3)

An admin user clicks "Sign out" in the portal. Their session is cleared and they are returned to the sign-in screen. All in-memory state is discarded.

**Why this priority**: Required for shared-workstation security and clean session lifecycle.

**Independent Test**: Sign in → click Sign out → redirected to sign-in → back button does not restore the portal.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they click Sign out, **Then** their session is cleared and they are redirected to sign-in.
2. **Given** a signed-out state, **When** the user presses the browser back button, **Then** they remain on or are redirected to the sign-in screen (no protected content visible).

---

### Edge Cases

- What happens when Firebase is unreachable during sign-in? → A network error message is shown; the form remains usable.
- What happens if the ID token contains no `admin_role` claim? → The user is signed out immediately and shown an "Access denied — contact your administrator" message.
- What happens if the token expires mid-session? → Firebase SDK handles silent token refresh automatically; the user session continues uninterrupted. If refresh fails, the user is redirected to sign-in.
- What happens if the user enters their password incorrectly three or more times? → Firebase Auth's built-in rate-limiting applies; the error message reflects the Firebase response without exposing internal details.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The portal MUST display a sign-in screen to unauthenticated users.
- **FR-002**: Sign-in MUST use email and password only — no Google, Apple, or other SSO providers.
- **FR-003**: The portal MUST redirect unauthenticated users from any protected route to the sign-in screen.
- **FR-004**: On successful sign-in, the portal MUST read the `admin_role` custom claim from the Firebase ID token.
- **FR-005**: If the `admin_role` claim is absent or unrecognized, the portal MUST immediately sign the user out and display an access-denied message.
- **FR-006**: Navigation items MUST be filtered to only those permitted by the user's `admin_role` (matching the existing RBAC route matrix in `routes.ts`).
- **FR-007**: The `AdminApiClient` MUST obtain a fresh Firebase ID token for every API request via the Firebase Auth SDK.
- **FR-008**: The portal MUST support session persistence across browser refreshes (Firebase's default session persistence).
- **FR-009**: Sign-out MUST clear the Firebase session and redirect the user to sign-in.
- **FR-010**: No PHI and no auth credentials (tokens, passwords) MUST be stored in `localStorage`, `sessionStorage`, cookies, or any browser-managed storage beyond what the Firebase Auth SDK manages internally.
- **FR-011**: The sign-in form MUST show field-level validation errors for empty or malformed email addresses before submission.
- **FR-012**: Authentication errors from Firebase (wrong password, user not found, too many requests) MUST be surfaced to the user with a human-readable message.
- **FR-013**: The admin portal is web-only; no mobile sign-in flow is required.

### Key Entities

- **AdminUser**: Represents an authenticated admin. Key attributes: `uid`, `email`, `admin_role` (from ID token claim). Never persisted client-side beyond the Firebase Auth SDK's internal session.
- **AdminRole**: One of `support_agent`, `admin`, `clinical_ops`. Determines which routes are visible.
- **IdToken**: Short-lived Firebase JWT. Obtained from the Firebase Auth SDK and attached to every API request as a Bearer token. The SDK handles refresh automatically.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin user can complete sign-in in under 10 seconds on a standard broadband connection.
- **SC-002**: Unauthenticated access to any protected route results in a redirect to sign-in within 200 ms of page load.
- **SC-003**: Role-based navigation is applied correctly for all three roles (support_agent, admin, clinical_ops) — verified by manual role claim testing.
- **SC-004**: Session persists across browser refresh without requiring re-authentication.
- **SC-005**: Sign-out completes and the user cannot navigate back to protected content via the browser back button.
- **SC-006**: Invalid credentials produce a user-readable error within 3 seconds of form submission.

## Assumptions

- Firebase project is already created and GCP Identity Platform is enabled (admin user accounts are provisioned outside this feature).
- Custom claim `admin_role` is set on admin user accounts by a backend process (Cloud Function or Firebase Admin SDK script) — this feature only reads the claim, it does not set it.
- The Firebase SDK is already installed in the project (`firebase` package in `package.json`).
- Firebase config values are provided via `VITE_FIREBASE_*` environment variables (not committed to source control).
- The existing `AdminApiClient` in `src/api/client.ts` will be wired to use `getIdToken()` from the Firebase Auth SDK — no interface changes needed.
- Session persistence uses Firebase's default (`LOCAL` persistence) which stores session in IndexedDB managed by the SDK.
- No password reset or account management UI is needed in this feature — admins use the Firebase Console or a backend script.
