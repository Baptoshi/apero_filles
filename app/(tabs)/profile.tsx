import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  AtSign,
  Camera,
  ChevronRight,
  Edit2,
  Heart,
  MapPin,
  MoreHorizontal,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditBioSheet } from '@/components/profile/EditBioSheet';
import { EditFieldSheet } from '@/components/profile/EditFieldSheet';
import { EditInterestsSheet } from '@/components/profile/EditInterestsSheet';
import { NotificationSettingsSheet } from '@/components/profile/NotificationSettingsSheet';
import { PhotoCropperSheet } from '@/components/profile/PhotoCropperSheet';
import { PrivacySheet } from '@/components/profile/PrivacySheet';
import { SubscriptionSheet } from '@/components/profile/SubscriptionSheet';
import { Avatar } from '@/components/ui/Avatar';
import { CityPicker } from '@/components/ui/CityPicker';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { City, Interest, MembershipTier } from '@/types/user';
import { formatMonthYear } from '@/utils/date';
import { pickAvatarImage } from '@/utils/image';

const tierLabels: Record<MembershipTier, string> = {
  free: 'Membre découverte',
  member: 'Membre du club',
  faithful: 'Membre fidèle',
};

/**
 * Every editable surface on this page routes its save through the
 * `updateUser` action on the auth store, which is the single
 * write-through point that a real backend would wire to `PATCH /me`.
 * Adding a new field = add a new sheet + a new tappable row that calls
 * `updateUser({ theField: newValue })` on save. Clean, linear, testable.
 */
type EditTarget =
  | { kind: 'bio' }
  | { kind: 'firstName' }
  | { kind: 'lastName' }
  | { kind: 'instagram' }
  | { kind: 'interests' }
  | { kind: 'city' }
  | { kind: 'email' }
  | { kind: 'notifications' };

