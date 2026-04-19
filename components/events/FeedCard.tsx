import { Heart, MapPin } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FomoPill } from '@/components/events/FomoPill';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AvatarTints, Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Event } from '@/types/event';
import type { MembershipTier } from '@/types/user';
import { formatDatePieces } from '@/utils/date';
import { getEventFomoBadge } from '@/utils/fomo';
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
 *   1. Thumbnail photo with:
 *        - a centered FOMO pill at the top (countdown / low-spots urgency)
 *        - a heart bookmark button top-right
 *   2. An eyebrow strap (category · date · time) in terracotta.
 *   3. A big Playfair title.
 *   4. A footer row: location (with MapPin icon) on the left, price block on
 *      the right. For free users the member price is emphasised as a peach
 *      pill so the subscription upside is always in view.
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
  const fomo = useMemo(() => getEventFomoBadge(event), [event]);

  return (
    <SpotlightCard
      style={styles.card}
      radius={Radius.xl}
      spotlightColor="rgba(194, 65, 12, 0.14)"
      spotlightSize={300}
      maxOpacity={0.45}
    >
      {/*
        Two sibling `Pressable`s inside the SpotlightCard :
          1. `cardTap` — the main tap area, wraps the visual content.
          2. `heartBtn` — absolute-positioned on top so it wins hit-testing
             in its small corner area.
        Making them siblings (and not nested) avoids the DOM
        `<button>` cannot appear as a descendant of `<button>` warning on web.
      */}
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

          {fomo ? (
            <View style={styles.fomoWrap} pointerEvents="none">
              <FomoPill badge={fomo} />
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>
            {event.category.toUpperCase()} · {pieces.day} {pieces.month.toUpperCase()} · {event.time}
          </Text>

          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.locationRow}>
              <MapPin
                size={IconSize.inline}
                color={Colors.textTertiary}
                strokeWidth={1.8}
              />
              <Text style={styles.location} numberOfLines={1}>
                {event.location}
              </Text>
            </View>

            <PriceBlock tier={tier} price={price} />
          </View>
        </View>
      </Pressable>

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
        <Heart
          size={IconSize.content + 4}
          color={bookmarked ? Colors.accent : Colors.white}
          fill={bookmarked ? Colors.accent : 'transparent'}
          strokeWidth={2}
        />
      </Pressable>
    </SpotlightCard>
  );
}

/**
 * Price display block — plain numerals, right-aligned for easy scanning.
 *
 *   - Free tier with discount → three-line stack: strike full price · big
 *                                terracotta member price · "membre" tag.
 *                                Maximum readability, no pill, no italic.
 *   - Member / faithful       → strike full price + member price, stacked.
 *   - No discount             → just the amount.
 */
function PriceBlock({
  tier,
  price,
}: {
  tier: MembershipTier;
  price: ReturnType<typeof getEventPrice>;
}) {
  if (tier === 'free' && price.hasDiscount) {
    return (
      <View style={styles.priceBlock}>
        <Text style={styles.priceStrike}>{price.priceFullLabel}</Text>
        <Text style={styles.priceMember}>{price.priceMemberLabel}</Text>
        <Text style={styles.priceTag}>Membre</Text>
      </View>
    );
  }

  return (
    <View style={styles.priceBlock}>
      {price.strikethroughLabel ? (
        <Text style={styles.priceStrike}>{price.strikethroughLabel}</Text>
      ) : null}
      <Text style={styles.price}>{price.label}</Text>
    </View>
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
  fomoWrap: {
    position: 'absolute',
    top: Spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  likeAbs: {
    position: 'absolute',
    // Card has `padding: Spacing.md` on the main tap wrapper + the thumb
    // starts at the top ; we offset by the same amount so the heart sits at
    // the top-right of the photo (matching the previous nested layout).
    top: Spacing.md + Spacing.md,
    right: Spacing.md + Spacing.md,
    padding: 6,
  },
  likePressed: {
    opacity: 0.7,
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
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  locationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceStrike: {
    ...Typography.small,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 24,
    color: Colors.text,
    marginTop: 2,
  },
  priceMember: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 26,
    color: Colors.accent,
    marginTop: 2,
  },
  priceTag: {
    ...Typography.small,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
