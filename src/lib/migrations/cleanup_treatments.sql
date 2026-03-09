-- Delete deprecated restorative treatments
DELETE FROM treatments WHERE name IN (
  'حشوة ضوئية (Composite) - 3 أسطح',
  'حشوة ضوئية (Composite) - سطحين',
  'حشوة عنق السن (Class V)',
  'إصلاح حشوة قديمة',
  'حشوة ساندويش (Sandwich Tech)',
  'حشوة Inlay (Direct)',
  'ترميم كسر بسيط',
  'حشوة Onlay (Direct)',
  'إعادة تشكيل السن (Cosmetic Contouring)'
);

-- Update Apicoectomy to Surgery category and ensure it is single session
UPDATE treatments
SET category = 'جراحة', expected_sessions = 1
WHERE name = 'جراحة ذروة الجذر (Apicoectomy)';
