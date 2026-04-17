import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { User } from '@/types/user';

import { Avatar } from './Avatar';

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: number;
  showRemainder?: boolean;
}

export function AvatarStack({
  users,
  max = 4,
  size = 32,
  showRemainder = true,
}: AvatarStackProps) {
  const visible = users.slice(0, max);
  const remainder = users.length - visible.length;

  return (
    <View style={styles.row} accessibilityLabel={`${users.length} participantes`}>
      {visible.map((user, index) => (
        <View
          key={user.id}
          style={[
            styles.avatarSlot,
            { marginLeft: index === 0 ? 0 : -size * 0.35 },
          ]}
        >
          <View style={[styles.ring, { borderRadius: size / 2 + 2 }]}>
            <Avatar
              firstName={user.firstName}
              gradient={user.avatarGradient}
              photoUrl={user.avatarUrl}
              size={size}
            />
          </View>
        </View>
      ))}
      {showRemainder && remainder > 0 && (
        <View
          style={[
            styles.remainder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size * 0.35,
            },
          ]}
        >
          <Text style={styles.remainderText}>+{remainder}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSlot: {
    // spacing handled via marginLeft
  },
  ring: {
    padding: 2,
    backgroundColor: Colors.warmWhite,
  },
  remainder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blush,
    borderWidth: 2,
    borderColor: Colors.warmWhite,
  },
  remainderText: {
    ...Typography.small,
    color: Colors.terracotta,
  },
});
