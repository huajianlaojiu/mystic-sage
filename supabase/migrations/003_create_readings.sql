-- Migration: readings history (free daily limit + "Your Patterns" later)
CREATE TABLE IF NOT EXISTS readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  premium boolean DEFAULT false,
  cards jsonb,
  question text,
  reading text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_email ON readings(email);
CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Service role already bypasses RLS; allow anon/authenticated to read their own rows later.
CREATE POLICY "Allow anon read own readings" ON readings
  FOR SELECT TO anon, authenticated
  USING (email IS NULL OR email = current_setting('request.jwt.claims', true)::json->>'email');
