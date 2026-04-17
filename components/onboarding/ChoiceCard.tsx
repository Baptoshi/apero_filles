import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface ChoiceCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Single-select card used throughout the onboarding.
 *
 * Visual states are distinguished purely by border weight + color accents so
 * the selected card never blends into the page background. No spring / scale
 * animation on selection — only a quiet opacity dip on press.
 */
export function ChoiceCard({ label, sublabel, selected, onPress }: ChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.textBlock}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
      <View style={[styles.check, selected ? styles.checkSelected : styles.checkIdle]}>
        {selected ? (
          <Check size={IconSize.inline} color={Colors.white} strokeWidth={2.5} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIdle: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
    // Compensate for the extra border so the card height stays constant
    marginVertical: -1,
  },
  cardPressed: {
    opacity: 0.75,
  },
  textBlock: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.accent,
  },
  sublabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  checkIdle: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.borderStrong,
  },
  checkSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
});
