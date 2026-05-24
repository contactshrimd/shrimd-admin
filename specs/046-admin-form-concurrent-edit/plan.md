# Implementation Plan: Admin Form Concurrent Edit Handling

## Summary

Handle backend `CONCURRENT_EDIT` publish errors with a specific warning and reload action in the form builder.

## Technical Context

- Backend returns `ApiClientError.code === 'CONCURRENT_EDIT'` when `expectedUpdatedAt` is stale.
- UI refetches form detail, form list, and version history when the admin clicks Reload.
- Generic publish errors continue to show the backend message.

## Constitution Check

- Stale publishes never silently overwrite another admin's changes.
- Reload action uses existing query refetches and does not mutate form state directly.
