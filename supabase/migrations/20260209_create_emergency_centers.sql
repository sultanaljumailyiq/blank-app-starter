-- Create emergency_centers table
CREATE TABLE IF NOT EXISTS public.emergency_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('government', 'private')),
    phone TEXT,
    address TEXT,
    governorate TEXT,
    location JSONB, -- {lat: number, lng: number}
    working_hours TEXT,
    is_24h BOOLEAN DEFAULT false,
    services TEXT[], -- Array of strings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create emergency_settings table for global configurations (like hotline)
CREATE TABLE IF NOT EXISTS public.emergency_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS Policies for emergency_centers
ALTER TABLE public.emergency_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active emergency centers"
    ON public.emergency_centers
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow admin full access to emergency centers"
    ON public.emergency_centers
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for emergency_settings
ALTER TABLE public.emergency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to emergency settings"
    ON public.emergency_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin full access to emergency settings"
    ON public.emergency_settings
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Insert initial hotline setting if not exists
INSERT INTO public.emergency_settings (key, value)
VALUES ('hotline', '{"number": "07700000000", "is_active": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.emergency_centers TO anon, authenticated;
GRANT ALL ON public.emergency_centers TO authenticated;
GRANT SELECT ON public.emergency_settings TO anon, authenticated;
GRANT ALL ON public.emergency_settings TO authenticated;
