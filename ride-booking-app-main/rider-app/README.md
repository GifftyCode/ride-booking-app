# Rider App

Owned by Enoch. Rider-facing client — auth, ride requests, fare/ETA display, live driver tracking,
ride history, and ratings.

## Stack

React + Vite + Tailwind CSS, styled through the shared design system in `../shared-ui/`.

## Setup

From the **repo root** (not this folder) run `npm install` once — npm workspaces installs every
app's dependencies together and links `shared-ui` automatically. Then:

```bash
npm run dev:rider
```

## Using the design system

Import shared components instead of building your own from scratch:

```jsx
import { Button, Input, Card, StatusBadge } from "shared-ui";
```

See `../shared-ui/README.md` for the full list and how to add a new shared component if you need
one that doesn't exist yet.

## Key Screens

- Sign up / Login
- Home / request a ride (pickup + drop-off picker)
- Finding driver / matched screen
- Live tracking (map + driver ETA)
- Trip in progress
- Rate driver
- Ride history

## Backend you own

Extend `backend/src/routes/ride.routes.js` (ride creation, cancel, history) and build:
- `backend/src/services/pricingEngine.js` — fare estimate calculation
- `backend/src/services/notificationService.js` — status-change notifications
- `backend/src/routes/rating.routes.js` — submit/view ratings (the `Rating` model already exists)
