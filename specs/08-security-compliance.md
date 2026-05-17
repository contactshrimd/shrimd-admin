# Security and Compliance

## HIPAA Principles

- Minimum necessary access
- Role-based visibility
- Secure transmission (HTTPS)

---

## Restrictions

- No PHI in local storage
- No PHI in analytics tools
- No direct DB access
- No audit exports in browser local storage

---

## Access Control

- Firebase Auth + custom claims
- Backend validation required
- UI route hiding must not be treated as a security boundary

---

## UI Rules

- Mask sensitive data when possible
- Avoid exposing full records unnecessarily
- Treat missing optional API fields as role-scoped unavailable data
