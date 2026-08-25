-- Migration: readings history (free daily limit + "Your Patterns" later)
CREATE TABLE IF NOT EXISTS readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  premium boolean DEFAULT false,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  question text,
  reading text,
  source text DEFAULT 'web',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_email ON readings(email);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Drop the old leaky policy if it exists (anon could see rows with NULL email)
DROP POLICY IF EXISTS "Allow anon read own readings" ON readings;

-- Authenticated users can only read their own rows.
CREATE POLICY "Users read own readings" ON readings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = auth.email());

-- Authenticated users can insert their own rows.
CREATE POLICY "Users insert own readings" ON readings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SQL Editor's CREATE TABLE does NOT auto-grant to API roles.
-- Without these, server-side (service_role) reads/writes fail with 42501
-- and the free/premium daily-limit feature never takes effect.
GRANT SELECT, INSERT, UPDATE, DELETE ON readings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON readings TO postgres;
GRANT SELECT, INSERT ON readings TO authenticated;
