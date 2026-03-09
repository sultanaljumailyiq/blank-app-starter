-- ==============================================================================
-- MISSED TABLES SCHEMA
-- ==============================================================================

-- 1. Promotional Cards
CREATE TABLE IF NOT EXISTS promotional_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    button_text TEXT,
    link TEXT,
    badge_text TEXT,
    active BOOLEAN DEFAULT true,
    section TEXT DEFAULT 'hero',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE promotional_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read promos" ON promotional_cards;
CREATE POLICY "Public read promos" ON promotional_cards FOR SELECT USING (active = true);

-- 2. Favorites (Wishlist)
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage favorites" ON favorites;
CREATE POLICY "Users manage favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
