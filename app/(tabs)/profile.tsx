import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart, MoreHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoyaltyCard } from '@/components/profile/LoyaltyCard';
import { SubscriptionSheet } from '@/components/profile/SubscriptionSheet';
import { Avatar } from '@/components/ui/Avatar';
import { PillTag } from '@/components/ui/PillTag';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { MembershipTier } from '@/types/user';
import { getLoyaltyProgress } from '@/utils/loyalty';

const tierLabels: Record<MembershipTier, string> = {
  free: 'Membre découverte',
  member: 'Membre du club',
  faithful: 'Membre fidèle',
};

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const cycleTier = useAuthStore((s) => s.cycleTier);
  const logout = useAuthStore((s) => s.logout);

  const loyalty = useMemo(
    () => (user ? getLoyaltyProgress(user.eventsAttended) : null),
    [user],
  );
  const bookmarksCount = useEventsStore((s) => s.bookmarks.size);

  const router = useRouter();
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  if (!user || !loyalty) {
    return null;
  }

  const appVersion = Constants.expoConfig?.version ?? '0.0.0';

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.cover}>
            <View style={styles.coverTopRow}>
              <Text style={styles.coverEyebrow}>{tierLabels[tier]}</Text>
              <Pressable
                onPress={cycleTier}
                accessibilityRole="button"
                accessibilityLabel={`Mode dev — basculer de tier (actuellement ${tierLabels[tier]})`}
                hitSlop={8}
                style={({ pressed }) => [styles.moreBtn, pressed && styles.morePressed]}
              >
                <MoreHorizontal
                  size={IconSize.content}
                  color={Colors.accentContrast}
                  strokeWidth={1.8}
                />
              </Pressable>
            </View>

            <View style={styles.coverIdentity}>
              <Text style={styles.identityName}>{user.firstName}</Text>
              <Text style={styles.identityMeta}>
                {user.age} ans · {user.city}
              </Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarRing}>
              <Avatar
                firstName={user.firstName}
                gradient={user.avatarGradient}
                photoUrl={user.avatarUrl}
                tier={tier}
                size={88}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mon parcours</Text>
          <LoyaltyCard progress={loyalty} eventsAttended={user.eventsAttended} />
        </View>

        <View style={styles.section}>
          <View style={styles.statsRow}>
            <StatTile value={user.eventsAttended.toString()} label="Événements" />
            <StatTile value={user.girlsMet.toString()} label="Filles rencontrées" />
            <StatTile value={user.memberSince} label="Membre depuis" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mes favoris</Text>
          <Pressable
            onPress={() => router.push('/saved')}
            accessibilityRole="button"
            accessibilityLabel="Événements sauvegardés"
            style={({ pressed }) => [styles.savedRow, pressed && styles.savedRowPressed]}
          >
            <Heart size={IconSize.content} color={Colors.text} strokeWidth={1.8} />
            <View style={styles.savedText}>
              <Text style={styles.savedTitle}>Événements sauvegardés</Text>
              <Text style={styles.savedCount}>
                {bookmarksCount === 0
                  ? 'Aucun pour le moment'
                  : `${bookmarksCount} événement${bookmarksCount > 1 ? 's' : ''}`}
              </Text>
            </View>
            <ChevronRight size={IconSize.content} color={Colors.textTertiary} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Centres d'intérêt</Text>
          <View style={styles.interestsWrap}>
            {user.interests.map((interest) => (
              <PillTag key={interest} label={interest} variant="soft" />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Paramètres</Text>
          <View style={styles.settingsCard}>
            <SettingRow label="Ville" value={user.city} />
            <Divider />
            <SettingRow label="Notifications" value="Activées" />
            <Divider />
            <SettingRow label="Instagram" value={user.instagram} />
          </View>
        </View>

        <View style={styles.accountFooter}>
          <Pressable
            onPress={() => setSubscriptionOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={
              tier === 'free' ? 'Voir mon abonnement' : 'Gérer mon abonnement'
            }
            style={({ pressed }) => [
              styles.accountAction,
              pressed && styles.accountActionPressed,
            ]}
          >
            <Text style={styles.accountActionLabel}>
              {tier === 'free' ? 'Mon abonnement' : 'Gérer mon abonnement'}
            </Text>
          </Pressable>

          <View style={styles.accountDivider} />

          <Pressable
            onPress={logout}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
            style={({ pressed }) => [
              styles.accountAction,
              pressed && styles.accountActionPressed,
            ]}
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>
        </View>

        {/* Long-press on the version to cycle through free / member / faithful */}
        <Pressable
          onLongPress={cycleTier}
          delayLongPress={600}
          accessibilityRole="button"
          accessibilityLabel={`Version ${appVersion}. Long press pour basculer de tier (mode dev).`}
          style={styles.versionRow}
        >
          <Text style={styles.versionText}>
            Les Apéros Filles · v{appVersion} · {tierLabels[tier]}
          </Text>
        </Pressable>
      </ScrollView>

      <SubscriptionSheet
        visible={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        tier={tier}
        memberSince={user.memberSince}
      />
    </SafeAreaView>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text
        style={styles.statValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing.xxxl * 3,
  },
  profileCard: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  cover: {
    minHeight: 200,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  coverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverEyebrow: {
    ...Typography.small,
    color: Colors.accentContrast,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.85,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePressed: {
    opacity: 0.7,
  },
  coverIdentity: {
    paddingLeft: 112,
    gap: 2,
  },
  identityName: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.accentContrast,
    letterSpacing: -0.3,
  },
  identityMeta: {
    ...Typography.caption,
    color: Colors.accentContrast,
    opacity: 0.85,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: Spacing.lg,
    marginTop: -52,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  statValue: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: Colors.text,
    textAlign: 'center',
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savedRowPressed: {
    opacity: 0.6,
  },
  savedText: {
    flex: 1,
  },
  savedTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  savedCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  settingValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  accountFooter: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  accountAction: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountActionPressed: {
    opacity: 0.55,
  },
  accountActionLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  accountDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  logoutText: {
    ...Typography.bodyBold,
    color: Colors.danger,
  },
  versionRow: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  versionText: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
});
