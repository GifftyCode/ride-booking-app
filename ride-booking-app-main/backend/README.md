# Backend

REST API + WebSocket server. Owns auth, database, matching engine, ride state machine, and real-time broadcasting.

## Stack

Node.js + Express + MongoDB (Mongoose) + Socket.io + JWT auth.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

Server runs on `http://localhost:5000` by default. Health check: `GET /health`.

## Shared foundation — already built, do not duplicate

- `src/models/User.js`, `Ride.js`, `Rating.js` — the single schema everyone reads/writes
- `src/services/rideStateMachine.js` — enforces valid ride status transitions
- `src/services/authService.js` + `src/middleware/auth.middleware.js` — shared JWT auth for all roles
- `src/sockets/index.js` — real-time status + location broadcasting (`ride:<id>` rooms)
- `src/routes/auth.routes.js` — signup/login/me, already working for all three roles

## Where to add your part

- **Rider owner:** extend `src/routes/ride.routes.js` (create/cancel/history), add ratings routes
- **Driver owner:** extend `src/routes/ride.routes.js` (accept/status), wire location updates via `src/sockets/index.js`
- **Admin owner:** extend `src/routes/admin.routes.js` — already has users/rides/analytics/verify stubs

See `docs/architecture.md` for the full ownership table and `docs/api-spec.md` for the endpoint contract.

## Folder Guide

- `src/controllers/` — request handlers
- `src/models/` — DB models/schemas
- `src/routes/` — route definitions
- `src/services/` — matching engine, pricing engine, notifications
- `src/sockets/` — WebSocket event handlers (location, status)
- `src/config/` — env vars, DB connection, constants
