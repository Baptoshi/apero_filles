import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgeStep } from '@/components/onboarding/AgeStep';
import { AuthStep } from '@/components/onboarding/AuthStep';
import { CityStep } from '@/components/onboarding/CityStep';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { NameStep } from '@/components/onboarding/NameStep';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAuthStore, type AuthMode } from '@/stores/useAuthStore';

/**
 * Onboarding flow :
 *
 *   welcome  →  auth  →  (sign-up)  name → city → age → interests  →  (tabs)
 *                     →  (sign-in)  direct login                    →  (tabs)
 *
 * The progress bar only runs on the profile-building steps (name / city /
 * age / interests). Welcome + auth are treated as "pre-onboarding" gates.
 */
type StepId = 'welcome' | 'auth' | 'name' | 'city' | 'age' | 'interests';

const profileSteps: StepId[] = ['name', 'city', 'age', 'interests'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>('welcome');
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const login = useAuthStore((s) => s.login);

  const goTo = (next: StepId) => setStep(next);

  const profileIndex = profileSteps.indexOf(step);
  const showProgress = profileIndex !== -1;
  const progress =
    profileIndex === -1 ? 0 : (profileIndex + 1) / profileSteps.length;

  const goNext = () => {
    const idx = profileSteps.indexOf(step);
    const next = idx === -1 ? null : profileSteps[idx + 1];
    if (next) goTo(next);
  };

  const goBackProfile = () => {
    const idx = profileSteps.indexOf(step);
    if (idx > 0) {
      const prev = profileSteps[idx - 1];
      if (prev) goTo(prev);
      return;
    }
    // Back from the first profile step → return to auth.
    goTo('auth');
  };

  const handleAuthenticated = (mode: AuthMode) => {
    if (mode === 'sign-in') {
      // Existing account → hydrate from mock and drop into the app.
      login();
      router.replace('/(tabs)');
      return;
    }
    // Sign-up → continue to collect profile info.
    goTo('name');
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={step === 'welcome' ? [] : ['top', 'bottom']}
    >
      {showProgress ? (
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]}
          />
        </View>
      ) : null}

      <Animated.View
        key={step}
        entering={SlideInRight.duration(260)}
        exiting={SlideOutLeft.duration(200)}
        style={styles.stepContainer}
      >
        {step === 'welcome' ? (
          <Animated.View style={styles.fill} entering={FadeIn} exiting={FadeOut}>
            <WelcomeStep onNext={() => goTo('auth')} />
          </Animated.View>
        ) : null}

        {step === 'auth' ? (
          <AuthStep
            onAuthenticated={handleAuthenticated}
            onBack={() => goTo('welcome')}
          />
        ) : null}

        {step === 'name' ? (
          <NameStep onNext={goNext} onBack={goBackProfile} />
        ) : null}

        {step === 'city' ? (
          <CityStep onNext={goNext} onBack={goBackProfile} />
        ) : null}

        {step === 'age' ? (
          <AgeStep onNext={goNext} onBack={goBackProfile} />
        ) : null}

        {step === 'interests' ? (
          <InterestsStep onComplete={finish} onBack={goBackProfile} />
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressTrack: {
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
