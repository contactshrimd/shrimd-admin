# ShriMD Admin Portal Constitution

## Core Principles

### I. Backend Authority (NON-NEGOTIABLE)

The admin portal is NOT a source of truth.

The backend exclusively owns:
- Patient state
- Eligibility decisions
- Refill decisions
- Subscription status
- Prescription workflow

The admin portal must NEVER:
- Modify state directly
- Perform business logic
- Bypass backend APIs

All actions must be executed through backend endpoints.

---

### II. API-Only Access (NON-NEGOTIABLE)

The admin portal interacts with system data exclusively via backend APIs.

Rules:
- No direct Firestore access
- No Firebase Admin SDK usage
- No client-side database queries
- All requests go through authenticated backend endpoints

---

### III. Role-Based Access Control (RBAC) (NON-NEGOTIABLE)

All access must be controlled by roles.

Supported roles:
- Support Agent
- Admin
- Clinical Ops

Rules:
- Permissions enforced by backend
- Admin UI must not assume permissions
- All requests must include authenticated user context
- Firebase Auth custom claims must be used for role identification

---

### IV. Minimum Necessary Access (HIPAA) (NON-NEGOTIABLE)

The admin portal must follow HIPAA’s “minimum necessary” principle.

Rules:
- Only display data required for the task
- Avoid exposing full PHI unless necessary
- Mask sensitive fields where possible
- Do not expose:
  - full medical history unnecessarily
  - full identifiers unless required

---

### V. Audit Logging (NON-NEGOTIABLE)

Every admin action must be logged.

Must log:
- adminId
- patientId (if applicable)
- action performed
- timestamp
- result (success/failure)

Examples:
- Viewed patient record
- Triggered refill review
- Resent notification

Logs must be:
- Immutable
- Stored securely
- Accessible for audit

---

### VI. Read-Heavy, Action-Light Design

The admin portal is primarily a read interface.

Rules:
- Default behavior is read-only
- Actions must be:
  - intentional
  - limited
  - validated by backend

No bulk or destructive operations without explicit approval.

---

### VII. No Direct Data Mutation (NON-NEGOTIABLE)

The admin portal must never directly modify data.

Rules:
- No direct edits to patient records
- No manual state changes
- No bypass of workflows

All mutations must:
- Go through backend services
- Follow validation rules
- Trigger proper state transitions

---

### VIII. Secure Data Handling

The admin portal must treat all data as sensitive.

Rules:
- No PHI stored in localStorage/sessionStorage
- No PHI in URLs or query params
- No PHI in analytics tools
- No console logging of sensitive data

All communication must use HTTPS.

---

### IX. Frontend Simplicity

The admin portal must remain a thin client.

Rules:
- No business logic in frontend
- No eligibility or refill decisions
- No derived system state

The UI reflects backend responses only.

---

### X. Error Handling & Safety

Errors must be handled safely and clearly.

Rules:
- Do not expose internal system errors
- Show generic user-safe messages
- Log full error details in backend only

---

### XI. Integration Isolation

The admin portal must never call third-party systems directly.

Includes:
- OpenLoop
- Stripe
- Pharmacy APIs

All integrations must go through backend APIs.

---

## Technical Constraints

### Platform

- React (web)
- TypeScript (strict mode)
- Hosted on Vercel

---

### Authentication

- Firebase Auth required
- All requests include ID token
- Backend validates all tokens and roles

---

### API Usage

- All requests must go through backend
- Use centralized API client
- Never call database or third-party APIs directly

---

### State Management

- Server state via API responses
- UI state only for presentation (filters, inputs)
- Do not persist sensitive data locally

---

## Development Workflow

### New Feature

1. Define behavior in `shrimd-spec`
2. Confirm backend API exists
3. Implement UI
4. Validate role-based access
5. Ensure audit logging is triggered

---

### Bug Fix

- Identify if issue is UI or backend
- Do not patch logic in frontend
- Fix at backend if logic-related

---

## Governance

This constitution governs all admin portal development.

Any deviation must:
- Be justified in PR
- Be reviewed for compliance impact
- Not violate HIPAA or RBAC rules

---

## Guiding Philosophy

The admin portal is:

- A controlled window into the system
- A tool for safe operational support
- A compliance-sensitive interface

It is NOT:
- A database editor
- A decision engine
- A shortcut around system workflows

Every feature must prioritize:
- security
- auditability
- minimal exposure of PHI