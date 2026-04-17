import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgeStep } from '@/components/onboarding/AgeStep';
import { CityStep } from '@/components/onboarding/CityStep';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/useAuthStore';

type StepId = 'welcome' | 'city' | 'age' | 'interests';

const order: StepId[] = ['welcome', 'city', 'age', 'interests'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>('welcome');
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const goTo = (next: StepId) => setStep(next);

  const currentIndex = order.indexOf(step);
  const progress = currentIndex / (order.length - 1);

  const goNext = () => {
    const next = order[currentIndex + 1];
    if (next) goTo(next);
  };

  const goBack = () => {
    const prev = order[currentIndex - 1];
    if (prev) goTo(prev);
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {step !== 'welcome' ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
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
            <WelcomeStep onNext={() => goTo('city')} />
          </Animated.View>
        ) : null}
        {step === 'city' ? <CityStep onNext={goNext} onBack={goBack} /> : null}
        {step === 'age' ? <AgeStep onNext={goNext} onBack={goBack} /> : null}
        {step === 'interests' ? (
          <InterestsStep onComplete={finish} onBack={goBack} />
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  progressTrack: {
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.lg,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.blush,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.orange,
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
