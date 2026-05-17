# RBAC Route Matrix

## Purpose

Define admin portal route visibility by role.

The admin UI may use Firebase custom claims to hide unavailable routes, but the backend is always authoritative. A hidden route must still handle `403` responses gracefully if a user navigates to it directly.

---

## Roles

- `support_agent`
- `admin`
- `clinical_ops`

---

## Implemented Routes

| Route | Backend endpoint | Support Agent | Admin | Clinical Ops | Notes |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Future | Hidden | Visible placeholder | Visible placeholder | No backend dashboard route yet |
| Patient Search | `GET /admin/patients/search` | Visible | Visible | Visible | Results are role-scoped by backend |
| Patient Detail | `GET /admin/patients/{patientId}` | Visible | Visible | Visible | Optional fields may be omitted by role |
| Audit Logs | `GET /admin/audit-logs` | Hidden | Visible | Visible | Backend denies support agents |
| Audit Export | `GET /admin/audit-logs/export` | Hidden | Visible | Hidden | Backend allows admin only |
| Workflow Commands | `GET /admin/workflow-commands` | Hidden | Visible | Visible | Payloads are redacted to keys |
| Resend Notification | `POST /admin/actions/resend-notification` | Visible | Visible | Visible | Patient-scoped auditable command |

---

## Future Routes

These routes must stay hidden or disabled until the backend OpenAPI contract exposes them:

| Route | Future backend endpoint | Support Agent | Admin | Clinical Ops |
| --- | --- | --- | --- | --- |
| Refill Queue | `GET /admin/refills` | Hidden | Disabled | Disabled |
| Subscriptions | `GET /admin/subscriptions` | Hidden | Disabled | Hidden |
| Trigger Refill Review | `POST /admin/actions/trigger-refill-review` | Hidden | Disabled | Disabled |

---

## UI Behavior

- Hide navigation items that the role cannot use.
- Show access-denied pages for direct navigation to forbidden routes.
- Treat `403` as final for the current user role.
- Do not retry forbidden requests with alternate role assumptions.
- Clear all cached admin data on sign-out or role change.
