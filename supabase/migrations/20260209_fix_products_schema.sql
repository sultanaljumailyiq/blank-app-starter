-- Add missing columns to products table for supplier features
-- Migration: 20260209_fix_products_schema.sql

-- Add discount column if not exists (for percentage-based discounts)
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;

-- Add is_featured column if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ensure is_active column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add views column for tracking product views
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add rating column
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- Add reviews_count column
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
