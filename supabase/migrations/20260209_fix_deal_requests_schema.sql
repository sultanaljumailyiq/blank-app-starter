-- Fix deal_requests table - ensure all columns exist
-- Migration: 20260209_fix_deal_requests_schema.sql

-- Add missing columns to deal_requests table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'end_date') THEN
        ALTER TABLE deal_requests ADD COLUMN end_date DATE;
        RAISE NOTICE 'Added end_date column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'start_date') THEN
        ALTER TABLE deal_requests ADD COLUMN start_date DATE;
        RAISE NOTICE 'Added start_date column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'discount_percentage') THEN
        ALTER TABLE deal_requests ADD COLUMN discount_percentage INTEGER DEFAULT 10;
        RAISE NOTICE 'Added discount_percentage column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'notes') THEN
        ALTER TABLE deal_requests ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'status') THEN
        ALTER TABLE deal_requests ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Added status column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'reviewed_by') THEN
        ALTER TABLE deal_requests ADD COLUMN reviewed_by UUID;
        RAISE NOTICE 'Added reviewed_by column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'reviewed_at') THEN
        ALTER TABLE deal_requests ADD COLUMN reviewed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added reviewed_at column to deal_requests';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE deal_requests ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'Added admin_notes column to deal_requests';
    END IF;
END $$;
