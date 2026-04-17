import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AvatarStack } from '@/components/ui/AvatarStack';
import { PaywallOverlay } from '@/components/ui/PaywallOverlay';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { User } from '@/types/user';

interface AttendeesListProps {
  attendees: User[];
  /** Free users see the blurred version. */
  locked: boolean;
}

/**
 * "Qui vient ?" block. Avatar stack + pill grid with first names.
 * When `locked` (free tier), the content is rendered behind a PaywallOverlay.
 */
export function AttendeesList({ attendees, locked }: AttendeesListProps) {
  const router = useRouter();
  const count = attendees.length;

  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <AvatarStack users={attendees} max={5} size={32} />
        <Text style={styles.count}>
          {count} fille{count > 1 ? 's' : ''} inscrite{count > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Qui vient ?</Text>
      {locked ? (
        <PaywallOverlay
          title="Réservé aux membres"
          description="Deviens membre pour découvrir les filles qui seront là."
          ctaLabel="Rejoindre le club"
          onPress={() => router.push('/subscribe')}
          style={styles.lockedWrap}
        >
          {content}
        </PaywallOverlay>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.3,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  lockedWrap: {
    minHeight: 200,
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  count: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
});
