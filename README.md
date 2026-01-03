# GlobeTrotter

Multi-city trip planner — plan, visualize, and share itineraries.

## Problem statement

Planning multi-city trips is fragmented across maps, notes, spreadsheets and messaging. Travelers need a single place to build itineraries, split a trip into sections (cities/stays), track budgets, schedule activities, and share read-only itineraries with friends.

## Solution overview

GlobeTrotter is a full-stack web app that lets users:
- Sign up / log in and manage a profile (with photo).
- Create trips with metadata (name, dates, budget).
- Break trips into ordered sections (city stops) with dates and notes.
- Add activities and expenses per stop (planned work in progress).
- See trips on a calendar overview and a planner UI.
- Share trips publicly via a generated slug URL.
- Admin panel for user, city, and trend management.

The repository contains a React + Vite front-end (`client/`) and a Node.js + Express back-end (`server/`) with a Postgres database and SQL migrations.

## Key features
- Authentication (signup/login) with JWTs
- Profile photo upload (base64 stored in DB for demo)
- Trip creation, editing, and per-stop management
- Calendar view and itinerary builder (planner)
- Shareable public trips

## Tech stack
- Frontend: React, Vite, React Router
- Styles: plain CSS (single stylesheet at `client/src/index.css`)
- Backend: Node.js, Express
- Database: PostgreSQL with SQL migrations (server/db/migrations)
- Auth: bcrypt for password hashing, JWT for tokens
- Dev tooling: npm scripts, dotenv for configuration

## Repository layout
- `client/` — React app, components, routes
- `server/` — Express API, routes, DB migrations
- `server/db/migrations/` — SQL schema and incremental migrations

## Setup (local development)
Prerequisites: Node.js (>=18), PostgreSQL (or Docker).

1. Copy env file and set `DATABASE_URL` in `server/.env`.
   - Example: `DATABASE_URL=postgres://globetrotter_user:password@localhost:5432/globetrotter`

2. Create database and user (psql) or run Postgres via Docker:

```powershell
# create a role and database (run as postgres superuser)
psql -U postgres -h localhost -c "CREATE ROLE globetrotter_user WITH LOGIN PASSWORD 'your_password';"
psql -U postgres -h localhost -c "CREATE DATABASE globetrotter OWNER globetrotter_user;"
```

Or via Docker:

```powershell
docker run --name globe-postgres -e POSTGRES_USER=globetrotter_user -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=globetrotter -p 5432:5432 -d postgres:15
```

3. Run migrations and start the server:

```powershell
cd server
npm install
npm run migrate
npm run dev
```

4. Start the client app:

```powershell
cd client
npm install
npm run dev
```

Open the client in the browser at the port Vite shows (typically `http://localhost:5173`).

## Admin access (local/testing)
To enable admin UI for a user locally, set the `is_admin` flag in the database after migrations:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

Be sure you run this against the same `globetrotter` database defined in `server/.env`.

## Notes & recommended improvements
- Currently profile images are stored as base64 in the DB for simplicity — for production switch to object storage (S3) and serve via URLs.
- Large uploads are supported via increased body parser limits in development; consider multipart file uploads + streaming for robustness.
- Add server-side image validation (size, type) before saving.
- Improve planner with draggable stops and map integration (e.g., Mapbox or Google Maps).

## Team
- Vannoor Sab — Solo developer
  - Email: vanursab71@gmail.com

