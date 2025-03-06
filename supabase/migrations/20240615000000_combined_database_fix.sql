-- Drop tables with dependencies first if they exist
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS investor_subscriptions_view CASCADE;
DROP VIEW IF EXISTS investor_subscriptions_view CASCADE;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS investor_groups_investors CASCADE;
DROP TABLE IF EXISTS investor_groups CASCADE;
DROP TABLE IF EXISTS investors CASCADE;

-- Create the kyc_status enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('approved', 'pending', 'failed', 'not_started', 'expired');
  END IF;
END$$;

-- Create the investors table
CREATE TABLE investors (
  investor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  wallet_address TEXT,
  kyc_status TEXT NOT NULL,
  "lastUpdated" TEXT,
  verification_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the investor_groups table
CREATE TABLE investor_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the investor_groups_investors table
CREATE TABLE investor_groups_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES investor_groups(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(investor_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, investor_id)
);

-- Add indexes for better performance
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_investors_kyc_status ON investors(kyc_status);
CREATE INDEX idx_investor_groups_investors_group_id ON investor_groups_investors(group_id);
CREATE INDEX idx_investor_groups_investors_investor_id ON investor_groups_investors(investor_id);

-- Add a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updated_at column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_investors_updated_at') THEN
    CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON investors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_investor_groups_updated_at') THEN
    CREATE TRIGGER update_investor_groups_updated_at
    BEFORE UPDATE ON investor_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;
