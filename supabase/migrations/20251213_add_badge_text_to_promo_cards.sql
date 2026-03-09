-- Add badge_text column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promotional_cards' AND column_name = 'badge_text') THEN
        ALTER TABLE promotional_cards ADD COLUMN badge_text TEXT DEFAULT '✨ عروض مميزة';
    END IF;
END $$;

-- Update existing cards with specific badges to match the mock data
UPDATE promotional_cards 
SET badge_text = '✨ عروض مميزة'
WHERE title = 'تجهيزات العيادات الحديثة';

UPDATE promotional_cards 
SET badge_text = 'مستلزمات التعقيم' -- Based on mock: 'مستلزمات التعقيم' was the title, but the badge was likely different or implied. Let's stick to the mock logic:
-- Mock 1: "✨ عروض مميزة"
-- Mock 2: No specific badge shown in previous mock array, but likely user wants one. Let's default to "✨ عروض مميزة" or similar.
-- Wait, looking at StorePage.tsx provided in logs:
-- Card 1 has hardcoded: <span ...>✨ عروض مميزة</span>
-- BUT the loop `promotions.map` uses the SAME hardcoded span for ALL cards inside the loop:
-- line 100: <span ...>✨ عروض مميزة</span>
-- So currently ALL cards get "✨ عروض مميزة".
-- The user request says: "modify the badge like ✨ Special Offers".
-- So I should make this dynamic.

-- Let's set default for all to "✨ عروض مميزة" for now.
UPDATE promotional_cards SET badge_text = '✨ عروض مميزة' WHERE badge_text IS NULL;
