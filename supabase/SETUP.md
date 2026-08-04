# Supabase Setup

## 1. Create subscribers table

Open the Supabase Dashboard SQL Editor:
https://supabase.com/dashboard/project/sqwexehmjefyaknisen/sql/new

Then paste and run:
```sql
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for all" ON subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
```

The SQL file is also at: supabase/migrations/001_create_subscribers.sql

## 2. Test it

Run the dev server and submit an email on the reading page.
Check Supabase Table Editor to verify data is being stored.
