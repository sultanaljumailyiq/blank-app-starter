
-- Simplify constraints for online booking
ALTER TABLE appointments 
ALTER COLUMN doctor_name DROP NOT NULL;

-- Also ensure patient_name is compliant if needed, but error was specifically about doctor_name
