
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs') THEN
        RAISE EXCEPTION 'Table activity_logs does not exist';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'deleted_at') THEN
        RAISE EXCEPTION 'Column deleted_at missing in staff table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'deleted_at') THEN
        RAISE EXCEPTION 'Column deleted_at missing in patients table';
    END IF;

    RAISE NOTICE 'All checks passed: activity_logs table and deleted_at columns exist.';
END $$;
