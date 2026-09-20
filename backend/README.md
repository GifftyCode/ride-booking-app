# Backend

REST API + WebSocket server. Owns auth, database, matching engine, ride state machine, and real-time broadcasting.

## Setup

_To be filled in once the stack is chosen (see `docs/architecture.md` open decisions)._

```bash
# example if Node/Express:
npm install
npm run dev
```

## Folder Guide

- `src/controllers/` — request handlers
- `src/models/` — DB models/schemas
- `src/routes/` — route definitions
- `src/services/` — matching engine, pricing engine, notifications
- `src/sockets/` — WebSocket event handlers (location, status)
- `src/config/` — env vars, DB connection, constants
