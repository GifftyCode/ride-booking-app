# Ride Booking App

Capstone project — a ride booking platform where users request rides, drivers accept trips, and both sides track ride status in real time.

## Team & Feature Ownership

| Name | Feature | Scope |
|---|---|---|
| **Ngozi** | Driver App | Full stack — driver-facing UI, driver backend routes, **and** the matching engine (finds nearest driver, alerts them) |
| **Enoch** | Rider App | Full stack — rider-facing UI, rider backend routes, **and** the pricing engine, notifications, and ratings/reviews system |
| **Oluwakemi** | Admin — Customer Management | Full stack — view/search/suspend riders, view a rider's ride history |
| **Gideon** | Admin — Driver Management & Verification | Full stack — view/filter drivers, verification queue, approve/suspend drivers |
| **Richard** | Admin — Rides Monitoring & Analytics | Full stack — live rides monitor, ride status log, analytics dashboard |

The shared foundation (auth, database models, the ride status logic, and real-time updates) is already built and pushed to the repo. Nobody touches those files without flagging it in the group chat first — they affect everyone's work.

---

## Feature Breakdown by Side

Here's a complete breakdown by side, with the connections between them made explicit.

### Rider-Side Features (Enoch)

| Feature | Description | Connects To |
|---|---|---|
| Sign up / Login | Phone/email + OTP or password auth | Auth service (shared) |
| Profile management | Name, photo, saved addresses, payment method | User DB (shared) |
| Ride request | Set pickup + drop-off, choose ride type | Matching engine (Ngozi) |
| Fare & ETA estimate | Shown before confirming request | Pricing engine (Enoch) + Maps API |
| Driver matching wait screen | Shows "finding driver" state | Matching engine → notifies Driver app |
| Live driver tracking | See driver's live location moving toward pickup | Location service (shared, real-time) |
| Ride status updates | Accepted / arriving / started / completed | Status engine (shared) — same state machine Driver updates |
| In-app chat/call (optional) | Contact driver directly | Messaging service (stretch goal) |
| Cancel ride | Before or shortly after acceptance | Status engine → notifies Driver |
| Payment | Charge on completion | Payment gateway (stretch goal) |
| Rate & review driver | After trip ends | Ratings system (Enoch) → affects Driver profile |
| Ride history | Past trips, receipts | User DB (shared) |

### Driver-Side Features (Ngozi)

| Feature | Description | Connects To |
|---|---|---|
| Sign up / Login + verification | ID, license, vehicle docs | Auth service + Admin approval (Gideon) |
| Profile & vehicle info | Car details, plate number, documents | User DB (shared) |
| Online/Offline toggle | Controls visibility to matching engine | Matching engine (Ngozi) |
| Incoming ride request alert | Accept/reject within time window | Matching engine → pushed from Rider request |
| Navigation to pickup/drop-off | Turn-by-turn directions | Maps API |
| Update trip status | Arrived, started, completed | Status engine — same one Rider sees update live |
| Live location broadcast | Sent continuously while on trip | Location service → streamed to Rider app |
| Earnings dashboard | Per trip, daily, weekly totals | Payment/earnings DB (stretch goal) |
| Trip history | Completed rides log | User DB (shared) |
| Rate rider | After trip ends | Ratings system (Enoch) → affects Rider profile |
| Cancel/reject ride | With reason | Status engine → notifies Rider |

### Shared Backend Features (already built — do not duplicate)

| Feature | Description | Used By |
|---|---|---|
| Authentication service | Issues tokens, manages sessions | Everyone |
| User & Driver database | Stores all profile/account data | Everyone |
| Ride state machine | Single source of truth for ride status | Everyone reads/writes to this |
| Real-time location service | WebSocket broadcasting live GPS | Rider ↔ Driver |
| Maps/Geolocation API integration | Routing, distance, ETA calculation | Rider app, Driver app, Matching engine |

### Rider/Driver Backend Services (new — being built)

