# Driver App

Owned by Ngozi. Driver-facing client — auth/verification, online/offline toggle, incoming ride
requests, navigation, trip status updates, and earnings.

## Stack

React + Vite + Tailwind CSS, styled through the shared design system in `../shared-ui/`.

## Setup

From the **repo root** (not this folder) run `npm install` once — npm workspaces installs every
app's dependencies together and links `shared-ui` automatically. Copy `.env.example` to `.env`
here if you need to point at a backend that isn't on `localhost:5000`. Then:

```bash
npm run dev:driver
```

## Build progress

- [x] Auth (login, signup, token persistence, protected routing) — `src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `src/pages/Signup.jsx`
- [ ] Profile & vehicle info screen
- [ ] Online/offline toggle + home dashboard (currently a placeholder in `src/pages/Dashboard.jsx`)
- [ ] Incoming ride request (accept/reject)
- [ ] Navigation to pickup / drop-off
- [ ] Trip status controls (arrived / start / complete)
- [ ] Earnings dashboard
- [ ] Trip history
- [ ] Rate rider

`src/lib/api.js` is the one place that talks to the backend — add new functions there as each
screen needs them, rather than calling `fetch` directly inside a component.

## Using the design system

Import shared components instead of building your own from scratch:

```jsx
import { Button, Input, Card, StatusBadge } from "shared-ui";
```

See `../shared-ui/README.md` for the full list and how to add a new shared component if you need
one that doesn't exist yet.

## Key Screens

- Sign up / Login + document verification
- Online/offline toggle (home screen)
- Incoming ride request (accept/reject)
- Navigation to pickup / drop-off
- Trip status controls (arrived / start / complete)
- Earnings dashboard
- Trip history
- Rate rider

## Backend you own

Extend `backend/src/routes/ride.routes.js` (accept, status updates) and build:
- `backend/src/services/matchingEngine.js` — finds nearest available driver, alerts them
- Location push events in `backend/src/sockets/index.js` (already has the `ride:location_update` event wired up)
