# Smart Civic Grievance & Resolution System

Full-stack civic issue reporting platform with an Express/PostgreSQL/PostGIS API and React/Vite interface.

## Step 1: Configure PostgreSQL

Install PostgreSQL with PostGIS, create a database named `civic_grievance`, then set `DATABASE_URL` in `backend/.env`. Apply the schema:

```powershell
psql "$env:DATABASE_URL" -f backend/migrations/init.sql
psql "$env:DATABASE_URL" -f backend/migrations/officers.sql
psql "$env:DATABASE_URL" -f backend/migrations/auth.sql
```

## Run the API

```powershell
cd backend
npm install
npm start
```

Check it with `Invoke-RestMethod http://localhost:5000/api/health`.

## Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The API accepts complaint text, coordinates, and optional media at `POST /api/complaints`.

## Officer portal

Use `/officer-login` to register or sign in. Officer endpoints require a JWT bearer token and only return or mutate complaints assigned to the authenticated officer's department:

- `POST /api/officers/register`
- `POST /api/officers/login`
- `GET /api/officers/complaints`
- `PATCH /api/officers/complaints/:id/status`
- `POST /api/officers/complaints/:id/resolve`

Replace `JWT_SECRET` in `backend/.env` with a long random value before deployment. The default department IDs are seeded in `init.sql`: Public Works, Street Lighting, Sanitation, Water Utility, and Electrical Utility.

Create the first administrator from environment variables rather than a public registration form:

```powershell
$env:ADMIN_NAME = "System Administrator"
$env:ADMIN_EMAIL = "admin@example.gov"
$env:ADMIN_PASSWORD = "replace-with-a-long-password"
npm run create-admin --prefix backend
```

Citizen routes are `/citizen-login`, `/citizen-register`, and `/citizen-dashboard`. Officer routes are `/officer-login` and `/officer-dashboard`. The admin routes are `/admin-login` and `/admin-dashboard`.