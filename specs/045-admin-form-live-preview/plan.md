# Implementation Plan: Admin Form Live Preview

## Summary

Add a live preview panel to the admin form builder so admins can simulate answer paths before saving or publishing.

## Technical Context

- Preview uses the current local draft questions.
- Visibility rules are evaluated with the same AND/OR and operator semantics as the patient renderer.
- Contraindication answers show a local block panel without calling backend APIs.

## Constitution Check

- Preview is local-only and does not persist PHI.
- Backend validation remains the authority on save/publish.
- No new dependencies are introduced.
