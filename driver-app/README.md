# Driver App

Owned by Ngozi. Driver-facing client — auth/verification, online/offline toggle, incoming ride
requests, navigation, trip status updates, and earnings.

## Stack

React + Vite + Tailwind CSS, styled through the shared design system in `../shared-ui/`.

## Setup

From the **repo root** (not this folder) run `npm install` once — npm workspaces installs every
app's dependencies together and links `shared-ui` automatically. Then:

```bash
npm run dev:driver
```

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
