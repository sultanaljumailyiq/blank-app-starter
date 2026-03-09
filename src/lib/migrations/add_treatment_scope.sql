-- Add scope column
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS scope text CHECK (scope IN ('tooth', 'general', 'both')) DEFAULT 'tooth';

-- Set default to 'tooth' for all
UPDATE treatments SET scope = 'tooth';

-- Update General Treatments
UPDATE treatments SET scope = 'general' WHERE category = 'تقويم';
UPDATE treatments SET scope = 'general' WHERE name IN (
  'تبييض منزلي (Kit)',
  'تبييض ليزر (عيادة)',
  'إغلاق فلجة بالكومبوزيت',
  'سنايل آرت (Snap-on)',
  'Botox (Smile correction)',
  'Fillers (Lip)',
  'طقم كامل (Complete Denture) - فك واحد',
  'طقم كامل (Complete Denture) - فكين',
  'تبطين طقم (Reline) - مباشر',
  'تبطين طقم (Reline) - مختبري',
  'إصلاح كسر طقم (Denture Repair)',
  'Biopsy',
  'رفع جيب فكي (Sinus Lift)',
  'Frenectomy',
  'فحص دوري شامل',
  'تنظيف أسنان (Scaling)',
  'تلميع الأسنان (Polishing)',
  'تطبيق الفلورايد',
  'تعليمات العناية الفموية',
  'واقي ليلي (Night Guard)'
);

-- Update 'Both' Treatments
UPDATE treatments SET scope = 'both' WHERE name = 'استئصال كيس (Cyst Enucleation)';

-- Delete requested treatments
DELETE FROM treatments WHERE name IN (
  'Snap-on Smile (للفك)',
  'Maryland Bridge (لكل وحدة)',
  'قلع ضرس العقل - مطمور (Impaction)'
);

-- Move Inlay/Onlay to Restorative
UPDATE treatments SET category = 'ترميمي' WHERE name = 'Inlay/Onlay - سيراميك';
