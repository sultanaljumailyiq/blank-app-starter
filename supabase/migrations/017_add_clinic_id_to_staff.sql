-- إضافة معرف العيادة لجدول الموظفين
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_staff_clinic_id ON staff(clinic_id);
