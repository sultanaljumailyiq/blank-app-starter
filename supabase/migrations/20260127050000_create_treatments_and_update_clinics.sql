-- Create treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id BIGINT REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view treatments for their clinics" ON public.treatments
    FOR SELECT USING (
        exists (
            select 1 from public.clinics
            where id = treatments.clinic_id
            and (owner_id = auth.uid() OR exists (select 1 from clinic_members where clinic_id = clinics.id and user_id = auth.uid()))
        )
    );

CREATE POLICY "Owners can insert treatments" ON public.treatments
    FOR INSERT WITH CHECK (
        exists (
            select 1 from public.clinics
            where id = treatments.clinic_id
            and owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update treatments" ON public.treatments
    FOR UPDATE USING (
        exists (
            select 1 from public.clinics
            where id = treatments.clinic_id
            and owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete treatments" ON public.treatments
    FOR DELETE USING (
        exists (
            select 1 from public.clinics
            where id = treatments.clinic_id
            and owner_id = auth.uid()
        )
    );

-- Add Location Columns to Clinics
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Function to seed default treatments
CREATE OR REPLACE FUNCTION public.seed_default_treatments()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.treatments (clinic_id, name, price)
    VALUES
        (NEW.id, 'كشفية (Consultation)', 15000),
        (NEW.id, 'حشوة ضوئية (Composite Filling)', 45000),
        (NEW.id, 'قلع سن بسيط (Simple Extraction)', 25000),
        (NEW.id, 'قلع جراحي (Surgical Extraction)', 75000),
        (NEW.id, 'سحب عصب (Root Canal Treatment)', 100000),
        (NEW.id, 'تنظيف أسنان (Scaling & Polishing)', 35000),
        (NEW.id, 'تبييض أسنان (Teeth Whitening)', 150000),
        (NEW.id, 'طقم أسنان متحرك (Removable Denture)', 250000),
        (NEW.id, 'زرعة سنية (Dental Implant)', 500000),
        (NEW.id, 'جسور خزفية (Zirconia Crown)', 125000);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to seed treatments on clinic creation
DROP TRIGGER IF EXISTS on_clinic_created_seed_treatments ON public.clinics;
CREATE TRIGGER on_clinic_created_seed_treatments
    AFTER INSERT ON public.clinics
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_default_treatments();

-- Seed for existing clinics (Optional - run once)
DO $$
DECLARE
    clinic_rec RECORD;
BEGIN
    FOR clinic_rec IN SELECT id FROM public.clinics LOOP
        IF NOT EXISTS (SELECT 1 FROM public.treatments WHERE clinic_id = clinic_rec.id LIMIT 1) THEN
            INSERT INTO public.treatments (clinic_id, name, price)
            VALUES
                (clinic_rec.id, 'كشفية (Consultation)', 15000),
                (clinic_rec.id, 'حشوة ضوئية (Composite Filling)', 45000),
                (clinic_rec.id, 'قلع سن بسيط (Simple Extraction)', 25000),
                (clinic_rec.id, 'قلع جراحي (Surgical Extraction)', 75000),
                (clinic_rec.id, 'سحب عصب (Root Canal Treatment)', 100000),
                (clinic_rec.id, 'تنظيف أسنان (Scaling & Polishing)', 35000),
                (clinic_rec.id, 'تبييض أسنان (Teeth Whitening)', 150000),
                (clinic_rec.id, 'طقم أسنان متحرك (Removable Denture)', 250000),
                (clinic_rec.id, 'زرعة سنية (Dental Implant)', 500000),
                (clinic_rec.id, 'جسور خزفية (Zirconia Crown)', 125000);
        END IF;
    END LOOP;
END;
$$;
