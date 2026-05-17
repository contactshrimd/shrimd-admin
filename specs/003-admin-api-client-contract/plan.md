# Implementation Plan: Admin API Client Contract

## Summary

Define the frontend API-client contract for the admin portal so future implementation can consume `shrimd-backend` consistently without direct Firestore access or local PHI persistence.

## Technical Context

- Admin repo is currently specification-only.
- Backend returns success/error envelopes for all JSON endpoints.
- Admin auth uses Firebase ID tokens with backend role validation.
- Backend role scoping may omit fields from patient/admin responses.

## Constitution Check

- All admin data access must go through backend HTTPS APIs.
- API client must attach a Firebase ID token bearer header.
- Client-side persistence must not store PHI.
