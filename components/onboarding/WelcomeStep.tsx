import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface WelcomeStepProps {
  onNext: () => void;
}

/**
 * Onboarding welcome — full-screen brand logo + Apple-like pill CTA.
 *
 * The logo is loaded from `assets/images/logo.png` and rendered with
 * `resizeMode="contain"` so the image always sits cleanly within the screen
 * regardless of device aspect ratio. A soft cream background keeps the
 * composition warm even before the image paints in.
 */
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <View style={styles.root}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Les Apéros Filles"
        />
      </View>

      <View style={styles.footer}>
        <Button
          label="Bienvenue dans ta bande de copines."
          onPress={onNext}
          accessibilityLabel="Commencer l'onboarding"
        />
        <Text style={styles.footerHint}>Appuie pour commencer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  logo: {
    width: '100%',
    height: '100%',
    maxWidth: 520,
    maxHeight: 520,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  footerHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
