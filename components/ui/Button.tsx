import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'brand';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

/**
 * Pill button — Luma-like. Full-rounded, moderate height, no scale/bounce on
 * press: we only dim the surface via opacity for tactile feedback.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        v.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={v.text.color} />
        ) : (
          <>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text style={[styles.label, v.text]}>{label}</Text>
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: Spacing.xs,
  },
  label: {
    ...Typography.bodyBold,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
});

const sizeStyles = StyleSheet.create({
  md: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    minHeight: 36,
  },
  lg: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: {
      backgroundColor: Colors.accent,
      borderColor: Colors.accent,
    },
    text: {
      color: Colors.accentContrast,
    },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: Colors.surface,
      borderColor: Colors.borderStrong,
    },
    text: {
      color: Colors.text,
    },
  }),
  ghost: StyleSheet.create({
    container: {
      backgroundColor: Colors.transparent,
      borderColor: Colors.transparent,
    },
    text: {
      color: Colors.text,
    },
  }),
  brand: StyleSheet.create({
    container: {
      backgroundColor: Colors.accent,
      borderColor: Colors.accent,
    },
    text: {
      color: Colors.accentContrast,
    },
  }),
};
