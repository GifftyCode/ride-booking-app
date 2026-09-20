# Admin Dashboard

Full ownership: monitoring, user/driver management, and analytics. This is a complete feature —
frontend screens here, backend routes in `backend/src/routes/admin.routes.js` (already stubbed).

## Setup

_To be filled in once the client stack is chosen (React/Next.js is a natural fit for an admin panel)._

## Key Screens

- Login (reuses shared auth, admin role only)
- Live rides monitor (all active rides, current status)
- Users & drivers list (search, filter, view profile)
- Driver document verification queue (approve/reject)
- Analytics (rides/day, cancellation rate, active drivers, revenue if payments are mocked)

## Backend you own

- `backend/src/routes/admin.routes.js` — extend the existing stubs (`/rides`, `/users`, `/drivers/:id/verify`, `/analytics`)
- Add any new admin-only endpoints you need here, following the same pattern
