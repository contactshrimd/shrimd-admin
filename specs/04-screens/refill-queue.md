# Refill Queue

## Purpose

Monitor refill pipeline

---

## Data

- Patients in REFILL_DUE
- Patients in REFILL_REQUESTED
- Pending approvals

---

## API

Future backend endpoint: `GET /admin/refills`

---

## Actions

- Trigger manual review (deferred until backend route exists)

---

## Rules

- No direct approval from UI unless allowed
- Must not call this route until it exists in the backend OpenAPI contract
- Navigation should be hidden or disabled until the backend route exists
- See `specs/11-deferred-surfaces.md`
