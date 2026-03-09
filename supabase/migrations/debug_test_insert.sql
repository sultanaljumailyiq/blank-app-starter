
DO $$
BEGIN
    INSERT INTO inventory (
        clinic_id, name, category, min_quantity, unit, price, quantity
    ) VALUES (
        (SELECT id FROM clinics LIMIT 1), 'test', 'test', 5, 'pcs', 0, 0
    );
    RAISE NOTICE 'Inventory Insert Success';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Inventory Insert Failed: %', SQLERRM;
END $$;
