-- Fix the investors table by adding investor_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'investor_id') THEN
    ALTER TABLE investors ADD COLUMN investor_id UUID DEFAULT gen_random_uuid();
  END IF;
END$$;

-- Rename the primary key column from id to investor_id if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'id') THEN
    -- Check if there's already data in the investor_id column
    IF EXISTS (SELECT 1 FROM investors WHERE investor_id IS NOT NULL LIMIT 1) THEN
      -- If investor_id already has data, just drop the id column
      ALTER TABLE investors DROP COLUMN IF EXISTS id;
    ELSE
      -- Copy values from id to investor_id
      UPDATE investors SET investor_id = id::uuid WHERE investor_id IS NULL;
      -- Drop the id column after copying
      ALTER TABLE investors DROP COLUMN IF EXISTS id;
    END IF;
  END IF;
END$$;

-- Add primary key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'investors' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE investors ADD PRIMARY KEY (investor_id);
  END IF;
END$$;
