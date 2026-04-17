import { MapPin } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { User } from '@/types/user';

interface FilleCardProps {
  user: User;
  onPress?: () => void;
}

function FilleCardComponent({ user, onPress }: FilleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Profil de ${user.firstName}, ${user.age} ans, ${user.city}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Avatar
        firstName={user.firstName}
        gradient={user.avatarGradient}
        photoUrl={user.avatarUrl}
        tier={user.tier}
        size={56}
      />
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.age}>{user.age} ans</Text>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={IconSize.inline} color={Colors.textTertiary} strokeWidth={1.8} />
          <Text style={styles.city}>{user.city}</Text>
        </View>
        <Text style={styles.bio} numberOfLines={2}>
          {user.bio}
        </Text>
      </View>
    </Pressable>
  );
}

export const FilleCard = memo(FilleCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.75,
  },
  text: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.h3,
    color: Colors.text,
  },
  age: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  city: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  bio: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
