import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// Found at: https://supabase.com/dashboard → Project Settings → API
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist sessions in AsyncStorage for React Native
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Convenience re-export for typed access
export type { User, Session } from '@supabase/supabase-js';
