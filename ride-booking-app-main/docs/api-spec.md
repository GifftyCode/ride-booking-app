# API Contract (Draft)

Backend owner: fill this in before Rider/Driver app work starts, so both teammates can build against a stable contract (mock the responses until the real endpoints exist).

## Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create rider or driver account |
| POST | `/api/auth/login` | Returns auth token |
| POST | `/api/auth/logout` | Invalidate session |

## Users / Drivers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |
| PATCH | `/api/drivers/status` | Toggle online/offline |

## Rides

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rides` | Rider creates a ride request |
| GET | `/api/rides/:id` | Get ride details/status |
| PATCH | `/api/rides/:id/accept` | Driver accepts ride |
| PATCH | `/api/rides/:id/status` | Update ride status (arrived/started/completed) |
| PATCH | `/api/rides/:id/cancel` | Cancel ride |
| GET | `/api/rides/history` | Past rides for current user |

## Ratings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ratings` | Submit rating after trip completion |

## WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `ride:status_update` | server -> both apps | `{ rideId, status }` |
| `ride:driver_location` | server -> rider app | `{ rideId, lat, lng }` |
| `ride:request` | server -> driver app | `{ rideId, pickup, dropoff, fareEstimate }` |

_Update this table as endpoints are finalized — treat it as the source of truth both app teams build against._
