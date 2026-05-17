# Audit Logs

## Purpose

Review backend-recorded admin activity for compliance and support investigations.

---

## Data

- Actor role
- Action
- Result
- Patient filter when present
- Timestamp
- Correlation ID

---

## API

- `GET /admin/audit-logs`
- `GET /admin/audit-logs/export`

---

## Access

- `admin` and `clinical_ops` can list audit logs.
- Only `admin` can export audit logs.
- `support_agent` must not access audit logs.

---

## Rules

- The admin portal must not write audit records directly.
- Patient filters should use backend query parameters.
- Export must be treated as a privileged admin action.
