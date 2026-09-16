CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS citizen_id INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users(phone) WHERE phone IS NOT NULL;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_officer_id INTEGER REFERENCES officers(id);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS officer_remarks TEXT;
CREATE INDEX IF NOT EXISTS complaints_citizen_idx ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS complaints_officer_idx ON complaints(assigned_officer_id);

UPDATE departments SET name = 'Road Department' WHERE name = 'Public Works';
UPDATE departments SET name = 'Municipality / Waste Management' WHERE name = 'Sanitation';
UPDATE departments SET name = 'Water Supply Department' WHERE name = 'Water Utility';
UPDATE departments SET name = 'Electricity Department', category_mapping = category_mapping || '{"streetlight": true}'::jsonb WHERE name = 'Electrical Utility';
UPDATE complaints SET department_id = (SELECT id FROM departments WHERE name = 'Electricity Department' LIMIT 1) WHERE department_id = (SELECT id FROM departments WHERE name = 'Street Lighting' LIMIT 1);
DELETE FROM departments WHERE name = 'Street Lighting';