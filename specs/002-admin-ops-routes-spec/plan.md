# Implementation Plan: Admin Operations Routes Spec

## Summary

Document the implemented admin operations routes from `shrimd-backend` so the future admin UI can include audit log and workflow command surfaces without inventing unsupported APIs.

## Technical Context

- Admin repo remains specification-only.
- Backend OpenAPI currently exposes admin patient search/detail, audit log list/export, workflow command list, and notification resend.
- Dashboard, refill queue, and subscription rollups remain future backend routes.

## Constitution Check

- Admin operations must use backend APIs only.
- Support agent visibility must stay least-privilege.
- Workflow command payloads must remain redacted in the UI.
