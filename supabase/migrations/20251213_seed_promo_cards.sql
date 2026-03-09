-- Add section column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promotional_cards' AND column_name = 'section') THEN
        ALTER TABLE promotional_cards ADD COLUMN section TEXT DEFAULT 'home_hero';
    END IF;
END $$;

-- Clear existing cards to avoid duplicates (optional, but safe for dev)
TRUNCATE promotional_cards;

-- Insert the 3 specific cards requested by the user
INSERT INTO promotional_cards (title, description, image, button_text, link, active, section) VALUES
(
    'تجهيزات العيادات الحديثة',
    'خصم يصل إلى 20% على كراسي الأسنان',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80',
    'تصفح العروض',
    '/store',
    true,
    'home_hero'
),
(
    'مستلزمات التعقيم',
    'أفضل أجهزة التعقيم لضمان سلامة مرضاك',
    'https://images.unsplash.com/photo-1588776813186-6f4d5c6f4c8a?w=1600&auto=format&fit=crop&q=80',
    'تصفح العروض',
    '/store',
    true,
    'home_hero'
),
(
    'عروض أدوات تقويم الأسنان',
    'اشترِ مجموعة واحصل على خصم إضافي',
    'https://images.unsplash.com/photo-1598256989494-02630f6dc069?w=1600&auto=format&fit=crop&q=80',
    'تصفح العروض',
    '/store',
    true,
    'home_hero'
);
