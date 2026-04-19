import { Lock } from 'lucide-react-native';
import { memo } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Deal } from '@/types/wallet';

interface FeaturedDealCardProps {
  deal: Deal;
  locked: boolean;
  onPress?: () => void;
}

/**
 * Hero "pick of the week" card — full-bleed photo with an editorial overlay.
 *
 * Typographic stack on a darkened gradient:
 *   - "LA SÉLECTION" uppercase tracked label
 *   - Partner name in large Playfair italic
 *   - Tagline (1 short sentence)
 *   - Bottom row: offer badge + area
 *
 * Used at the top of the Bons plans screen to anchor the list and give the
 * page the "curated for you" feel the user asked for.
 */
function FeaturedDealCardComponent({ deal, locked, onPress }: FeaturedDealCardProps) {
  const { partner } = deal;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sélection de la semaine — ${partner.name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ImageBackground
        source={partner.imageUrl ? { uri: partner.imageUrl } : undefined}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <LinearGradient
          colors={['rgba(42, 24, 16, 0.05)', 'rgba(42, 24, 16, 0.78)']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          <Text style={styles.eyebrow}>La sélection</Text>
          {locked ? (
            <View style={styles.lockChip}>
              <Lock size={IconSize.inline} color={Colors.accentContrast} strokeWidth={1.8} />
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{partner.name}</Text>
          {partner.tagline ? (
            <Text style={styles.tagline} numberOfLines={2}>
              {partner.tagline}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerLabel}>{partner.offer}</Text>
            </View>
            {partner.area ? (
              <Text style={styles.area} numberOfLines={1}>
                {partner.area}
              </Text>
            ) : null}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export const FeaturedDealCard = memo(FeaturedDealCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  bg: {
    height: 260,
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  bgImage: {
    borderRadius: Radius.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    ...Typography.small,
    color: Colors.accentContrast,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  lockChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: Spacing.xs,
  },
  name: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 32,
    lineHeight: 36,
    color: Colors.accentContrast,
    letterSpacing: -0.4,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.accentContrast,
    opacity: 0.9,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  offerBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  offerLabel: {
    ...Typography.small,
    color: Colors.accentContrast,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  area: {
    ...Typography.small,
    color: Colors.accentContrast,
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flexShrink: 1,
  },
});
