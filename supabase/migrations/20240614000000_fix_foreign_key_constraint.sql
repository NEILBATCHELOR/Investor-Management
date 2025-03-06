-- Fix the foreign key constraint issue for investor_groups_investors table

-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investor_groups_investors') THEN
    -- Drop existing foreign key constraints if they exist
    ALTER TABLE investor_groups_investors DROP CONSTRAINT IF EXISTS investor_groups_investors_investor_id_fkey;
    
    -- Make sure the primary key exists on investors table
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'investors' AND constraint_type = 'PRIMARY KEY'
    ) THEN
      ALTER TABLE investors ADD PRIMARY KEY (investor_id);
    END IF;
    
    -- Re-create the foreign key constraint
    ALTER TABLE investor_groups_investors
      ADD CONSTRAINT investor_groups_investors_investor_id_fkey
      FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE CASCADE;
  END IF;
END$$;
