# API Usage

## Principles

- All data via backend
- No direct DB access
- Role-based endpoints

---

## Implemented Backend Endpoints

These routes are the current admin routes exposed by `shrimd-backend` and should be treated as the implementation contract:

- `GET /admin/patients/search`
- `GET /admin/patients/{patientId}`
- `GET /admin/audit-logs`
- `GET /admin/audit-logs/export`
- `GET /admin/workflow-commands`
- `POST /admin/actions/resend-notification`

## Future Backend Endpoints

These routes are product/spec targets, but the admin UI must not call them until they are added to the backend OpenAPI contract:

- `GET /admin/dashboard`
- `GET /admin/refills`
- `GET /admin/subscriptions`
- `POST /admin/actions/trigger-refill-review`

Deferred surface behavior is defined in `specs/11-deferred-surfaces.md`.

---

## Auth

- Firebase Auth required
- Role validated via backend
- All requests must include a Firebase ID token bearer header
- Frontend API client conventions are defined in `specs/09-api-client-contract.md`
