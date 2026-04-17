import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/useAuthStore';

export default function Index() {
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  return <Redirect href="/(tabs)" />;
}
