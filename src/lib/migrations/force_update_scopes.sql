-- Update Orthodontics to General
UPDATE treatments SET scope = 'general' WHERE category = 'تقويم' OR category = 'Orthodontics';

-- Update specific treatments to General
UPDATE treatments SET scope = 'general' WHERE name IN (
    'تبييض منزلي (Kit)',
    'تبييض ليزر (عيادة)',
    'إغلاق فلجة بالكومبوزيت',
    'سنايل آرت (Snap-on)',
    'Botox (Smile correction)',
    'Fillers (Lip)',
    'Snap-on Smile (للفك)',
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

-- Update Cyst Enucleation to Both
UPDATE treatments SET scope = 'both' WHERE name = 'استئصال كيس (Cyst Enucleation)';

-- Ensure any missed ones from the list are covered (fuzzy matches if exact names differ slightly?)
-- For now, relying on exact names as they seem to match the seed data.
