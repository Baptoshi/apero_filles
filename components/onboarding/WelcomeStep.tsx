import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface WelcomeStepProps {
  onNext: () => void;
}

/**
 * Onboarding welcome — logo + editorial tagline + Apple-style CTA.
 *
 * Tagline plays with Playfair italic accents on a couple of words so the
 * page feels warm and editorial without being loud.
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

      <View style={styles.taglineWrap}>
        <Text style={styles.tagline}>
          Ta bande de <Text style={styles.taglineAccent}>copines</Text>,{'\n'}
          près de chez toi.
        </Text>
        <Text style={styles.description}>
          Des apéros, du sport, des ateliers, des talks —{' '}
          <Text style={styles.descriptionAccent}>entre filles</Text>, dans 5 villes.
        </Text>
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
    maxWidth: 360,
    maxHeight: 360,
  },
  taglineWrap: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  tagline: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    color: Colors.text,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  taglineAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  footerHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
