# Implementation Plan: Admin Dynamic Form API Layer

## Summary

Add the admin portal TypeScript types and React Query hooks needed by the dynamic intake form builder screen.

## Technical Context

- Backend endpoints are available under `/admin/forms`.
- This slice does not add SurveyJS or UI dependencies.
- Hooks follow the existing `useAdminApi()` and React Query conventions.

## Constitution Check

- Admin type definitions match the backend canonical form schema.
- Mutating hooks invalidate list/detail/version queries so the UI cannot show stale published state.
- The existing unrelated Firebase hosting cache change is left untouched.
