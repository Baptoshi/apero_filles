import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface ClubUpsellCardProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * "Rejoins le club" teaser card — warm surface, editorial type, one arrow.
 *
 * Used everywhere we want to nudge a free user toward the subscribe screen
 * (Home bottom, Discover, Wallet). Designed to feel inviting without
 * shouting: soft cream surface, subtle terracotta accents, tappable.
 */
export function ClubUpsellCard({ onPress, style }: ClubUpsellCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Rejoindre le club"
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <Text style={styles.eyebrow}>Rejoins le club</Text>
      <Text style={styles.title}>
        Prix réduits, <Text style={styles.titleAccent}>bons plans</Text>, annuaire.
      </Text>
      <Text style={styles.body}>À partir de 12,50 €/mois · trois formules.</Text>

      <View style={styles.ctaRow}>
        <Text style={styles.ctaLabel}>Découvrir les formules</Text>
        <ArrowRight size={16} color={Colors.accent} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.65,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  body: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginTop: Spacing.md,
  },
  ctaLabel: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
});
