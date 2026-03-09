
-- Upgrade System Templates with Rich JSON Workflows

-- 1. Endo (Root Canal)
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Start: Access & Diagnosis", "duration": 45, "schemaId": "endo_access"},
    {"title": "Cleaning & Shaping", "duration": 60, "schemaId": "endo_cleaning"},
    {"title": "Obturation (Filling)", "duration": 45, "schemaId": "endo_fill"},
    {"title": "Final Restoration", "duration": 45, "schemaId": "endo_final_restoration"}
]'::jsonb 
WHERE name LIKE '%علاج عصب%';

-- 2. Implant
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Surgical Placement", "duration": 60, "schemaId": "implant_surgery"},
    {"title": "Uncovering & Loading", "duration": 30, "schemaId": "implant_loading"},
    {"title": "Impression", "duration": 30, "schemaId": "prosthetic_impression"},
    {"title": "Final Delivery", "duration": 30, "schemaId": "prosthetic_delivery"}
]'::jsonb 
WHERE name LIKE '%زركون%'; -- Assuming Zirconia Crown/Implant logic or specific implant item. 
-- Wait, looking at assets.ts from memory/previous context:
-- 'تاج زركون (Zirconia Crown)' was inserted. 
-- 'تاج خزف معدن (PFM Crown)' was inserted.
-- 'علاج عصب - (RCT)' was inserted.
-- 'واقي ليلي (Night Guard)' was inserted.

-- Let's be more specific based on the names inserted in previous migration.

-- Root Canal (RCT)
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Start: Access & Diagnosis", "duration": 45, "schemaId": "endo_access"},
    {"title": "Cleaning & Shaping", "duration": 60, "schemaId": "endo_cleaning"},
    {"title": "Obturation (Filling)", "duration": 45, "schemaId": "endo_fill"},
    {"title": "Final Restoration", "duration": 45, "schemaId": "endo_final_restoration"}
]'::jsonb 
WHERE name = 'علاج عصب - (RCT)';

-- Re-treatment
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Gutta Percha Removal", "duration": 60, "schemaId": "endo_retreatment_removal"},
    {"title": "Cleaning & Shaping", "duration": 60, "schemaId": "endo_cleaning"},
    {"title": "Obturation", "duration": 45, "schemaId": "endo_fill"},
    {"title": "Final Restoration", "duration": 45, "schemaId": "endo_final_restoration"}
]'::jsonb 
WHERE name = 'إعادة علاج عصب (Re-treatment)';

-- Crowns (PFM & Zirconia)
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Preparation", "duration": 60, "schemaId": "prosthetic_prep"},
    {"title": "Impression", "duration": 30, "schemaId": "prosthetic_impression"},
    {"title": "Final Delivery", "duration": 30, "schemaId": "prosthetic_delivery"}
]'::jsonb 
WHERE name IN ('تاج خزف معدن (PFM Crown)', 'تاج زركون (Zirconia Crown)');

-- Night Guard
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Impression", "duration": 20, "schemaId": "simple_impression"},
    {"title": "Delivery", "duration": 15, "schemaId": "simple_delivery"}
]'::jsonb 
WHERE name = 'واقي ليلي (Night Guard)';

-- Surgical Extraction
UPDATE system_treatment_templates 
SET default_phases = '[
    {"title": "Surgery", "duration": 45, "schemaId": "surgery_extraction"},
    {"title": "Suture Removal", "duration": 15, "schemaId": "suture_removal"}
]'::jsonb 
WHERE name = 'قلع جراحي (Surgical Extraction)';


-- 3. Propagate to Existing Treatments in Clinics
-- We want to update the treatments table where the name matches the system template name.
-- This ensures existing clinics see the new detailed workflows.

UPDATE treatments t
SET default_phases = st.default_phases
FROM system_treatment_templates st
WHERE t.name = st.name;

