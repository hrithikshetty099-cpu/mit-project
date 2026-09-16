CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS departments (id SERIAL PRIMARY KEY, name TEXT NOT NULL, category_mapping JSONB NOT NULL DEFAULT '{}'::jsonb);
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY, category TEXT NOT NULL, description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL, lng DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL, address TEXT, media_url TEXT,
  before_media_url TEXT, after_media_url TEXT, status TEXT NOT NULL DEFAULT 'Reported',
  master_complaint_id INTEGER REFERENCES complaints(id), severity TEXT NOT NULL DEFAULT 'Normal',
  affected_citizens INTEGER NOT NULL DEFAULT 1, department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS complaints_location_idx ON complaints USING GIST(location);
CREATE TABLE IF NOT EXISTS status_history (id SERIAL PRIMARY KEY, complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE, stage TEXT NOT NULL, timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS verifications (id SERIAL PRIMARY KEY, complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE, citizen_id TEXT NOT NULL, confirmed BOOLEAN NOT NULL, timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS escalations (id SERIAL PRIMARY KEY, complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE, level INTEGER NOT NULL, timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS landmarks (id SERIAL PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, location GEOGRAPHY(POINT, 4326) NOT NULL);
INSERT INTO departments (name, category_mapping) VALUES
  ('Public Works', '{"pothole": true}'::jsonb), ('Street Lighting', '{"streetlight": true}'::jsonb),
  ('Sanitation', '{"garbage": true}'::jsonb), ('Water Utility', '{"water": true}'::jsonb),
  ('Electrical Utility', '{"electrical": true}'::jsonb) ON CONFLICT DO NOTHING;

INSERT INTO landmarks (name, kind, location) VALUES
  ('Central Hospital', 'hospital', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography),
  ('Civic High School', 'school', ST_SetSRID(ST_MakePoint(77.6033, 12.9352), 4326)::geography),
  ('Main Traffic Corridor', 'high-traffic-road', ST_SetSRID(ST_MakePoint(77.6101, 12.9784), 4326)::geography)
ON CONFLICT DO NOTHING;