# Data Model: Admin Firebase Auth

No new persistent data entities. All session state is managed by the Firebase Auth SDK internally.

## In-Memory Context Shape

```typescript
type AuthState = {
  user: import('firebase/auth').User | null;
  role: AdminRole | null;    // from ID token custom claim `admin_role`
  loading: boolean;          // true until onIdTokenChanged fires once
};
```

- `user`: Firebase User object. `null` = unauthenticated.
- `role`: One of `'support_agent' | 'admin' | 'clinical_ops'`. `null` if claim absent or user signed out.
- `loading`: Prevents premature redirect before Firebase resolves the persisted session on page load.

## State Transitions

```
Initial load
  → loading: true, user: null, role: null
  → onIdTokenChanged fires
    → No persisted session: loading: false, user: null, role: null → redirect to /sign-in
    → Persisted session found: loading: false, user: <User>, role: <AdminRole>

Sign-in (signInWithEmailAndPassword)
  → loading: false, user: <User>, role: <AdminRole> → redirect to /

Sign-out (signOut)
  → loading: false, user: null, role: null → redirect to /sign-in

Token refresh (auto, every ~60 min)
  → onIdTokenChanged fires again
  → role re-read from new token claims (picks up any claim updates)
```

## Validation Rules

- `admin_role` claim must be one of: `support_agent`, `admin`, `clinical_ops`.
- If claim is absent or has an unrecognized value → call `signOut()` + show access-denied error.
- Email must match RFC 5322 basic format (enforced by Firebase Auth + client-side `<input type="email">`).
- Password field: no client-side strength validation (admin accounts are provisioned externally).
