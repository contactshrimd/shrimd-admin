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
- Flag issue

---

## Rules

- Display minimum necessary data
- Mask sensitive fields where needed
- Mutating actions must call backend admin action endpoints and rely on backend audit logging
