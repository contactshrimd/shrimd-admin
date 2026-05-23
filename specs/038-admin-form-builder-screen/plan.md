# Implementation Plan: Admin Form Builder Screen

## Summary

Add the admin portal screen for editing canonical dynamic intake form drafts, publishing forms, and viewing version history.

## Technical Context

- Uses the custom canonical schema builder instead of SurveyJS because package/license approval is not recorded.
- Uses the dynamic form API hooks from `037-admin-dynamic-form-api`.
- UI is route-based within the existing single-page admin shell.

## Constitution Check

- Clinical ops can view form state but backend still enforces read-only access.
- Publish prompts for clinical review when contraindication rules changed.
- Draft JSON preview is local-only and does not expose patient PHI.
