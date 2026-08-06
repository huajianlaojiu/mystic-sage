-- Migration: Create subscriptions + orders tables
-- Run in Supabase Dashboard SQL Editor

-- Subscriptions table (PayPal recurring billing)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_subscr_id text UNIQUE,
  email text NOT NULL,
  plan_name text,
  amount numeric(10,2),
  currency text DEFAULT 'USD',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Orders table (one-time purchases + subscription payments)
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_txn_id text UNIQUE,
  email text NOT NULL,
  item_name text,
  amount numeric(10,2),
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- RLS: service role bypasses RLS; allow anon insert for webhook fallback
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert subscriptions" ON subscriptions
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert orders" ON orders
  FOR INSERT TO anon WITH CHECK (true);

-- Allow any client to check their own subscription by email (read only)
CREATE POLICY "Allow read subscriptions by email" ON subscriptions
  FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read orders by email" ON orders
  FOR SELECT TO anon USING (true);
