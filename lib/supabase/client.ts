import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseBrowserClient: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(url && anonKey && !url.includes('placeholder'));
  return { url, anonKey, isConfigured };
};

/**
 * Returns a singleton browser Supabase client or null if not configured.
 */
export const createBrowserSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseBrowserClient;
};
