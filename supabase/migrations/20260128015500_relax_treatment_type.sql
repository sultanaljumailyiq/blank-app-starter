
-- Simplify constraints for online booking - treatment_type
ALTER TABLE appointments 
ALTER COLUMN treatment_type DROP NOT NULL;
