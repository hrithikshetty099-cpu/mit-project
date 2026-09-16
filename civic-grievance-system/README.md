# Smart Civic Grievance & Resolution System

Full-stack civic issue reporting platform with an Express/PostgreSQL/PostGIS API and React/Vite interface.

## Step 1: Configure PostgreSQL

Install PostgreSQL with PostGIS, create a database named `civic_grievance`, then set `DATABASE_URL` in `backend/.env`. Apply the schema:

```powershell
psql "$env:DATABASE_URL" -f backend/migrations/init.sql
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