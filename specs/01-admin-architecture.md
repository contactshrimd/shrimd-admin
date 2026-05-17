# Admin Architecture

## Flow

Admin UI → Backend Admin APIs → Firestore

---

## Principles

1. Backend is the gatekeeper
2. Admin UI is read-heavy, action-light
3. All actions must be auditable

---

## Responsibilities

Admin Portal:
- Display system data
- Trigger safe actions
- Use only backend routes that exist in the backend OpenAPI contract

Backend:
- Validate permissions
- Execute actions
- Log activity
