# Admin Audit Logging

## Requirements

Log every admin action:

- adminId
- patientId
- action
- timestamp
- result
- correlationId

---

## Examples

- "Viewed patient record"
- "Triggered refill review"
- "Resent notification"
- "Listed audit logs"
- "Viewed workflow commands"

---

## Rules

- Logs must be immutable
- Logs must be queryable
- UI actions must rely on backend audit logging; the admin portal must not write audit records directly
- Audit log list/export must be role-restricted through backend APIs
