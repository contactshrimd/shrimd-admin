# Subscriptions

## Purpose

Monitor billing status

---

## Data

- Active subscriptions
- Failed payments
- Expired plans

---

## API

Future backend endpoint: `GET /admin/subscriptions`

---

## Actions

- Retry payment (future only; no active control)
- Must not call this route until it exists in the backend OpenAPI contract
- Navigation should be hidden or disabled until the backend route exists
- Payment retry must not render as an active action until a backend route exists
- See `specs/11-deferred-surfaces.md`
