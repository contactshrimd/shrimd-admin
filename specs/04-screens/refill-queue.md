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

- Trigger manual review

---

## Rules

- No direct approval from UI unless allowed
- Must not call this route until it exists in the backend OpenAPI contract
