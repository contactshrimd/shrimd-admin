# Implementation Plan: Admin Form Version History

## Summary

Wire the admin form builder version history to the backend version-detail endpoint and show archived question snapshots read-only.

## Technical Context

- Uses `GET /admin/forms/:conditionId/versions/:version`.
- Keeps the existing version summary list, adding expand/collapse per version.
- Snapshot display is read-only and has no restore action.

## Constitution Check

- Version history cannot mutate draft or published form state.
- Admin and clinical ops access continues to be enforced by backend.
- No new dependencies are introduced.
