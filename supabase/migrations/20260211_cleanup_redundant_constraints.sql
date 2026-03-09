-- Drop redundant foreign key constraints on financial_transactions table
-- We are keeping the explicitly named constraints (fk_fin_patients, fk_fin_staff_record)
-- and removing the auto-generated/duplicate ones.

ALTER TABLE "financial_transactions" 
DROP CONSTRAINT IF EXISTS "financial_transactions_patient_id_fkey";

ALTER TABLE "financial_transactions" 
DROP CONSTRAINT IF EXISTS "financial_transactions_staff_record_id_fkey";
