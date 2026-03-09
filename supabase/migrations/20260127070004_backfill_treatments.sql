
-- Backfill TREATMENTS ONLY
INSERT INTO treatments (
    clinic_id, name, category, base_price, cost_estimate, 
    profit_margin, popularity, expected_sessions, is_complex, default_phases
)
SELECT 
    c.id, t.name, t.category, t.base_price, t.cost_estimate, 
    t.profit_margin, t.popularity, t.expected_sessions, t.is_complex, t.default_phases
FROM clinics c
CROSS JOIN system_treatment_templates t
WHERE NOT EXISTS (SELECT 1 FROM treatments WHERE clinic_id = c.id);

DO $$ BEGIN RAISE NOTICE 'Treatments Backfill Completed.'; END $$;
