import { LinearGradient } from 'expo-linear-gradient';
import { ResizeMode, Video } from 'expo-av';
import { useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface WelcomeStepProps {
  onNext: () => void;
}

/**
 * Onboarding welcome — cinematic looping video behind a dark gradient floor.
 *
 * The mp4 covers the full frame, autoplays silently in an infinite loop, and
 * a bottom-anchored dark gradient (`expo-linear-gradient`) keeps the tagline
 * + CTA readable without dimming the whole image. Logo stays small at the
 * top over the clean area of the video.
 */
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  // Ref kept in case we need to imperatively pause / seek later — the native
  // `isLooping` + `shouldPlay` props handle the happy path on their own.
  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.root}>
      <Video
        ref={videoRef}
        source={require('../../assets/videos/onboarding.mp4')}
        // `absoluteFill` + CONTAIN shows the full video ; the scale pulls it
        // back a touch so the content feels less tight while the layout still
        // reads as full-screen (the root's black background + gradient cover
        // the small inset that appears around the video).
        style={[StyleSheet.absoluteFill, styles.video]}
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        shouldPlay
        isMuted
        // Web <video> requires muted for autoplay to be allowed by browsers —
        // matches iOS Safari / Chrome behavior.
        useNativeControls={false}
      />

      {/* Bottom-anchored dark gradient so the tagline + CTA pop without
          washing out the top half of the video. */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          'rgba(42, 24, 16, 0.35)',
          'rgba(20, 10, 5, 0.82)',
          'rgba(15, 8, 4, 0.95)',
        ]}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Les Apéros Filles"
          />
        </View>

        <View style={styles.bottom}>
          <View style={styles.taglineWrap}>
            <Text style={styles.tagline}>
              Ta bande de <Text style={styles.taglineAccent}>copines</Text>,{'\n'}
              près de chez toi.
            </Text>
            <Text style={styles.description}>
              Des apéros, du sport, des ateliers, des talks —{' '}
              <Text style={styles.descriptionAccent}>entre filles</Text>, dans 5
              villes.
            </Text>
          </View>

          <Button
            label="Bienvenue dans ta bande de copines."
            onPress={onNext}
            accessibilityLabel="Commencer l'onboarding"
          />
          <Text style={styles.footerHint}>Appuie pour commencer</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  video: {
    // Pulls the video back so the framing feels less tight without losing
    // the full-screen feel (the root's black background fills the inset).
    transform: [{ scale: 0.78 }],
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  logo: {
    width: 140,
    height: 56,
    // Dropped shadow so the logo holds up on any frame of the looping video.
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  bottom: {
    gap: Spacing.lg,
  },
  taglineWrap: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  tagline: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    color: Colors.white,
    letterSpacing: -0.4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  taglineAccent: {
    fontStyle: 'italic',
    color: Colors.brandSoft,
  },
  description: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionAccent: {
    fontStyle: 'italic',
    color: Colors.brandSoft,
  },
  footerHint: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
