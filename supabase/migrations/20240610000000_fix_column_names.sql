-- Rename last_updated column to lastUpdated if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'last_updated') THEN
    ALTER TABLE investors RENAME COLUMN last_updated TO "lastUpdated";
  END IF;
END$$;

-- Add lastUpdated column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'lastUpdated') THEN
    ALTER TABLE investors ADD COLUMN "lastUpdated" TEXT;
  END IF;
END$$;
