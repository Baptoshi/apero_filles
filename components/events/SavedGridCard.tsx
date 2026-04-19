import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarTints, Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import { formatDatePieces, isUpcoming } from '@/utils/date';

interface SavedGridCardProps {
  event: Event;
  onPress?: () => void;
}

/**
 * Compact square card for the Saved / favorites grid.
 *
 * One photo (1:1), a small date + category strap in the top-left corner
 * for at-a-glance scanning, and a 2-line Playfair title under the image.
 * Past events get a subtle muted overlay + "Passé" tag — still visible,
 * clearly distinguished from upcoming ones.
 */
function SavedGridCardComponent({ event, onPress }: SavedGridCardProps) {
  const pieces = formatDatePieces(event.date);
  const upcoming = isUpcoming(event.date);
  const fallbackTint = AvatarTints[event.imageGradient];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.thumbWrap}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.thumb}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.thumb, { backgroundColor: fallbackTint }]} />
        )}

        {!upcoming ? (
          <>
            <View style={styles.pastWash} pointerEvents="none" />
            <View style={styles.pastChip} pointerEvents="none">
              <Text style={styles.pastChipLabel}>Passé</Text>
            </View>
          </>
        ) : null}

        <View style={styles.dateStrap} pointerEvents="none">
          <Text style={styles.dateDay}>{pieces.day}</Text>
          <Text style={styles.dateMonth}>{pieces.month.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
    </Pressable>
  );
}

export const SavedGridCard = memo(SavedGridCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbWrap: {
    position: 'relative',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  pastWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 24, 16, 0.35)',
  },
  pastChip: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(251, 246, 238, 0.88)',
  },
  pastChipLabel: {
    ...Typography.small,
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateStrap: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(251, 246, 238, 0.92)',
    alignItems: 'center',
  },
  dateDay: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    lineHeight: 18,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  dateMonth: {
    ...Typography.small,
    color: Colors.accent,
    letterSpacing: 0.6,
  },
  textBlock: {
    paddingHorizontal: 2,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    lineHeight: 20,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  location: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
});
