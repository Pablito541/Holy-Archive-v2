import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
    : null;

// Export createClient function for hooks that need a fresh client instance
export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
        throw new Error('Supabase URL or Anon Key not configured');
    }
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
