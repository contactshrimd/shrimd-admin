# Implementation Plan: Admin RBAC Route Matrix

## Summary

Centralize role-to-route visibility rules for the admin portal so future implementation can present least-privilege navigation while treating backend RBAC as authoritative.

## Technical Context

- Firebase custom claims can be used for UI route visibility.
- Backend role validation remains the source of truth for access decisions.
- Admin route specs already identify implemented backend endpoints and future endpoints.

## Constitution Check

- UI must follow minimum necessary access.
- UI must not use hidden routes as the only security boundary.
- Support agents must not see operational audit or workflow queues.
