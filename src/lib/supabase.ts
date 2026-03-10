// Re-export from the auto-generated client, cast to any to bypass
// strict table typing until DB schema is fully synced
import { supabase as _supabase } from '@/integrations/supabase/client';

export const supabase = _supabase as any;

// Export tables type helper if needed
export type Tables = any;
