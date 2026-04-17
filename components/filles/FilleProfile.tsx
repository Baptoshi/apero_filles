import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { PillTag } from '@/components/ui/PillTag';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { User } from '@/types/user';

interface FilleProfileProps {
  user: User;
}

/**
 * Read-only profile of another member. Editorial layout, magazine-like —
 * no carded stats boxes, just typography flowing over hairlines.
 */
export function FilleProfile({ user }: FilleProfileProps) {
  const openInstagram = () => {
    const handle = user.instagram.replace(/^@/, '');
    Linking.openURL(`https://instagram.com/${handle}`).catch(() => {});
  };

  const openPhone = () => {
    const phone = user.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Avatar
          firstName={user.firstName}
          gradient={user.avatarGradient}
          photoUrl={user.avatarUrl}
          tier={user.tier}
          size={108}
        />
        <Text style={styles.name}>{user.firstName}</Text>
        <Text style={styles.meta}>
          {user.age} ans · {user.city}
        </Text>
      </View>

      <Text style={styles.bio}>{user.bio}</Text>

      {/* Three-column inline stats, separated by hairline rules */}
      <View style={styles.statsRow}>
        <StatBlock value={user.eventsAttended.toString()} label="Événements" />
        <StatDivider />
        <StatBlock value={user.girlsMet.toString()} label="Rencontrées" />
        <StatDivider />
        <StatBlock value={user.memberSince} label="Membre depuis" small />
      </View>

      {user.interests.length > 0 ? (
        <Section label="Centres d'intérêt">
          <View style={styles.pills}>
            {user.interests.map((interest) => (
              <PillTag key={interest} label={interest} variant="soft" />
            ))}
          </View>
        </Section>
      ) : null}

      <Section label="Contact">
        {user.instagram ? (
          <ContactRow label="Instagram" value={user.instagram} onPress={openInstagram} />
        ) : null}
        {user.phone ? (
          <ContactRow label="Téléphone" value={user.phone} onPress={openPhone} />
        ) : null}
      </Section>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function StatBlock({
  value,
  label,
  small = false,
}: {
  value: string;
  label: string;
  small?: boolean;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, small && styles.statValueSmall]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatDivider() {
  return <View style={styles.statDivider} />;
}

function ContactRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      style={({ pressed }) => [styles.contactRow, pressed && styles.contactRowPressed]}
    >
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  name: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 44,
    color: Colors.text,
    letterSpacing: -0.4,
    marginTop: Spacing.md,
  },
  meta: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  bio: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.display,
    fontSize: 30,
    lineHeight: 34,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statValueSmall: {
    fontSize: 18,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    alignSelf: 'stretch',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  sectionBody: {
    gap: Spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactRowPressed: {
    opacity: 0.6,
  },
  contactLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  contactValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
});
