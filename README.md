# Ride Booking App

Capstone project — a ride booking platform where users request rides, drivers accept trips, and both sides track ride status in real time.

## Team & Feature Ownership

| Name          | Feature                         | Scope                                                                          |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| **Ngozi**     | Driver App                      | Full stack — driver-facing UI and its backend routes                           |
| **Enoch**     | Rider App                       | Full stack — rider-facing UI and its backend routes                            |
| **Oluwakemi** | Admin Dashboard                 | Full stack — monitoring, user/driver management, analytics                     |
| **Gideon**    | Matching & Pricing Engine       | Backend service — finds nearest available driver, calculates fare estimates    |
| **Richard**   | Notifications & Ratings/Reviews | Backend service + small shared UI components used inside the Rider/Driver apps |

The shared foundation (auth, database models, the ride status logic, and real-time updates) is already built and pushed to the repo. Nobody touches those files without flagging it in the group chat first — they affect everyone's work.

---

## Feature Breakdown by Side

Here's a complete breakdown by side, with the connections between them made explicit.

### Rider-Side Features (Enoch)

| Feature                     | Description                                     | Connects To                                                |
| --------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Sign up / Login             | Phone/email + OTP or password auth              | Auth service (shared)                                      |
| Profile management          | Name, photo, saved addresses, payment method    | User DB (shared)                                           |
| Ride request                | Set pickup + drop-off, choose ride type         | Matching engine (Gideon)                                   |
| Fare & ETA estimate         | Shown before confirming request                 | Pricing engine (Gideon) + Maps API                         |
| Driver matching wait screen | Shows "finding driver" state                    | Matching engine → notifies Driver app                      |
| Live driver tracking        | See driver's live location moving toward pickup | Location service (shared, real-time)                       |
| Ride status updates         | Accepted / arriving / started / completed       | Status engine (shared) — same state machine Driver updates |
| In-app chat/call (optional) | Contact driver directly                         | Messaging service (stretch goal)                           |
| Cancel ride                 | Before or shortly after acceptance              | Status engine → notifies Driver                            |
| Payment                     | Charge on completion                            | Payment gateway (stretch goal)                             |
| Rate & review driver        | After trip ends                                 | Ratings DB (Richard) → affects Driver profile              |
| Ride history                | Past trips, receipts                            | User DB (shared)                                           |

### Driver-Side Features (Ngozi)

| Feature                        | Description                            | Connects To                                     |
| ------------------------------ | -------------------------------------- | ----------------------------------------------- |
| Sign up / Login + verification | ID, license, vehicle docs              | Auth service + Admin approval (Oluwakemi)       |
| Profile & vehicle info         | Car details, plate number, documents   | User DB (shared)                                |
| Online/Offline toggle          | Controls visibility to matching engine | Matching engine (Gideon)                        |
| Incoming ride request alert    | Accept/reject within time window       | Matching engine → pushed from Rider request     |
| Navigation to pickup/drop-off  | Turn-by-turn directions                | Maps API                                        |
| Update trip status             | Arrived, started, completed            | Status engine — same one Rider sees update live |
| Live location broadcast        | Sent continuously while on trip        | Location service → streamed to Rider app        |
| Earnings dashboard             | Per trip, daily, weekly totals         | Payment/earnings DB (stretch goal)              |
| Trip history                   | Completed rides log                    | User DB (shared)                                |
| Rate rider                     | After trip ends                        | Ratings DB (Richard) → affects Rider profile    |
| Cancel/reject ride             | With reason                            | Status engine → notifies Rider                  |

### Shared Backend Features (already built — do not duplicate)

| Feature                          | Description                            | Used By                                |
| -------------------------------- | -------------------------------------- | -------------------------------------- |
| Authentication service           | Issues tokens, manages sessions        | Everyone                               |
| User & Driver database           | Stores all profile/account data        | Everyone                               |
| Ride state machine               | Single source of truth for ride status | Everyone reads/writes to this          |
| Real-time location service       | WebSocket broadcasting live GPS        | Rider ↔ Driver                         |
| Maps/Geolocation API integration | Routing, distance, ETA calculation     | Rider app, Driver app, Matching engine |

### Feature-Owner Backend Services (new — being built)

| Feature                  | Owner     | Description                                                         |
| ------------------------ | --------- | ------------------------------------------------------------------- |
| Matching engine          | Gideon    | Finds nearest available driver, sends request to Driver app         |
| Pricing engine           | Gideon    | Calculates fare estimate & final fare                               |
| Notification service     | Richard   | Push/in-app notifications triggered by every ride status change     |
| Ratings & reviews system | Richard   | Stores and aggregates ratings; feeds both Rider and Driver profiles |
| Admin dashboard          | Oluwakemi | Monitor rides, manage users/drivers, view analytics                 |

---

## How It All Connects (Flow Summary)
