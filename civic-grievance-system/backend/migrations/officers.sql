CREATE TABLE IF NOT EXISTS officers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('road_service', 'electrical', 'municipality', 'water_leakage')),
  id_card_url TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_document TEXT,
  job_id TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'officers' AND column_name = 'department' AND data_type = 'integer') THEN
    ALTER TABLE officers RENAME COLUMN department TO legacy_department_id;
    ALTER TABLE officers ADD COLUMN department TEXT;
    UPDATE officers o
    SET department = CASE d.name
      WHEN 'Road Department' THEN 'road_service'
      WHEN 'Roads & Infrastructure Department' THEN 'road_service'
      WHEN 'Electricity Department' THEN 'electrical'
      WHEN 'Municipality / Waste Management' THEN 'municipality'
      WHEN 'Waste Management & Municipality Department' THEN 'municipality'
      WHEN 'Water Supply Department' THEN 'water_leakage'
      ELSE 'road_service'
    END
    FROM departments d
    WHERE d.id = o.legacy_department_id;
    UPDATE officers SET department = 'road_service' WHERE department IS NULL;
    ALTER TABLE officers ALTER COLUMN department SET NOT NULL;
  END IF;
END $$;

ALTER TABLE officers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS id_card_url TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE officers ADD COLUMN IF NOT EXISTS verification_document TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS job_id TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS phone TEXT;

UPDATE officers SET verified = true WHERE verification_status = 'approved';
UPDATE officers SET id_card_url = verification_document WHERE id_card_url IS NULL AND verification_document IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS officers_email_idx ON officers(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS officers_job_id_idx ON officers(job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS officers_phone_idx ON officers(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS officers_department_idx ON officers(department);
CREATE TABLE IF NOT EXISTS officers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  job_id TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  department INTEGER NOT NULL REFERENCES departments(id),
  verification_document TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE officers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS job_id TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS verification_document TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS officers_job_id_idx ON officers(job_id) WHERE job_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS officers_phone_idx ON officers(phone) WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS officers_department_idx ON officers(department);