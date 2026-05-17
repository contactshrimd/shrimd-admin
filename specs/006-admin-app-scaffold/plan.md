# Implementation Plan: Admin App Scaffold

## Summary

Create the initial React/Vite/TypeScript admin portal scaffold with route metadata that reflects the existing admin specs.

## Technical Context

- Framework: React with Vite and TypeScript.
- Server state: React Query.
- Auth/API implementation will be added in later slices.
- Initial UI uses static route metadata from the RBAC and deferred-surface specs.

## Constitution Check

- The scaffold must not access Firestore directly.
- The scaffold must not call future backend routes.
- Deferred surfaces must be visibly marked as deferred.
