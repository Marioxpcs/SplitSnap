import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';
import type { User } from '../types';

function toAppUser(authUser: NonNullable<Session['user']>): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName:
      authUser.user_metadata?.display_name ??
      authUser.email?.split('@')[0] ??
      'User',
    avatarUrl: authUser.user_metadata?.avatar_url,
    createdAt: authUser.created_at,
  };
}

function useAuthGuard(session: Session | null, initializing: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inProtectedArea = segments[0] === '(tabs)';

    if (!session && inProtectedArea) {
      router.replace('/auth');
    } else if (session && !inProtectedArea) {
      router.replace('/(tabs)');
    }
  }, [session, initializing, segments, router]);
}

export default function RootLayout() {
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setCurrentUser(s?.user ? toAppUser(s.user) : null);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setCurrentUser(s?.user ? toAppUser(s.user) : null);
      }
    );

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  useAuthGuard(session, initializing);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="split"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Review & Split',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
});
