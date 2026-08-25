-- P0 security hardening: execute this migration after 001-003 in Supabase SQL Editor.
-- Public API clients must never read or write payment, subscriber, or reading rows.

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role insert" ON subscribers;
DROP POLICY IF EXISTS "Allow select own data" ON subscribers;
DROP POLICY IF EXISTS "Allow anon insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow anon insert orders" ON orders;
DROP POLICY IF EXISTS "Allow read subscriptions by email" ON subscriptions;
DROP POLICY IF EXISTS "Allow read orders by email" ON orders;
DROP POLICY IF EXISTS "Users read own readings" ON readings;
DROP POLICY IF EXISTS "Users insert own readings" ON readings;

REVOKE ALL ON TABLE subscribers, subscriptions, orders, readings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE subscribers, subscriptions, orders, readings TO service_role;
GRANT SELECT ON TABLE subscriptions, orders, readings TO authenticated;

-- Authenticated visitors may view only rows that match their verified auth email.
CREATE POLICY "Authenticated users read own subscriptions" ON subscriptions
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.email()));

CREATE POLICY "Authenticated users read own orders" ON orders
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.email()));

CREATE POLICY "Authenticated users read own readings" ON readings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(auth.email()));

-- Stores only a salted SHA-256 fingerprint and a UTC-day counter; raw IP values are not stored.
CREATE TABLE IF NOT EXISTS anonymous_reading_limits (
  bucket_date date NOT NULL,
  fingerprint_hash text NOT NULL CHECK (length(fingerprint_hash) = 64),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket_date, fingerprint_hash)
);

ALTER TABLE anonymous_reading_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE anonymous_reading_limits FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE anonymous_reading_limits TO service_role;

CREATE OR REPLACE FUNCTION consume_anonymous_reading_quota(
  p_fingerprint_hash text,
  p_limit integer DEFAULT 1
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_limit integer := greatest(1, least(coalesce(p_limit, 1), 5));
BEGIN
  IF length(p_fingerprint_hash) <> 64 THEN
    RAISE EXCEPTION 'Invalid anonymous reading fingerprint';
  END IF;

  INSERT INTO anonymous_reading_limits (bucket_date, fingerprint_hash, request_count, updated_at)
  VALUES (current_date, p_fingerprint_hash, 1, now())
  ON CONFLICT (bucket_date, fingerprint_hash) DO UPDATE
    SET request_count = anonymous_reading_limits.request_count + 1,
        updated_at = now()
    WHERE anonymous_reading_limits.request_count < v_limit
  RETURNING request_count INTO v_count;

  RETURN found;
END;
$$;

REVOKE ALL ON FUNCTION consume_anonymous_reading_quota(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_anonymous_reading_quota(text, integer) TO service_role;
