import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AvatarTints, Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import { formatDatePieces } from '@/utils/date';

interface PosterBlockProps {
  event: Event;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle | ViewStyle[];
}

/**
 * Editorial poster block for an event. Used as the visual stand-in for a
 * photo — single vivid color block with typography: small category label on
 * top, big day number + month at the bottom.
 *
 * Sizes:
 *   sm — compact cover on feed cards (~104)
 *   md — medium cover in lists (~180)
 *   lg — full-width hero on detail pages
 */
export function PosterBlock({ event, size = 'md', style }: PosterBlockProps) {
  const tint = AvatarTints[event.imageGradient];
  const pieces = formatDatePieces(event.date);
  const s = sizeMap[size];

  return (
    <View
      style={[
        styles.block,
        { backgroundColor: tint, padding: s.padding, borderRadius: s.radius },
        size === 'lg' && styles.blockLarge,
        style,
      ]}
    >
      <Text style={[styles.category, { fontSize: s.category }]} numberOfLines={1}>
        {event.category}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.day, { fontSize: s.day, lineHeight: s.day }]}>
          {pieces.day}
        </Text>
        <Text style={[styles.month, { fontSize: s.month }]}>
          {pieces.month.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const sizeMap = {
  sm: { padding: Spacing.md, radius: Radius.md, category: 10, day: 36, month: 11 },
  md: { padding: Spacing.lg, radius: Radius.lg, category: 11, day: 56, month: 12 },
  lg: { padding: Spacing.xxl, radius: Radius.xl, category: 12, day: 120, month: 18 },
} as const;

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  blockLarge: {
    minHeight: 360,
  },
  category: {
    fontFamily: FontFamily.semiBold,
    color: Colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  footer: {
    gap: 0,
  },
  day: {
    fontFamily: FontFamily.display,
    color: Colors.white,
    letterSpacing: -1.5,
  },
  month: {
    ...Typography.small,
    color: Colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
});
