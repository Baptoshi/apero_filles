import { Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface PaywallOverlayProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  radius?: number;
  /** When false (member), the overlay is not rendered and children show through. */
  locked?: boolean;
  children?: React.ReactNode;
}

/**
 * Flat lock overlay — no blur, no gradient. A soft white-ish wash sits over
 * the gated content, with a small lock badge and inline CTA. Apple-like.
 */
export function PaywallOverlay({
  title,
  description,
  ctaLabel = 'Débloquer',
  onPress,
  style,
  radius = Radius.lg,
  locked = true,
  children,
}: PaywallOverlayProps) {
  if (!locked) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.wrap, { borderRadius: radius }, style]}>
      <View style={styles.content} pointerEvents="none">
        {children}
      </View>
      <View style={styles.wash} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={styles.cta}
      >
        <View style={styles.lockBadge}>
          <Lock size={IconSize.content} color={Colors.accentContrast} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <Text style={styles.link}>{ctaLabel} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  content: {
    opacity: 0.35,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  cta: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: 260,
  },
  link: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginTop: Spacing.sm,
    textDecorationLine: 'underline',
  },
});
