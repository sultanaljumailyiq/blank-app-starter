
-- Safe Inventory Backfill (Minimal Columns)
INSERT INTO inventory (
    clinic_id, name, quantity
)
SELECT 
    c.id, i.name, 0
FROM clinics c
CROSS JOIN system_inventory_templates i
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE clinic_id = c.id);

DO $$ BEGIN RAISE NOTICE 'Safe Inventory Backfill Completed.'; END $$;
