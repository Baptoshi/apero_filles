import { Lock } from 'lucide-react-native';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Deal } from '@/types/wallet';

interface WalletCardProps {
  deal: Deal;
  locked: boolean;
  onPress?: () => void;
}

/**
 * Editorial deal card — thumbnail on the left, typographic stack on the right.
 *
 * The photo grounds the deal (place / mood) while the text keeps the magazine
 * feel: small uppercase meta line, Playfair name, offer + neighborhood. The
 * lock indicator is inlined in the meta row so free members still see the
 * full listing, just without the QR.
 */
function WalletCardComponent({ deal, locked, onPress }: WalletCardProps) {
  const { partner } = deal;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${partner.name} — ${partner.offer}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {partner.imageUrl ? (
        <Image source={{ uri: partner.imageUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}

      <View style={styles.body}>
        <Text style={styles.eyebrow} numberOfLines={1}>
          {partner.category}
          {partner.area ? ` · ${partner.area}` : ''}
        </Text>

        <Text style={styles.title} numberOfLines={1}>
          {partner.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.offer} numberOfLines={1}>
            {partner.offer}
          </Text>
          {locked ? (
            <View style={styles.lockInline}>
              <Lock size={IconSize.inline} color={Colors.textTertiary} strokeWidth={1.8} />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const WalletCard = memo(WalletCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.65,
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
  },
  thumbFallback: {
    backgroundColor: Colors.surfaceMuted,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...Typography.small,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    lineHeight: 24,
    color: Colors.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  offer: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  lockInline: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
