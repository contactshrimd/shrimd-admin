# Implementation Plan: Admin Form Visibility Rules

## Summary

Add visibility-rule editing controls to the custom admin form builder.

## Technical Context

- Rules can reference only prior questions in the current draft order.
- Each question supports up to three visibility rules.
- Rule editor supports `is`, `is_not`, and `contains` operators plus AND/OR logic.

## Constitution Check

- UI constraints mirror backend validation.
- Existing draft save/publish APIs remain the source of truth.
- No new dependencies are introduced.
