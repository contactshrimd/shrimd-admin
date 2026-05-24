# Implementation Plan: Admin Form Migration Action

## Summary

Expose the backend dynamic form seed migration from the admin form builder screen.

## Technical Context

- Calls `POST /admin/forms/migrate`.
- Backend requires admin auth and `FORM_CONFIG_MIGRATION_ENABLED=true`.
- Button is shown only when loaded form summaries have no published versions.

## Constitution Check

- Admin UI does not bypass backend migration gating.
- Query cache invalidates form list after migration.
- Existing form editing flow remains unchanged.
