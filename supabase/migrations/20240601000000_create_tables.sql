-- Create investors table
CREATE TABLE IF NOT EXISTS public.investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL,
    wallet_address TEXT,
    kyc_status TEXT DEFAULT 'not_started',
    last_updated DATE,
    verification_details JSONB DEFAULT NULL
);

-- Create investor_groups table
CREATE TABLE IF NOT EXISTS public.investor_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL
);

-- Create investor_groups_investors table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.investor_groups_investors (
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    group_id UUID REFERENCES public.investor_groups(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, investor_id)
);

-- Enable row-level security
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_groups_investors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Public read access to investors"
    ON public.investors FOR SELECT
    USING (true);

CREATE POLICY "Public write access to investors"
    ON public.investors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public update access to investors"
    ON public.investors FOR UPDATE
    USING (true);

CREATE POLICY "Public delete access to investors"
    ON public.investors FOR DELETE
    USING (true);

CREATE POLICY "Public read access to investor_groups"
    ON public.investor_groups FOR SELECT
    USING (true);

CREATE POLICY "Public write access to investor_groups"
    ON public.investor_groups FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public update access to investor_groups"
    ON public.investor_groups FOR UPDATE
    USING (true);

CREATE POLICY "Public delete access to investor_groups"
    ON public.investor_groups FOR DELETE
    USING (true);

CREATE POLICY "Public read access to investor_groups_investors"
    ON public.investor_groups_investors FOR SELECT
    USING (true);

CREATE POLICY "Public write access to investor_groups_investors"
    ON public.investor_groups_investors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public update access to investor_groups_investors"
    ON public.investor_groups_investors FOR UPDATE
    USING (true);

CREATE POLICY "Public delete access to investor_groups_investors"
    ON public.investor_groups_investors FOR DELETE
    USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.investors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investor_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investor_groups_investors;
