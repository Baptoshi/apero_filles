import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import { getSpotsStatus } from '@/utils/availability';

interface SpotsIndicatorProps {
  event: Event;
  variant?: 'soft' | 'pill';
  style?: ViewStyle | ViewStyle[];
}

/**
 * Visual hint about an event's remaining capacity.
 * Color follows the shared `getSpotsStatus` helper so the same severity rules are
 * applied on the card, detail page, and CTA.
 */
export function SpotsIndicator({ event, variant = 'soft', style }: SpotsIndicatorProps) {
  const status = getSpotsStatus(event);

  return (
    <View
      style={[
        styles.base,
        variant === 'pill' ? styles.pill : styles.soft,
        { borderColor: status.color },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: status.color }]} />
      <Text style={[styles.label, { color: status.color }]}>{status.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
  },
  soft: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.warmWhite,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.warmWhite,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...Typography.caption,
  },
});
