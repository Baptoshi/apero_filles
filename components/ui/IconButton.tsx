import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, TouchTarget } from '@/constants/spacing';

interface IconButtonProps {
  icon: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'solid' | 'muted' | 'ghost' | 'glass';
  badgeCount?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Small square icon button — rounded corners (Apple feel), neutral fills.
 * The legacy "glass" variant is kept as an alias for back-compat; it maps to
 * the new `solid` white surface style.
 */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = TouchTarget.min,
  variant = 'solid',
  badgeCount,
  style,
}: IconButtonProps) {
  const resolved = variant === 'glass' ? 'solid' : variant;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variantStyles[resolved],
        { width: size, height: size, borderRadius: Radius.full },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
      {badgeCount !== undefined && badgeCount > 0 ? (
        <View style={styles.badge} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
});

const variantStyles = StyleSheet.create({
  solid: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  muted: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.surfaceMuted,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
  },
});
