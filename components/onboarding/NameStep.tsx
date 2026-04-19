import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';

interface NameStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Name + soft-identity step — first stop after auth for new sign-ups.
 *
 * Fields :
 *   - Prénom (required, min 2)
 *   - Nom (optional)
 *   - Instagram (optional) — used on the profile + shared with the
 *     members of the annuaire when the privacy switch is on.
 *   - Téléphone (optional) — used by the organisatrice to reach out for
 *     last-minute changes + for SMS reminders (if the channel is on).
 *
 * Only the first name is blocking. All other fields are trimmed on
 * submit and merged into the final User record by `completeOnboarding`.
 */
export function NameStep({ onNext, onBack }: NameStepProps) {
  const firstName = useAuthStore((s) => s.onboardingDraft.firstName);
  const lastName = useAuthStore((s) => s.onboardingDraft.lastName);
  const instagram = useAuthStore((s) => s.onboardingDraft.instagram);
  const phone = useAuthStore((s) => s.onboardingDraft.phone);
  const setFirstName = useAuthStore((s) => s.setDraftFirstName);
  const setLastName = useAuthStore((s) => s.setDraftLastName);
  const setInstagram = useAuthStore((s) => s.setDraftInstagram);
  const setPhone = useAuthStore((s) => s.setDraftPhone);

  const canContinue = firstName.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.step}>Étape 1 sur 5</Text>
          <Text style={styles.title}>
            On t'appelle <Text style={styles.titleAccent}>comment</Text> ?
          </Text>
        </View>

        <View style={styles.body}>
          <Field
            label="Prénom"
            value={firstName}
            onChange={setFirstName}
            placeholder="Marguerite"
            autoCapitalize="words"
            autoComplete="name-given"
          />

          <Field
            label="Nom"
            value={lastName}
            onChange={setLastName}
            placeholder="(facultatif)"
            autoCapitalize="words"
            autoComplete="name-family"
          />

          <Field
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
            placeholder="@marguerite.lyon  (facultatif)"
            autoCapitalize="none"
            autoComplete="username"
            helper="Visible uniquement par les membres du club."
          />

          <Field
            label="Téléphone"
            value={phone}
            onChange={setPhone}
            placeholder="+33 6 12 34 56 78  (facultatif)"
            keyboardType="phone-pad"
            autoComplete="tel"
            helper="Sert aux rappels et à te joindre si besoin. Jamais partagé."
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Retour"
          variant="ghost"
          onPress={onBack}
          accessibilityLabel="Revenir à l'étape précédente"
        />
        <Button
          label="Continuer"
          onPress={onNext}
          disabled={!canContinue}
          accessibilityLabel="Continuer vers l'étape suivante"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  autoCapitalize = 'none',
  autoComplete,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'name-given' | 'name-family' | 'username' | 'tel';
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        style={styles.input}
      />
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  step: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  body: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: FontFamily.regular,
  },
  helper: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
