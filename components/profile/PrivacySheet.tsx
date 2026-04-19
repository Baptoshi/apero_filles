import { EyeOff } from 'lucide-react-native';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore, type PrivacyKey } from '@/stores/useAuthStore';

interface PrivacySheetProps {
  visible: boolean;
  onClose: () => void;
}

interface FieldRow {
  key: PrivacyKey;
  label: string;
  helper?: string;
}

/**
 * All fields the user can choose to show or hide on her public profile.
 * Groups are visual only — the store keeps a flat object.
 */
const identityFields: readonly FieldRow[] = [
  { key: 'showFirstName', label: 'Prénom' },
  { key: 'showLastName', label: 'Nom', helper: 'Visible uniquement des membres.' },
  { key: 'showAge', label: 'Âge' },
  { key: 'showCity', label: 'Ville' },
];

const aboutFields: readonly FieldRow[] = [
  { key: 'showBio', label: 'Bio' },
  { key: 'showInterests', label: 'Centres d\'intérêt' },
  { key: 'showInstagram', label: 'Instagram' },
];

const statsFields: readonly FieldRow[] = [
  { key: 'showEventsCount', label: 'Nombre d\'événements' },
  { key: 'showGirlsMet', label: 'Filles rencontrées' },
];

/**
 * Privacy settings sheet — opened from the "···" button on the profile
 * cover. Two levels of control:
 *
 *   1. Master switch "Rendre mon profil visible" — when off, the profile
 *      disappears from the annuaire and the events entirely.
 *   2. Per-field toggles — identity (prénom, nom, âge, ville), informations
 *      (bio, centres d'intérêt, Instagram), stats (événements, filles
 *      rencontrées). Each is independent.
 *
 * Every action is applied live to the Zustand store ; on a real build
 * these would also be synced to the backend via a PATCH /me endpoint.
 */
export function PrivacySheet({ visible, onClose }: PrivacySheetProps) {
  const privacy = useAuthStore((s) => s.privacy);
  const setProfileVisible = useAuthStore((s) => s.setProfileVisible);
  const togglePrivacyField = useAuthStore((s) => s.togglePrivacyField);

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.88}>
      <View style={styles.sheet}>
        <Text style={styles.eyebrow}>Confidentialité</Text>
        <Text style={styles.title}>
          Tu <Text style={styles.titleAccent}>choisis</Text> ce qu'on voit.
        </Text>
        <Text style={styles.body}>
          Contrôle ce qui apparaît sur ton profil public — dans l'annuaire et
          sur les pages d'événement.
        </Text>

        <View style={styles.masterCard}>
          <View style={styles.masterIcon}>
            <EyeOff
              size={IconSize.content}
              color={Colors.accent}
              strokeWidth={1.8}
            />
          </View>
          <View style={styles.masterText}>
            <Text style={styles.masterTitle}>Rendre mon profil visible</Text>
            <Text style={styles.masterHelper}>
              {privacy.profileVisible
                ? 'Les autres filles peuvent te trouver dans l\'annuaire.'
                : 'Ton profil est masqué — tu n\'apparais nulle part.'}
            </Text>
          </View>
          <Switch
            value={privacy.profileVisible}
            onValueChange={setProfileVisible}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Platform.OS === 'android' ? Colors.surface : undefined}
            ios_backgroundColor={Colors.border}
          />
        </View>

        <Section
          title="Identité"
          fields={identityFields}
          disabled={!privacy.profileVisible}
          privacy={privacy}
          onToggle={togglePrivacyField}
        />
        <Section
          title="À propos"
          fields={aboutFields}
          disabled={!privacy.profileVisible}
          privacy={privacy}
          onToggle={togglePrivacyField}
        />
        <Section
          title="Statistiques"
          fields={statsFields}
          disabled={!privacy.profileVisible}
          privacy={privacy}
          onToggle={togglePrivacyField}
        />

        <Text style={styles.note}>
          Les informations masquées restent visibles pour toi et pour l'équipe
          Les Apéros Filles uniquement.
        </Text>
      </View>
    </BottomSheet>
  );
}

function Section({
  title,
  fields,
  disabled,
  privacy,
  onToggle,
}: {
  title: string;
  fields: readonly FieldRow[];
  disabled: boolean;
  privacy: ReturnType<typeof useAuthStore.getState>['privacy'];
  onToggle: (key: PrivacyKey) => void;
}) {
  return (
    <View style={[styles.section, disabled && styles.sectionDisabled]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {fields.map((field, idx) => (
          <View
            key={field.key}
            style={[
              styles.row,
              idx === fields.length - 1 && styles.rowLast,
            ]}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{field.label}</Text>
              {field.helper ? (
                <Text style={styles.rowHelper}>{field.helper}</Text>
              ) : null}
            </View>
            <Switch
              value={privacy[field.key]}
              onValueChange={() => onToggle(field.key)}
              disabled={disabled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Platform.OS === 'android' ? Colors.surface : undefined}
              ios_backgroundColor={Colors.border}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  body: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  masterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(194, 65, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterText: {
    flex: 1,
  },
  masterTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
  },
  masterHelper: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  sectionBody: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  rowHelper: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  note: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
