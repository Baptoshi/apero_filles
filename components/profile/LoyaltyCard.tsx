import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { LoyaltyProgress } from '@/utils/loyalty';

interface LoyaltyCardProps {
  progress: LoyaltyProgress;
  eventsAttended: number;
}

/**
 * Loyalty card — plain, no icon chrome. Editorial level name + progress bar.
 */
export function LoyaltyCard({ progress, eventsAttended }: LoyaltyCardProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress.progress, { duration: 600 });
  }, [progress.progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(width.value * 100)}%`,
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Niveau actuel</Text>
      <Text style={styles.level}>{progress.current.name}</Text>
      <Text style={styles.count}>
        {eventsAttended} événement{eventsAttended > 1 ? 's' : ''} au compteur
      </Text>

      <View style={styles.track} accessibilityRole="progressbar">
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>

      <Text style={styles.progressLabel}>
        {progress.next && progress.toNext !== null
          ? `Encore ${progress.toNext} événement${progress.toNext > 1 ? 's' : ''} avant « ${progress.next.name} »`
          : 'Tu as atteint le plus haut niveau. Respect.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  level: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 2,
  },
  count: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.accent,
    marginTop: Spacing.sm,
  },
});
