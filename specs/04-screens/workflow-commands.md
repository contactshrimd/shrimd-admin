# Workflow Commands

## Purpose

Monitor backend integration work such as queued, processing, succeeded, or failed workflow commands.

---

## Data

- Command ID
- Type
- Status
- Patient ID when permitted
- Attempt count
- Last error summary
- Created and updated timestamps
- Payload keys only

---

## API

`GET /admin/workflow-commands`

Optional filters:

- `status`
- `patientId`
- `type`

---

## Access

- `admin` and `clinical_ops` can view workflow command summaries.
- `support_agent` must not browse workflow commands.

---

## Rules

- Raw command payloads must never be displayed.
- UI must display only redacted summaries returned by the backend.
- This screen is inspection-only unless a future backend retry command is added.
