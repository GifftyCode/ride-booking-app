# Ride Booking App

Minimal MVP scaffold for a ride-booking platform where a rider requests a ride, a driver accepts and updates trip status, and both sides can view ride history.

## Repository Structure

```text
ride-booking-app/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       ├── hooks/
│       ├── routes/
│       └── utils/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       └── config/
├── README.md
└── .gitignore
```

## Current Scaffold

- `frontend/src/pages` contains minimal Rider, Driver, Admin, and Home pages.
- `frontend/src/services` contains API helper files for future backend integration.
- `backend/src/models` contains `User`, `Ride`, and `Rating` Mongoose models.
- `backend/src/controllers` contains auth, ride, rating, and admin controller entry points.
- `backend/src/routes` contains auth, ride, and rating routes.
- `backend/src/services` contains auth, ride state, matching, pricing, and notification service placeholders.
- `backend/src/config` contains database, app, and server setup.

## Team Notes

Keep new files inside the approved folders above. If a feature needs a new area, add it inside the closest existing folder first.
