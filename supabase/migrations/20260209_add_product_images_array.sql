-- Add images column to products table for multi-image support
-- Migration: 20260209_add_product_images_array.sql

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added images column to products table';
    END IF;
END $$;
