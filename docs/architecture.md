# System Architecture

## Components

- **Backend API** — REST endpoints for auth, users, rides, ratings, payments
- **WebSocket layer** — real-time ride status + live location broadcasting
- **Database** — PostgreSQL/MySQL (users, drivers, rides, ratings); Redis (optional) for live driver location cache
- **Rider App** — requests rides, tracks driver, rates trip
- **Driver App** — accepts rides, updates status, broadcasts location
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

## Open Decisions (fill in as a team)

- [ ] Backend stack: Node/Express vs Django vs Spring Boot
- [ ] Mobile stack: React Native vs Flutter vs native
- [ ] DB: PostgreSQL vs MySQL
- [ ] Maps provider: Google Maps API vs Mapbox
- [ ] Auth: JWT vs session-based
