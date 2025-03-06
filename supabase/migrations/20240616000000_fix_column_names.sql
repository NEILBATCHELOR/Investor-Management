-- Fix column names and add missing columns

-- First, check if the investors table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investors') THEN
    -- Add wallet_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'wallet_address') THEN
      ALTER TABLE investors ADD COLUMN wallet_address TEXT;
    END IF;
    
    -- Rename wallet column to wallet_address if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'wallet') THEN
      ALTER TABLE investors RENAME COLUMN wallet TO wallet_address;
    END IF;
    
    -- Make sure lastUpdated column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'lastUpdated') THEN
      ALTER TABLE investors ADD COLUMN "lastUpdated" TEXT;
    END IF;
    
    -- Make sure verification_details column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'verification_details') THEN
      ALTER TABLE investors ADD COLUMN verification_details JSONB;
    END IF;
  END IF;
END$$;
