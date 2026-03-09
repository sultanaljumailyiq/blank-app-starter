
-- Force fix for missing clinic columns
-- Safe to run multiple times (Idempotent)

DO $$
BEGIN
    -- 1. Check/Add 'settings'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'settings') THEN
        ALTER TABLE clinics ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 2. Check/Add 'is_digital_booking'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'is_digital_booking') THEN
        ALTER TABLE clinics ADD COLUMN is_digital_booking BOOLEAN DEFAULT false;
    END IF;

    -- 3. Check/Add 'is_featured'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'is_featured') THEN
        ALTER TABLE clinics ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- 4. Check/Add 'commission_rate' (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'commission_rate') THEN
        ALTER TABLE clinics ADD COLUMN commission_rate NUMERIC DEFAULT 0;
    END IF;

END $$;
