# Ride Booking App

Capstone project — a ride booking platform where users request rides, drivers accept trips, and both sides track ride status in real time.

## Team

| Name | Role | Focus |
|---|---|---|
| Person A | Backend & Database Lead | API, DB schema, real-time state/location |
| Person B | Rider App | Rider-facing UI & flows |
| Person C | Driver App | Driver-facing UI & flows |

## Repository Structure

```
ride-booking-app/
├── backend/          # REST API + WebSocket server (shared by both apps)
│   └── src/
│       ├── controllers/   # request handlers
│       ├── models/        # DB models/schemas
│       ├── routes/        # API route definitions
│       ├── services/      # matching engine, pricing, notifications
│       ├── sockets/       # real-time location/status broadcasting
│       └── config/        # env, DB connection, constants
├── rider-app/        # Rider-facing client app
├── driver-app/       # Driver-facing client app
├── docs/             # architecture notes, API spec, ER diagram, meeting notes
└── .github/          # issue templates, CI workflows
```

## Getting Started

Each subfolder (`backend/`, `rider-app/`, `driver-app/`) has its own README with setup instructions once the stack is chosen.

## Branching Convention

- `main` — always deployable/demo-ready
- `dev` — integration branch
- `feature/<short-description>` — individual feature branches, opened as PRs into `dev`

## Docs

- [`docs/architecture.md`](docs/architecture.md) — system design & data flow
- [`docs/api-spec.md`](docs/api-spec.md) — API contract between backend and both apps
