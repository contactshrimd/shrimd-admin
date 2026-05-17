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
- `POST /admin/action/resend-notification`

## Future Backend Endpoints

These routes are product/spec targets, but the admin UI must not call them until they are added to the backend OpenAPI contract:

- `GET /admin/dashboard`
- `GET /admin/refills`
- `GET /admin/subscriptions`
- `POST /admin/action/trigger-refill-review`

---

## Auth

- Firebase Auth required
- Role validated via backend
- All requests must include a Firebase ID token bearer header
