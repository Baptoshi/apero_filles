import { Heart } from 'lucide-react-native';
import { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AvatarTints, Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import type { MembershipTier } from '@/types/user';
import { formatDatePieces } from '@/utils/date';
import { getEventPrice } from '@/utils/price';

interface FeedCardProps {
  event: Event;
  tier: MembershipTier;
  bookmarked: boolean;
  onPress?: () => void;
  onToggleBookmark?: () => void;
}

/**
 * Event feed card — editorial layout wrapped in a `SpotlightCard`.
 *
 * Structure (inspired by the react-bits SpotlightCard spec, adapted to our DA):
 *   - Cream surface with a soft warm border and the spotlight on top
 *   - A single photo thumbnail (the event's Unsplash image) with rounded corners
 *   - An eyebrow strap (category · date · time) in terracotta
 *   - A big Playfair title
 *   - Secondary row: location + price (plus the free-tier saving hint)
 *   - Bookmark as a small icon in the corner of the thumbnail
 */
function FeedCardComponent({
  event,
  tier,
  bookmarked,
  onPress,
  onToggleBookmark,
}: FeedCardProps) {
  const pieces = formatDatePieces(event.date);
  const price = getEventPrice(event, tier);
  const fallbackTint = AvatarTints[event.imageGradient];

  return (
    <SpotlightCard
      style={styles.card}
      radius={Radius.xl}
      spotlightColor="rgba(194, 65, 12, 0.14)"
      spotlightSize={300}
      maxOpacity={0.45}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={event.title}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
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

          <Pressable
            onPress={onToggleBookmark}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            accessibilityState={{ selected: bookmarked }}
            hitSlop={12}
            style={({ pressed }) => [
              styles.likeAbs,
              pressed && styles.likePressed,
            ]}
          >
            <View style={styles.likeIcon}>
              <Heart
                size={IconSize.content + 4}
                color={bookmarked ? Colors.accent : Colors.white}
                fill={bookmarked ? Colors.accent : 'transparent'}
                strokeWidth={1.8}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>
            {event.category.toUpperCase()} · {pieces.day} {pieces.month.toUpperCase()} · {event.time}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.location} numberOfLines={1}>
              {event.location} — {event.city}
            </Text>
            <View style={styles.priceBlock}>
              {price.strikethroughLabel ? (
                <Text style={styles.priceOld}>{price.strikethroughLabel}</Text>
              ) : null}
              <Text style={styles.price}>{price.label}</Text>
            </View>
          </View>
          {price.memberHint ? (
            <Text style={styles.priceHint}>{price.memberHint}</Text>
          ) : null}
        </View>
      </Pressable>
    </SpotlightCard>
  );
}

export const FeedCard = memo(FeedCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
  },
  pressable: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  pressed: {
    opacity: 0.92,
  },
  thumbWrap: {
    position: 'relative',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    aspectRatio: 1.6,
    backgroundColor: Colors.surfaceMuted,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  likeAbs: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 4,
  },
  likePressed: {
    opacity: 0.7,
  },
  likeIcon: {
    // Soft shadow so the white heart stays legible on any photo.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  body: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  eyebrow: {
    ...Typography.small,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  priceOld: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  price: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  priceHint: {
    ...Typography.small,
    color: Colors.accent,
    marginTop: 2,
  },
});
