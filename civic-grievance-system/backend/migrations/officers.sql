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