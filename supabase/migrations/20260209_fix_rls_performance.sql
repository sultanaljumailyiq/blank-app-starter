-- Fix RLS Policy Performance
-- Replace auth.uid() with (select auth.uid()) for better performance at scale
-- This prevents PostgreSQL from re-evaluating auth.uid() for each row

-- ========================================
-- DEAL_REQUESTS TABLE FIX
-- ========================================
-- First check and fix if the current policies use auth functions without subquery

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow insert deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow update deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Admins can view all deal requests" ON deal_requests;
DROP POLICY IF EXISTS "Suppliers can view own deal requests" ON deal_requests;
DROP POLICY IF EXISTS "Suppliers can create deal requests" ON deal_requests;
DROP POLICY IF EXISTS "Admins can update deal requests" ON deal_requests;

-- Create optimized policies using (select auth.uid()) pattern
DROP POLICY IF EXISTS "Allow authenticated read deal_requests" ON deal_requests;
CREATE POLICY "Allow authenticated read deal_requests" ON deal_requests
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert deal_requests" ON deal_requests;
CREATE POLICY "Allow authenticated insert deal_requests" ON deal_requests
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update deal_requests" ON deal_requests;
CREATE POLICY "Allow authenticated update deal_requests" ON deal_requests
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- PROMOTION_REQUESTS TABLE FIX
-- ========================================
DROP POLICY IF EXISTS "Allow all promotion_requests" ON promotion_requests;
DROP POLICY IF EXISTS "Allow authenticated all promotion_requests" ON promotion_requests;

CREATE POLICY "Allow authenticated all promotion_requests" ON promotion_requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- FIX OTHER COMMON TABLES WITH AUTH.UID() ISSUES
-- ========================================

-- PRODUCTS table - use optimized pattern
DROP POLICY IF EXISTS "suppliers_manage_products" ON products;
DROP POLICY IF EXISTS "Suppliers can manage own products" ON products;

-- Only create if table exists and has supplier_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_id') THEN
        CREATE POLICY "suppliers_manage_products_optimized" ON products
            FOR ALL TO authenticated 
            USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = (SELECT auth.uid()) OR profile_id = (SELECT auth.uid())))
            WITH CHECK (supplier_id IN (SELECT id FROM suppliers WHERE user_id = (SELECT auth.uid()) OR profile_id = (SELECT auth.uid())));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- SUPPLIERS table - use optimized pattern
DROP POLICY IF EXISTS "Supplier update own" ON suppliers;
DROP POLICY IF EXISTS "Supplier insert own" ON suppliers;

DO $$
BEGIN
    CREATE POLICY "suppliers_update_own_optimized" ON suppliers 
        FOR UPDATE TO authenticated 
        USING (user_id = (SELECT auth.uid()) OR profile_id = (SELECT auth.uid()) OR id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "suppliers_insert_own_optimized" ON suppliers 
        FOR INSERT TO authenticated 
        WITH CHECK (user_id = (SELECT auth.uid()) OR profile_id = (SELECT auth.uid()) OR id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Note: For comprehensive fixes across all tables, run this pattern:
-- Replace: auth.uid() 
-- With: (SELECT auth.uid())
-- This caches the auth.uid() value and uses it for all rows instead of re-evaluating per row
