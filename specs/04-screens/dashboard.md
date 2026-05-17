# Dashboard

## Purpose

Provide system overview

---

## Metrics

- Active patients
- Pending refills
- Failed payments
- Provider reviews pending

---

## Data Source

Future backend endpoint: `GET /admin/dashboard`

---

## Behavior

- Read-only
- No PHI exposed
- Must not call this route until it exists in the backend OpenAPI contract
