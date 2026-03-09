
-- Backfill INVENTORY ONLY
INSERT INTO inventory (
    clinic_id, name, category, min_quantity, unit, price, quantity
)
SELECT 
    c.id, i.name, i.category, i.min_quantity, i.unit, i.price, 0
FROM clinics c
CROSS JOIN system_inventory_templates i
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE clinic_id = c.id);

DO $$ BEGIN RAISE NOTICE 'Inventory Backfill Completed.'; END $$;
