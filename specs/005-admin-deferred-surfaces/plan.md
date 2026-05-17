# Implementation Plan: Admin Deferred Surfaces

## Summary

Define how the admin portal should present dashboard, refill queue, subscription, and refill-review controls while their backend endpoints are not yet implemented.

## Technical Context

- Admin repo is specification-only.
- Backend OpenAPI does not currently expose dashboard, refill list, subscription list, or trigger-refill-review admin routes.
- Existing implemented routes cover patient search/detail, audit logs, workflow commands, and notification resend.

## Constitution Check

- UI must not call routes that are absent from backend OpenAPI.
- Deferred surfaces must not imply unavailable operations are live.
- Future clinical or billing operations must remain backend-mediated and auditable.
