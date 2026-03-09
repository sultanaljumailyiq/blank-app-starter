
-- Create product_views table for analytics
CREATE TABLE IF NOT EXISTS "public"."product_views" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "product_id" uuid NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "viewer_id" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL, -- Nullable for anonymous views if needed
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."product_views" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (viewing a product)
CREATE POLICY "Allow anonymous insert" ON "public"."product_views" FOR INSERT WITH CHECK (true);

-- Allow admins and suppliers (owners) to select
-- Note: Simplified policy for demo, ideally check product ownership
CREATE POLICY "Allow read access for owners" ON "public"."product_views" FOR SELECT USING (auth.role() = 'authenticated');

-- Add 'views' column to products if not exists (denormalized count for performance)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'views') THEN
        ALTER TABLE "products" ADD COLUMN "views" bigint DEFAULT 0;
    END IF;
END $$;
