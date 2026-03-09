-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title text,  -- e.g., "Home", "Clinic"
    governorate text NOT NULL,
    city text NOT NULL,
    address text NOT NULL, -- Detailed address
    phone text NOT NULL,
    is_default boolean DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
    ON public.shipping_addresses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
    ON public.shipping_addresses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
    ON public.shipping_addresses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
    ON public.shipping_addresses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Ensure orders table has shipping_address JSONB column (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address JSONB;
    END IF;
END $$;
