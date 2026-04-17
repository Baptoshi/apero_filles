import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

type PillVariant = 'soft' | 'solid' | 'outline';

interface PillTagProps {
  label: string;
  variant?: PillVariant;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

/**
 * Compact tag used for categories, filters, and small badges.
 * Neutral by default; `solid` becomes near-black for selected states (Luma-style).
 */
export function PillTag({
  label,
  variant = 'soft',
  selected = false,
  onPress,
  style,
  accessibilityLabel,
}: PillTagProps) {
  const resolved: PillVariant = selected ? 'solid' : variant;
  const v = variantStyles[resolved];
  const containerStyle = [styles.base, v.container, style];
  const textStyle = [styles.text, v.text];

  if (!onPress) {
    return (
      <View style={containerStyle}>
        <Text style={textStyle}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    minHeight: 28,
    justifyContent: 'center',
  },
  text: {
    ...Typography.caption,
  },
  pressed: {
    opacity: 0.7,
  },
});

const variantStyles = {
  soft: StyleSheet.create({
    container: {
      backgroundColor: Colors.surfaceMuted,
      borderColor: Colors.surfaceMuted,
    },
    text: {
      color: Colors.textSecondary,
    },
  }),
  solid: StyleSheet.create({
    container: {
      backgroundColor: Colors.accent,
      borderColor: Colors.accent,
    },
    text: {
      color: Colors.accentContrast,
    },
  }),
  outline: StyleSheet.create({
    container: {
      backgroundColor: Colors.transparent,
      borderColor: Colors.borderStrong,
    },
    text: {
      color: Colors.text,
    },
  }),
};
