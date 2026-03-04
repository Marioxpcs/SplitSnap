import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// Found at: https://supabase.com/dashboard → Project Settings → API
const SUPABASE_URL = 'https://vqymfuawdzsvyzwnoogg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeW1mdWF3ZHpzdnl6d25vb2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzY1OTksImV4cCI6MjA4ODIxMjU5OX0.N2nKUx9fMFXE18ZFQwYMUFc33KitR6mOxhK93oYwGQU'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist sessions in AsyncStorage for React Native
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Convenience re-export for typed access
export type { User, Session } from '@supabase/supabase-js';
