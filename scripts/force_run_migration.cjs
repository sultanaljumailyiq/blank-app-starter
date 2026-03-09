const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    user: 'postgres.nhueyaeyutfmadbgghfe',
    password: '10770$ULTAn0770',
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

const client = new Client(DB_CONFIG);

const sql = `
-- Create Follows Table for Directional Relationships
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can read follows (to count followers/following)
DROP POLICY IF EXISTS "Anyone can read follows" ON follows;
CREATE POLICY "Anyone can read follows" ON follows FOR SELECT USING (true);

-- 2. Authenticated users can follow others (insert)
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

-- 3. Users can unfollow (delete their own follow record)
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows FOR DELETE
USING (auth.uid() = follower_id);
`;

async function runForceMigration() {
    try {
        console.log('Connecting to DB...');
        await client.connect();
        console.log('Running SQL...');
        await client.query(sql);
        console.log("Migration applied successfully!");
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

runForceMigration();