export default function ProfileScreen() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const cycleTier = useAuthStore((s) => s.cycleTier);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setCity = useAuthStore((s) => s.setCity);
  const notifications = useAuthStore((s) => s.notifications);

  const bookmarksCount = useEventsStore((s) => s.bookmarks.size);

  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [cropperSource, setCropperSource] = useState<string | null>(null);

  const fullName = useMemo(() => {
    if (!user) return '';
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  }, [user]);

  /**
   * Natural-language summary of the enabled notification channels shown
   * as the value of the "Notifications" row in Paramètres — e.g.
   * "Push et email", "Push uniquement", "Tout désactivé".
   */
  const notificationsSummary = useMemo(() => {
    const labels: string[] = [];
    if (notifications.push) labels.push('Push');
    if (notifications.email) labels.push('email');
    if (labels.length === 0) return 'Tout désactivé';
    if (labels.length === 1) return `${labels[0]} uniquement`;
    return `${labels[0]} et ${labels[1]}`;
  }, [notifications]);

  if (!user) return null;

  const appVersion = Constants.expoConfig?.version ?? '0.0.0';
  const closeEdit = () => setEditTarget(null);

  /**
   * Two-step photo change : pick → crop (custom sheet) → save.
   * `updateUser` is the single write-through point — same path as every
   * other editable field on this screen.
   */
  const changeAvatar = async () => {
    const uri = await pickAvatarImage();
    if (uri) setCropperSource(uri);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════  Cover  ═══════════════════════════ */}
        <View style={styles.profileCard}>
          <View style={styles.cover}>
            <View style={styles.coverTopRow}>
              <Text style={styles.coverEyebrow}>{tierLabels[tier]}</Text>
              <Pressable
                onPress={() => setPrivacyOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Confidentialité du profil"
                hitSlop={8}
                style={({ pressed }) => [
                  styles.moreBtn,
                  pressed && styles.morePressed,
                ]}
              >
                <MoreHorizontal
                  size={IconSize.content}
                  color={Colors.accentContrast}
                  strokeWidth={1.8}
                />
              </Pressable>
            </View>

            <View style={styles.coverIdentity}>
              <Text style={styles.identityName} numberOfLines={1}>
                {user.firstName}
              </Text>
              <Text style={styles.identityMeta}>
                {user.age} ans · {user.city}
              </Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <Pressable
              onPress={changeAvatar}
              accessibilityRole="button"
              accessibilityLabel={
                user.avatarUrl
                  ? 'Changer ma photo de profil'
                  : 'Ajouter une photo de profil'
              }
              style={({ pressed }) => [
                styles.avatarRing,
                pressed && styles.avatarPressed,
              ]}
            >
              <Avatar
                firstName={user.firstName}
                gradient={user.avatarGradient}
                photoUrl={user.avatarUrl}
                tier={tier}
                size={88}
              />
              <View style={styles.avatarEditBadge}>
                <Camera size={13} color={Colors.accentContrast} strokeWidth={2} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ════════════════════════════  Bio  ════════════════════════════ */}
        <Section title="À propos de moi">
          <Pressable
            onPress={() => setEditTarget({ kind: 'bio' })}
            accessibilityRole="button"
            accessibilityLabel="Modifier ma bio"
            style={({ pressed }) => [
              styles.bioCard,
              pressed && styles.cardPressed,
            ]}
          >
            <EditPencil />
            {user.bio && user.bio.trim().length > 0 ? (
              <Text style={styles.bioText}>{user.bio}</Text>
            ) : (
              <Text style={styles.bioPlaceholder}>
                Ajoute une bio pour te présenter aux autres filles.
              </Text>
            )}
          </Pressable>
        </Section>

        {/* ══════════════════════════  Stats row  ═════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <StatTile value={user.eventsAttended.toString()} label="Événements" />
            <StatTile value={user.girlsMet.toString()} label="Rencontrées" />
            <StatTile
              value={formatMonthYear(user.memberSince)}
              label="Membre depuis"
            />
          </View>
        </View>

        {/* ═══════════════════════════  Favoris  ══════════════════════════ */}
        <Section title="Mes favoris">
          <Pressable
            onPress={() => router.push('/saved')}
            accessibilityRole="button"
            accessibilityLabel="Événements sauvegardés"
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowIcon}>
              <Heart
                size={IconSize.content}
                color={Colors.accent}
                strokeWidth={1.8}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Événements sauvegardés</Text>
              <Text style={styles.rowValue}>
                {bookmarksCount === 0
                  ? 'Aucun pour le moment'
                  : `${bookmarksCount} événement${bookmarksCount > 1 ? 's' : ''}`}
              </Text>
            </View>
            <ChevronRight
              size={IconSize.content}
              color={Colors.textTertiary}
              strokeWidth={1.8}
            />
          </Pressable>
        </Section>

        {/* ══════════════════════  Centres d'intérêt  ═════════════════════ */}
        <Section title="Centres d'intérêt">
          <Pressable
            onPress={() => setEditTarget({ kind: 'interests' })}
            accessibilityRole="button"
            accessibilityLabel="Modifier mes centres d'intérêt"
            style={({ pressed }) => [
              styles.interestsCard,
              pressed && styles.cardPressed,
            ]}
          >
            <EditPencil />
            {user.interests.length > 0 ? (
              <View style={styles.interestsWrap}>
                {user.interests.map((interest) => (
                  <View key={interest} style={styles.interestChip}>
                    <Text style={styles.interestChipLabel}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.bioPlaceholder}>
                Ajoute des centres d'intérêt pour affiner ton feed.
              </Text>
            )}
          </Pressable>
        </Section>

        {/* ═══════════════════════════  Identité  ══════════════════════════ */}
        <Section title="Mon identité">
          <View style={styles.rowsCard}>
            <EditableRow
              label="Prénom"
              value={user.firstName}
              onPress={() => setEditTarget({ kind: 'firstName' })}
            />
            <Divider />
            <EditableRow
              label="Nom"
              value={user.lastName ?? '—'}
              onPress={() => setEditTarget({ kind: 'lastName' })}
            />
            <Divider />
            <EditableRow
              label="Ville"
              value={user.city}
              leftIcon={<MapPin size={18} color={Colors.accent} strokeWidth={1.8} />}
              onPress={() => setEditTarget({ kind: 'city' })}
            />
            <Divider />
            <EditableRow
              label="Instagram"
              value={user.instagram || '—'}
              leftIcon={<AtSign size={18} color={Colors.accent} strokeWidth={1.8} />}
              onPress={() => setEditTarget({ kind: 'instagram' })}
            />
          </View>
        </Section>

        {/* ═══════════════════════════  Paramètres  ═══════════════════════ */}
        <Section title="Paramètres">
          <View style={styles.rowsCard}>
            <EditableRow
              label="Notifications"
              value={notificationsSummary}
              onPress={() => setEditTarget({ kind: 'notifications' })}
            />
            <Divider />
            <EditableRow
              label="Email"
              value={user.email ?? '—'}
              onPress={() => setEditTarget({ kind: 'email' })}
            />
          </View>
        </Section>

        {/* ═══════════════════════════  Footer  ═══════════════════════════ */}
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

        {/* Long-press on the version to cycle through free / member / faithful. */}
        <Pressable
          onLongPress={cycleTier}
          delayLongPress={600}
          accessibilityRole="button"
          accessibilityLabel={`Version ${appVersion}. Long press pour basculer de tier (mode dev).`}
          style={styles.versionRow}
        >
          <Text style={styles.versionText}>
            Les Apéros Filles · v{appVersion} · {tierLabels[tier]} ·{' '}
            {fullName || user.firstName}
          </Text>
        </Pressable>
      </ScrollView>

      {/* ═══════════════════════════  Sheets  ══════════════════════════ */}
      <SubscriptionSheet
        visible={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        tier={tier}
        memberSince={user.memberSince}
      />

      <PrivacySheet
        visible={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      <EditBioSheet
        visible={editTarget?.kind === 'bio'}
        initialValue={user.bio}
        onClose={closeEdit}
        onSave={(bio) => {
          updateUser({ bio });
          closeEdit();
        }}
      />

      <EditFieldSheet
        visible={editTarget?.kind === 'firstName'}
        title="Prénom"
        subtitle="Celui qui apparaîtra sur ton profil."
        initialValue={user.firstName}
        placeholder="Marguerite"
        validate={(v) => v.length >= 2}
        inputProps={{ autoCapitalize: 'words', autoComplete: 'name-given' }}
        maxLength={40}
        onClose={closeEdit}
        onSave={(firstName) => {
          updateUser({ firstName });
          closeEdit();
        }}
      />

      <EditFieldSheet
        visible={editTarget?.kind === 'lastName'}
        title="Nom"
        subtitle="Visible uniquement par les membres du club."
        initialValue={user.lastName ?? ''}
        placeholder="(facultatif)"
        validate={() => true}
        inputProps={{ autoCapitalize: 'words', autoComplete: 'name-family' }}
        maxLength={40}
        onClose={closeEdit}
        onSave={(lastName) => {
          updateUser({ lastName });
          closeEdit();
        }}
      />

      <EditFieldSheet
        visible={editTarget?.kind === 'instagram'}
        title="Instagram"
        subtitle="Ton handle — ex. @marguerite.lyon"
        initialValue={user.instagram}
        placeholder="@marguerite.lyon"
        validate={() => true}
        inputProps={{ autoCapitalize: 'none', autoComplete: 'username' }}
        maxLength={30}
        onClose={closeEdit}
        onSave={(instagram) => {
          updateUser({ instagram });
          closeEdit();
        }}
      />

      <EditFieldSheet
        visible={editTarget?.kind === 'email'}
        title="Email"
        subtitle="L'adresse qu'on utilise pour les confirmations et les reçus."
        initialValue={user.email ?? ''}
        placeholder="prenom@exemple.com"
        validate={(v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)}
        inputProps={{
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoComplete: 'email',
        }}
        maxLength={80}
        onClose={closeEdit}
        onSave={(email) => {
          updateUser({ email });
          closeEdit();
        }}
      />

      <EditInterestsSheet
        visible={editTarget?.kind === 'interests'}
        initialValue={user.interests}
        onClose={closeEdit}
        onSave={(interests: Interest[]) => {
          updateUser({ interests });
          closeEdit();
        }}
      />

      <CityPicker
        visible={editTarget?.kind === 'city'}
        selected={user.city}
        onClose={closeEdit}
        onSelect={(city: City) => {
          setCity(city);
          closeEdit();
        }}
      />

      <NotificationSettingsSheet
        visible={editTarget?.kind === 'notifications'}
        onClose={closeEdit}
      />

      <PhotoCropperSheet
        visible={cropperSource !== null}
        sourceUri={cropperSource}
        onClose={() => setCropperSource(null)}
        onSave={(uri) => {
          updateUser({ avatarUrl: uri });
          setCropperSource(null);
        }}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────  Sub-components  ───────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
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

/**
 * Tiny pencil badge that sits absolutely at the top-right of an editable
 * card (bio, interests). Gives a clear "tap to edit" affordance without
 * stealing a whole footer row.
 */
function EditPencil() {
  return (
    <View style={styles.editPencil} pointerEvents="none">
      <Edit2 size={14} color={Colors.accent} strokeWidth={1.8} />
    </View>
  );
}

function EditableRow({
  label,
  value,
  leftIcon,
  onPress,
}: {
  label: string;
  value: string;
  leftIcon?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Modifier ${label}`}
      style={({ pressed }) => [
        styles.editableRow,
        pressed && styles.rowPressed,
      ]}
    >
      {leftIcon ? <View style={styles.rowIconSmall}>{leftIcon}</View> : null}
      <View style={styles.rowText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <ChevronRight
        size={IconSize.content}
        color={Colors.textTertiary}
        strokeWidth={1.8}
      />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ──────────────────────────────────  Styles  ──────────────────────────────

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
    position: 'relative',
  },
  avatarPressed: {
    opacity: 0.85,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  // Bio & Interests cards share this layout — body content, no footer, a
  // floating pencil badge top-right as the edit affordance.
  bioCard: {
    position: 'relative',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingLeft: Spacing.lg,
    // Extra right-padding so the bio text never collides with the pencil.
    paddingRight: Spacing.lg + 28,
  },
  bioText: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 26,
    color: Colors.text,
    letterSpacing: -0.1,
  },
  bioPlaceholder: {
    ...Typography.body,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  cardPressed: {
    opacity: 0.7,
  },
  editPencil: {
    position: 'absolute',
    top: Spacing.sm + 2,
    right: Spacing.sm + 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.12)',
  },

  // Stats
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

  // Interests (read + edit affordance) — same pattern as the bio card.
  interestsCard: {
    position: 'relative',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg + 28,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  interestChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestChipLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontFamily: FontFamily.semiBold,
  },

  // Generic rows card (Identité, Paramètres)
  rowsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  row: {
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
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  readonlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.12)',
  },
  rowIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(194, 65, 12, 0.10)',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  rowValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowPressed: {
    opacity: 0.6,
  },
  settingLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  settingValue: {
    ...Typography.body,
    color: Colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Footer
  accountFooter: {
    marginTop: Spacing.xxl,
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
