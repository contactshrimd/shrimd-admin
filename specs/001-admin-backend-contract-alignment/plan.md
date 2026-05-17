# Implementation Plan: Admin Backend Contract Alignment

## Summary

Align the admin portal specs with the backend admin API contract so future implementation targets the routes that actually exist in `shrimd-backend`.

## Technical Context

- Admin portal repo is currently specification-only.
- Backend APIs are the only allowed data boundary.
- Admin patient search/detail routes use plural `/admin/patients/...` paths in the backend/app contract.

## Constitution Check

- Admin UI must not access Firestore directly.
- Admin actions must be auditable and backend-mediated.
- Specs must not imply unsupported payment, clinical, or workflow mutations.
