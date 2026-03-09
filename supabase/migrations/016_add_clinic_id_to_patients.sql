-- إضافة معرف العيادة لجدول المرضى
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);

-- تحديث الـ RLS ليسمح بالوصول حسب العيادة (سنعتمد على الفلترة في الكويري حالياً، لكن السياسة يجب أن تكون دقيقة)
-- سنضيف سياسة عامة للأطباء لقراءة المرضى في عياداتهم (إذا كان لديهم وصول للعيادة)
-- حالياً نبقي السياسات الحالية (role='doctor') ونعتمد على shouldFilter في ال frontend/query
