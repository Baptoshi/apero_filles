import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PhoneFrame } from '@/components/layout/PhoneFrame';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <PhoneFrame>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar style="dark" backgroundColor={Colors.background} />
            <AuthGate />
          </View>
        </SafeAreaProvider>
      </PhoneFrame>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    const first = segments[0] ?? '';
    const inAuthGroup = first === '(auth)';

    // Not onboarded → force into the onboarding flow.
    if (!hasCompletedOnboarding && !inAuthGroup) {
      router.replace('/(auth)/onboarding');
      return;
    }
    // Onboarded but still on the auth group → redirect into the app.
    if (hasCompletedOnboarding && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Otherwise let the user navigate freely (event/[id], fille/[id], saved, subscribe…).
  }, [hasCompletedOnboarding, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="event/[id]"
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="fille/[id]"
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen
        name="saved"
        options={{ animation: 'slide_from_right', presentation: 'card' }}
      />
      <Stack.Screen name="subscribe" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
