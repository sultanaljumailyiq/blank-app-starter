-- Create saved_items table for polymorphic saving
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL, -- Logical ID of the item (post, course, etc.)
    item_type TEXT NOT NULL CHECK (item_type IN ('post', 'course', 'webinar', 'resource', 'model')),
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate saves of same item by same user
    UNIQUE(user_id, item_id, item_type)
);

-- Index for fast retrieval by user
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
-- Index for checking if specific item is saved
CREATE INDEX idx_saved_items_lookup ON saved_items(item_id, user_id);

-- Enable RLS
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saved items"
    ON saved_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add saved items"
    ON saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved items"
    ON saved_items FOR DELETE
    USING (auth.uid() = user_id);
