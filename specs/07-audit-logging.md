# Admin Audit Logging

## Requirements

Log every admin action:

- adminId
- patientId
- action
- timestamp

---

## Examples

- "Viewed patient record"
- "Triggered refill review"
- "Resent notification"

---

## Rules

- Logs must be immutable
- Logs must be queryable
- UI actions must rely on backend audit logging; the admin portal must not write audit records directly
