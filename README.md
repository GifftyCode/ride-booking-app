# Ride Booking App

Capstone project — a ride booking platform where users request rides, drivers accept trips, and both sides track ride status in real time.

## Team

| Name | Feature | Focus |
|---|---|---|
| You | Rider + Driver apps (with Teammate 1) | Full stack — both apps, shared foundation |
| Teammate 1 | Rider + Driver apps (with You) | Full stack — both apps |
| Teammate 2 | Admin Dashboard | Full stack — monitoring, user/driver management, analytics |
| Teammate 3 | Matching & Pricing Engine | Backend service — driver matching, fare estimation |
| Teammate 4 | Notifications & Ratings/Reviews | Backend service + small shared UI components |

Shared foundation (auth, DB models, ride state machine, real-time layer) is already built and
pushed — see `docs/architecture.md` for what's there and who owns what going forward.

## Repository Structure

```
ride-booking-app/
├── backend/          # REST API + WebSocket server (shared foundation + everyone's feature routes)
│   └── src/
│       ├── controllers/
│       ├── models/        # User, Ride, Rating — shared, don't duplicate
│       ├── routes/        # auth (done), ride, admin, + new: rating.routes.js
│       ├── services/      # rideStateMachine, authService (done) + new: matchingEngine, pricingEngine, notificationService
│       ├── sockets/        # real-time location/status broadcasting (done)
│       └── config/
├── rider-app/          # Rider-facing client app
├── driver-app/         # Driver-facing client app
├── admin-dashboard/     # Admin-facing client app
├── docs/               # architecture notes, API spec, ER diagram, meeting notes
└── .github/            # issue templates, CI workflows
```

## Getting Started

Each subfolder has its own README with setup instructions. Backend is already runnable — see `backend/README.md`.

## Branching Convention

- `main` — always deployable/demo-ready. Direct pushes are blocked; only merges via reviewed PRs get in.
- `feature/<short-description>` — everyone branches off `main`, works, opens a PR back into `main`
- Only the repo owner can actually merge a PR (branch protection — see below); everyone else needs their PR reviewed and merged by them
- No one merges their own PR without at least one review
- Merge to `main` only once it's confirmed to run locally

## Docs

- [`docs/architecture.md`](docs/architecture.md) — system design & data flow
- [`docs/api-spec.md`](docs/api-spec.md) — API contract between backend and both apps
