import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AvatarTints, Colors, type GradientName } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import type { MembershipTier } from '@/types/user';

interface AvatarProps {
  firstName: string;
  gradient: GradientName;
  size?: number;
  tier?: MembershipTier;
  /** Remote portrait URL. Falls back to initials when missing or fails to load. */
  photoUrl?: string;
  style?: ViewStyle | ViewStyle[];
}

const tierRing: Record<MembershipTier, string | null> = {
  free: null,
  member: Colors.tierMember,
  faithful: Colors.tierFaithful,
};

/**
 * Avatar — shows the user's portrait when `photoUrl` is provided, otherwise
 * falls back to a flat colored circle with the first initial.
 */
export function Avatar({
  firstName,
  gradient,
  size = 44,
  tier = 'free',
  photoUrl,
  style,
}: AvatarProps) {
  const ringColor = tierRing[tier];
  const ringWidth = ringColor ? 2 : 0;
  const gap = ringWidth > 0 ? 2 : 0;
  const innerSize = size - (ringWidth + gap) * 2;
  const initial = firstName.slice(0, 1).toUpperCase();
  const tint = AvatarTints[gradient];
  const fontSize = Math.max(12, Math.round(size * 0.4));

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: ringColor ?? Colors.transparent,
          padding: gap,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.circle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: tint,
          },
        ]}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={[styles.initial, { fontSize }]} allowFontScaling={false}>
            {initial}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.transparent,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: FontFamily.semiBold,
    color: Colors.white,
  },
});
