import {
  KeyboardAvoidingView,
  Platform,
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
 * Name step — asks for first name + last name right after auth.
 *
 * Only the first name is actually strictly required (it's the identity
 * string used throughout the app). Last name is optional but captured here
 * for billing + CRM syncing with Brevo. Both fields are trimmed on submit.
 */
export function NameStep({ onNext, onBack }: NameStepProps) {
  const firstName = useAuthStore((s) => s.onboardingDraft.firstName);
  const lastName = useAuthStore((s) => s.onboardingDraft.lastName);
  const setFirstName = useAuthStore((s) => s.setDraftFirstName);
  const setLastName = useAuthStore((s) => s.setDraftLastName);

  const canContinue = firstName.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.step}>Étape 1 sur 4</Text>
        <Text style={styles.title}>
          On t'appelle <Text style={styles.titleAccent}>comment</Text> ?
        </Text>
        <Text style={styles.subtitle}>
          Seul ton prénom apparaîtra publiquement dans l'app.
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Prénom</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Marguerite"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoComplete="name-given"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nom</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="(facultatif)"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoComplete="name-family"
            style={styles.input}
          />
        </View>
      </View>

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: 'auto',
  },
});