| Feature | Owner | Description |
|---|---|---|
| Matching engine | Ngozi | Finds nearest available driver, sends request to Driver app |
| Pricing engine | Enoch | Calculates fare estimate & final fare |
| Notification service | Enoch | Push/in-app notifications triggered by every ride status change |
| Ratings & reviews system | Enoch | Stores and aggregates ratings; feeds both Rider and Driver profiles |

### Admin Dashboard — Split by Section

| Section | Owner | Description |
|---|---|---|
| Customer Management | Oluwakemi | View/search riders, suspend accounts, view ride history per rider |
| Driver Management & Verification | Gideon | View/filter drivers, verification queue, approve/suspend accounts |
| Rides Monitoring & Analytics | Richard | Live rides view, ride status log, dashboard stats (totals, cancellation rate, active drivers) |

All three share the same login screen and dashboard shell — agree on that shell together before splitting off into your own section, so the app doesn't end up as three disconnected pages.

---

## How It All Connects (Flow Summary)

```
Rider requests ride
   → Matching Engine (Ngozi) finds nearest online Driver
   → Driver gets alert (Ngozi's Driver app)
   → Driver accepts → Status Engine updates "accepted"
   → Both apps subscribe to Location Service (live tracking begins)
   → Driver updates status (arrived → started → completed)
   → Status Engine pushes each update to Rider in real time
   → On completion: Payment Gateway charges Rider, credits Driver
   → Notification Service (Enoch) prompts both sides to rate each other → Ratings system updated
   → Rides Monitoring (Richard) logs it in the admin live feed and analytics
```

**Key principle:** Rider and Driver apps never talk to each other directly — everything routes through the shared backend (matching engine, status engine, location service). That's why the shared foundation was built first, and why changes to it need a heads-up in the group chat.

---

## Repository Structure

```
ride-booking-app/
├── backend/                    # REST API + WebSocket server
│   └── src/
│       ├── controllers/
│       ├── models/                  # User, Ride, Rating — shared, don't duplicate
│       ├── routes/
│       │   ├── auth.routes.js            # done (shared)
│       │   ├── ride.routes.js            # Ngozi + Enoch extend this
│       │   ├── rating.routes.js          # Enoch — new
│       │   └── admin/
│       │       ├── customers.routes.js       # Oluwakemi
│       │       ├── drivers.routes.js         # Gideon
│       │       └── rides-analytics.routes.js # Richard
│       ├── services/
│       │   ├── rideStateMachine.js       # done (shared)
│       │   ├── authService.js            # done (shared)
│       │   ├── matchingEngine.js         # Ngozi — new
│       │   ├── pricingEngine.js          # Enoch — new
│       │   └── notificationService.js    # Enoch — new
│       ├── sockets/                 # real-time location/status broadcasting (done)
│       └── config/
├── rider-app/                  # Enoch — rider-facing client app
├── driver-app/                 # Ngozi — driver-facing client app
├── admin-dashboard/            # split 3 ways
│   └── src/
│       ├── customers/               # Oluwakemi
│       ├── drivers/                 # Gideon
│       └── rides-analytics/         # Richard
├── docs/                       # architecture notes, API spec, ER diagram, meeting notes
└── .github/                    # issue templates, CI workflows
```

## Getting Started

Each subfolder has its own README with setup instructions. Backend is already runnable — see `backend/README.md`.

## Branching Convention

- `main` — always deployable/demo-ready. Protected: direct pushes and merges are blocked for everyone except the repo owner.
- `feature/<short-description>` — everyone branches off `main`, works, opens a PR back into `main`
- PRs need at least 1 review before they can be merged; only the repo owner can complete the merge
- Merge to `main` only once it's confirmed to run locally

## Docs

- [`docs/architecture.md`](docs/architecture.md) — system design & data flow
- [`docs/api-spec.md`](docs/api-spec.md) — API contract between backend and all apps
