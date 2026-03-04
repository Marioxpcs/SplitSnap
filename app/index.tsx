import { Redirect } from 'expo-router';

// The root _layout.tsx handles auth-aware redirection.
// This catch-all ensures a bare '/' visit goes to the tabs immediately.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
