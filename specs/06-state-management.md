# State Management

## Types

### Server State
- Patient data
- Refill data

### UI State
- Filters
- Search input

---

## Rules

- Server is source of truth
- Do not cache sensitive data unnecessarily
- Do not persist PHI-bearing server state in local browser storage
- Clear all server-state cache on sign-out
