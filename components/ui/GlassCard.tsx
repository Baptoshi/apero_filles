import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/spacing';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  radius?: number;
  /** Kept for API compatibility; no longer applies a blur in this flat design. */
  intensity?: number;
}

/**
 * Flat surface card — Apple/Luma style.
 *
 * Previously used `BlurView` for glassmorphism; the new design is flat with
 * a subtle border and a soft neutral shadow. The component name is kept for
 * API compatibility across existing screens.
 */
export function GlassCard({ children, style, radius = Radius.lg }: GlassCardProps) {
  return (
    <View style={[styles.card, { borderRadius: radius }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
});
