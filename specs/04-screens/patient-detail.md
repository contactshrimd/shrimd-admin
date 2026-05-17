# Patient Detail

## Purpose

View full patient context

---

## Sections

- Basic info
- Current state
- Intake summary
- Subscription status
- Refill history

---

## API

GET /admin/patients/{patientId}

---

## Actions

- Resend notification
- Trigger refill review (future backend endpoint)
- Flag issue (future backend endpoint)

---

## Rules

- Display minimum necessary data
- Mask sensitive fields where needed
- Mutating actions must call backend admin action endpoints and rely on backend audit logging
- Trigger refill review must be disabled until `POST /admin/actions/trigger-refill-review` exists in backend OpenAPI
- Flag issue must be hidden or disabled until a backend action endpoint exists
