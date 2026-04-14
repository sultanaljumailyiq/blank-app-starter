import { createClient, SupabaseClient } from '@supabase/supabase-js'

// External Supabase project credentials
const EXTERNAL_SUPABASE_URL = 'https://nhueyaeyutfmadbgghfe.supabase.co'
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWV5YWV5dXRmbWFkYmdnaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwNTYsImV4cCI6MjA4NDQxMzA1Nn0.56MIbpOtVu9b_fwEyo-hvlxGxA_E5c-nU7q1MSfTg-g'

// Use globalThis to survive Vite HMR (prevents duplicate clients on hot-reload)
const GLOBAL_KEY = '__supabase_external_client__' as const

if (!(globalThis as any)[GLOBAL_KEY]) {
  (globalThis as any)[GLOBAL_KEY] = createClient(
    EXTERNAL_SUPABASE_URL,
    EXTERNAL_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn()
        },
      }
    }
  )
}

export const supabase: SupabaseClient = (globalThis as any)[GLOBAL_KEY]

// Export tables type helper if needed
export type Tables = any;
