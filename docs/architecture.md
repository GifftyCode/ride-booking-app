# System Architecture

## Components

- **Backend API** — REST endpoints for auth, users, rides, ratings, payments
- **WebSocket layer** — real-time ride status + live location broadcasting
- **Database** — MongoDB (users, drivers, rides, ratings)
- **Rider App** — requests rides, tracks driver, rates trip
- **Driver App** — accepts rides, updates status, broadcasts location
- **Admin Dashboard** — monitors rides, manages users/drivers, analytics
- **Matching & Pricing Engine** — finds nearest available driver, calculates fare estimates
- **Notifications & Ratings Service** — status-change notifications, post-trip rating/review flow
- **Maps/Geolocation API** — routing, ETA, distance calculation (e.g. Google Maps / Mapbox)

## Ride State Machine

```
requested -> accepted -> driver_arriving -> in_progress -> completed
                 \-> cancelled (can occur before in_progress)
```

The backend is the single source of truth for this state. Both apps read and react to it; they never talk to each other directly.

## Core Flow

1. Rider submits a ride request (pickup + drop-off).
2. Matching engine (backend) finds nearest available driver, sends alert to Driver app.
3. Driver accepts -> state moves to `accepted`, Rider app notified.
4. Both apps subscribe to the ride's WebSocket channel for live location + status.
5. Driver updates status through the trip (`driver_arriving` -> `in_progress` -> `completed`).
6. On `completed`, payment is processed and both sides are prompted to rate each other.

## Stack (decided)

- Backend: Node.js + Express
- DB: MongoDB (Mongoose)
- Real-time: Socket.io
- Auth: JWT, shared across rider/driver/admin
- Maps provider: TBD by frontend owners (Google Maps API or Mapbox)

## Ownership Model — 5 People, Full Feature Ownership

There is **one shared backend and one database** (`backend/`). Shared foundation was built and
pushed by the repo owner already — nobody else touches it unless flagged first. Everyone else
owns a complete feature: frontend (where relevant) AND its backend logic.

**Shared foundation (already built — do not duplicate, ping repo owner before changing):**
- `backend/src/models/` — User, Ride, Rating (single source of truth)
- `backend/src/services/rideStateMachine.js` — the only place ride status changes are allowed to happen
- `backend/src/services/authService.js` + `backend/src/middleware/auth.middleware.js` — one auth system for all roles
- `backend/src/sockets/index.js` — real-time status + location broadcasting
- `backend/src/routes/auth.routes.js` — signup/login/me

**Feature ownership:**

| Person | Feature | Frontend | Backend |
|---|---|---|---|
| You + Teammate 1 | Rider + Driver apps | `rider-app/`, `driver-app/` | Rider/driver sections of `backend/src/routes/ride.routes.js`, location events in `backend/src/sockets/index.js` |
| Teammate 2 | Admin Dashboard | `admin-dashboard/` | `backend/src/routes/admin.routes.js` |
| Teammate 3 | Matching & Pricing Engine | none needed — pure service, consumed by rider/driver/admin | New: `backend/src/services/matchingEngine.js`, `backend/src/services/pricingEngine.js` |
| Teammate 4 | Notifications & Ratings/Reviews | Small shared notification-center component + rating submission UI (used inside rider/driver apps) | New: `backend/src/services/notificationService.js`, `backend/src/routes/rating.routes.js` (Rating model already exists) |

**Why this split works:** Matching & Pricing and Notifications & Ratings are self-contained
services that plug into the ride flow at specific points (ride creation, status changes,
completion) without needing to touch the rider/driver UI code directly — they expose a function
or endpoint that the rider/driver owners call. Each of the 3 remaining teammates gets something
they can build, test, and demo independently, without waiting on anyone else's screens to exist
first.

If anyone needs to touch `ride.routes.js` (shared by rider/driver) or a file another feature
depends on, say so in the group chat first.
