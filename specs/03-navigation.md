# Navigation

## Main Routes

- Dashboard
- Patient Search
- Patient Detail
- Audit Logs
- Workflow Commands
- Refill Queue
- Subscriptions

---

## Flow

Login → Dashboard → Search → Patient Detail

Operations users can also navigate to Audit Logs and Workflow Commands when their role allows it.

---

## Access Control

Routes must be restricted by role.

Use `specs/10-rbac-route-matrix.md` for route visibility.

The UI must hide routes unavailable to the current role and still render an access-denied state if backend returns `403`.
