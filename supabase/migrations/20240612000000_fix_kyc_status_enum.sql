-- Create the kyc_status enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('approved', 'pending', 'failed', 'not_started', 'expired');
  END IF;
END$$;

-- Alter the kyc_status column to use the enum type
DO $$
BEGIN
  -- First check if the column exists and is not already of type kyc_status
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'investors' 
    AND column_name = 'kyc_status' 
    AND data_type <> 'USER-DEFINED'
  ) THEN
    -- Temporarily alter the column to text if it's not already
    ALTER TABLE investors ALTER COLUMN kyc_status TYPE TEXT;
    
    -- Then alter it to the enum type
    ALTER TABLE investors ALTER COLUMN kyc_status TYPE kyc_status USING kyc_status::kyc_status;
  END IF;
END$$;
