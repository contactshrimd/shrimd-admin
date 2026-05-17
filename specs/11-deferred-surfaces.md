# Deferred Surfaces

## Purpose

Identify admin portal surfaces that are product targets but are not backed by implemented backend routes yet.

These surfaces must not call backend APIs until the routes appear in the backend OpenAPI contract.

---

## Deferred Screens

| Surface | Missing backend route | Allowed UI behavior |
| --- | --- | --- |
| Dashboard metrics | `GET /admin/dashboard` | Show a read-only "not available yet" state for admin and clinical ops |
| Refill Queue | `GET /admin/refills` | Hide navigation or show disabled/deferred state |
| Subscriptions | `GET /admin/subscriptions` | Hide navigation or show disabled/deferred state |

---

## Deferred Actions

| Action | Missing backend route | Allowed UI behavior |
| --- | --- | --- |
| Trigger refill review | `POST /admin/actions/trigger-refill-review` | Disabled control with no network call |
| Retry payment | Payment retry route not defined | Do not render as an active action |

---

## Rules

- Do not create client-only mock success flows for deferred live admin actions.
- Do not call future routes optimistically.
- Do not show disabled actions to support agents unless they are needed for training/documentation mode.
- Deferred copy must explain that the workflow is pending backend support, not that the user lacks permission.
- When a route is added to backend OpenAPI, update `specs/05-api-usage.md`, `specs/10-rbac-route-matrix.md`, and the relevant screen spec in the same slice.
