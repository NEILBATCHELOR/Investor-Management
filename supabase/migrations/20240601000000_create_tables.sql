-- Create investors table
CREATE TABLE IF NOT EXISTS public.investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    type TEXT NOT NULL,
    wallet_address TEXT,
    kyc_status TEXT DEFAULT 'not_started',
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investor groups table
CREATE TABLE IF NOT EXISTS public.investor_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create many-to-many relationship table
CREATE TABLE IF NOT EXISTS public.investor_groups_investors (
    group_id UUID REFERENCES public.investor_groups(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, investor_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investors_email ON public.investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_type ON public.investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_kyc_status ON public.investors(kyc_status);
CREATE INDEX IF NOT EXISTS idx_investor_groups_name ON public.investor_groups(name);
CREATE INDEX IF NOT EXISTS idx_investor_groups_investors_group_id ON public.investor_groups_investors(group_id);
CREATE INDEX IF NOT EXISTS idx_investor_groups_investors_investor_id ON public.investor_groups_investors(investor_id);
