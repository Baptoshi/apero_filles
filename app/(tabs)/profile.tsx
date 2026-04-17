import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoyaltyCard } from '@/components/profile/LoyaltyCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PillTag } from '@/components/ui/PillTag';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { MembershipTier } from '@/types/user';
import { getLoyaltyProgress } from '@/utils/loyalty';

const tierLabels: Record<MembershipTier, string> = {
  free: 'Membre découverte',
  member: 'Membre du club',
  faithful: 'Membre fidèle',
};

const tierDescriptions: Record<MembershipTier, string> = {
  free: "Profite d'un événement par mois au prix plein.",
  member: 'Accès illimité aux événements à prix membre.',
  faithful: 'Plus de 6 mois avec nous. Merci d’être là.',
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const cycleTier = useAuthStore((s) => s.cycleTier);
  const logout = useAuthStore((s) => s.logout);

  const loyalty = useMemo(
    () => (user ? getLoyaltyProgress(user.eventsAttended) : null),
    [user],
  );
  const bookmarksCount = useEventsStore((s) => s.bookmarks.size);

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
        <View style={styles.hero}>
          <Avatar
            firstName={user.firstName}
            gradient={user.avatarGradient}
            photoUrl={user.avatarUrl}
            tier={tier}
            size={96}
          />
          <Text style={styles.name}>{user.firstName}</Text>
          <Text style={styles.meta}>
            {user.age} ans · {user.city}
          </Text>
          <PillTag label={tierLabels[tier]} variant="soft" style={styles.tierPill} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Abonnement</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{tierLabels[tier]}</Text>
            <Text style={styles.cardBody}>{tierDescriptions[tier]}</Text>
            <Button
              label={tier === 'free' ? 'Passe au niveau supérieur' : 'Gérer mon abonnement'}
              variant={tier === 'free' ? 'primary' : 'secondary'}
              onPress={() => router.push('/subscribe')}
              accessibilityLabel={
                tier === 'free' ? 'Découvrir les abonnements' : 'Gérer mon abonnement'
              }
              style={styles.cardCta}
            />
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

        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
          style={styles.logoutRow}
        >
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

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
    </SafeAreaView>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  name: {
    ...Typography.h1,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  meta: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierPill: {
    marginTop: Spacing.md,
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
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  cardCta: {
    alignSelf: 'stretch',
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
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 2,
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
  logoutRow: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
