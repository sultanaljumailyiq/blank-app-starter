DO $$
BEGIN
    RAISE NOTICE 'Checking tables...';
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
        RAISE NOTICE 'Table coupons exists';
    ELSE
        RAISE NOTICE 'Table coupons MISSING';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'promotions') THEN
        RAISE NOTICE 'Table promotions exists';
    ELSE
        RAISE NOTICE 'Table promotions MISSING';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'financial_records') THEN
        RAISE NOTICE 'Table financial_records exists';
    ELSE
        RAISE NOTICE 'Table financial_records MISSING';
    END IF;

     IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deal_requests') THEN
        RAISE NOTICE 'Table deal_requests exists';
    ELSE
        RAISE NOTICE 'Table deal_requests MISSING';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'promotional_cards') THEN
        RAISE NOTICE 'Table promotional_cards exists';
    ELSE
        RAISE NOTICE 'Table promotional_cards MISSING';
    END IF;
END $$;
