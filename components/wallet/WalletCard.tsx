import { Lock } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Deal } from '@/types/wallet';
import { formatShortDate } from '@/utils/date';

interface WalletCardProps {
  deal: Deal;
  locked: boolean;
  onPress?: () => void;
}

/**
 * Deal card — magazine-classifieds style.
 *
 * No border, no background fill — the card is a purely typographic block.
 * The Wallet screen uses hairlines between items to give the list its
 * editorial rhythm, keeping the surface layer-free.
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
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {partner.category.toUpperCase()} · {partner.city.toUpperCase()}
        </Text>
        {locked ? (
          <View style={styles.lockInline}>
            <Lock size={IconSize.inline} color={Colors.textTertiary} strokeWidth={1.8} />
            <Text style={styles.lockLabel}>Membres</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>{partner.name}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.offer}>{partner.offer}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.validity}>
          Jusqu'au {formatShortDate(partner.validUntil)}
        </Text>
      </View>
    </Pressable>
  );
}

export const WalletCard = memo(WalletCardComponent);

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    ...Typography.small,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lockInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockLabel: {
    ...Typography.small,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.text,
    letterSpacing: -0.4,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 2,
  },
  offer: {
    ...Typography.body,
    color: Colors.text,
  },
  dot: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  validity: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
