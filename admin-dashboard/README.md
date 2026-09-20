# Admin Dashboard

Split into three independently-owned sections. Each person builds their screen(s) here **and**
their matching backend routes — full ownership of their slice, same as Rider/Driver.

| Section | Owner | Frontend folder | Backend file |
|---|---|---|---|
| Customer (Rider) Management | Oluwakemi | `src/customers/` | `backend/src/routes/admin/customers.routes.js` |
| Driver Management & Verification | Gideon | `src/drivers/` | `backend/src/routes/admin/drivers.routes.js` |
| Rides Monitoring & Analytics | Richard | `src/rides-analytics/` | `backend/src/routes/admin/rides-analytics.routes.js` |

All three share the same login screen (shared auth, admin role) and the same dashboard shell/nav —
agree on that shell together first so the three sections plug into one consistent app instead of
three disconnected pages.

## Setup

_To be filled in once the client stack is chosen (React/Next.js is a natural fit for an admin panel)._

## Customer Management (Oluwakemi)

- List/search riders (`GET /api/admin/customers`)
- View a rider's profile + ride history (`GET /api/admin/customers/:id`)
- Suspend/reinstate a rider account (`PATCH /api/admin/customers/:id/suspend`)

## Driver Management & Verification (Gideon)

- List/filter drivers by verified/online status (`GET /api/admin/drivers`)
- Document verification queue (`GET /api/admin/drivers/pending-verification`)
- Approve a driver (`PATCH /api/admin/drivers/:id/verify`)
- View driver profile + trip history (`GET /api/admin/drivers/:id`)
- Suspend/reinstate a driver account (`PATCH /api/admin/drivers/:id/suspend`)

## Rides Monitoring & Analytics (Richard)

- Live/all rides table with status filter (`GET /api/admin/rides`)
- Currently active rides view (`GET /api/admin/rides/active`)
- Dashboard analytics — totals, completion/cancellation rate, active drivers (`GET /api/admin/analytics`)
