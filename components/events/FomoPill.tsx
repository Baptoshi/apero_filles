import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { FomoBadge } from '@/utils/fomo';

interface FomoPillProps {
  badge: FomoBadge;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Small editorial countdown pill — shared between the feed card (rendered on
 * top of the photo) and the event detail page (below the poster).
 *
 * Two tones:
 *   - `urgent` → solid terracotta, white label. Used for "En cours" and
 *                 same-day ("Dans Xh").
 *   - `soon`   → frosted white, warm-brown label. Used for "Demain" and
 *                 further out.
 *
 * Sentence case, medium weight, minimal padding — meant to feel like a
 * small caption rather than a chunky badge.
 */
export function FomoPill({ badge, style }: FomoPillProps) {
  const isUrgent = badge.tone === 'urgent';
  return (
    <View
      style={[
        styles.pill,
        isUrgent ? styles.pillUrgent : styles.pillSoon,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isUrgent ? styles.labelUrgent : styles.labelSoon,
        ]}
        numberOfLines={1}
      >
        {badge.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    maxWidth: '80%',
  },
  pillUrgent: {
    backgroundColor: Colors.accent,
  },
  pillSoon: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  labelUrgent: {
    color: Colors.accentContrast,
  },
  labelSoon: {
    color: Colors.text,
  },
});
