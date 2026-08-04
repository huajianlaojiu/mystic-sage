-- Migration: Create subscribers table
-- Run this in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role insert" ON subscribers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow select own data" ON subscribers
  FOR SELECT TO authenticated
  USING (true);
