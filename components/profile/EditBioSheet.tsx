import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

export const BIO_MAX_LENGTH = 200;

interface EditBioSheetProps {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (bio: string) => void;
}

/**
 * Bio editor — textarea with a soft 200-char limit and a live counter.
 *
 * Opens from the "Ma bio" section on the Profile screen. On save, the
 * trimmed bio is handed to the parent which routes it through
 * `updateUser({ bio })` in the auth store (wired to `PATCH /me` in prod).
 */
export function EditBioSheet({
  visible,
  initialValue,
  onClose,
  onSave,
}: EditBioSheetProps) {
  const [draft, setDraft] = useState(initialValue);

  // Re-sync on open — avoids stale value if the user re-opens after cancel.
  useEffect(() => {
    if (visible) setDraft(initialValue);
  }, [visible, initialValue]);

  const trimmed = draft.trim();
  const remaining = BIO_MAX_LENGTH - draft.length;
  const overLimit = remaining < 0;
  const hasChanges = trimmed !== initialValue.trim();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.7}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheet}
      >
        <Text style={styles.eyebrow}>Ma bio</Text>
        <Text style={styles.title}>
          Dis-nous ce qui te <Text style={styles.titleAccent}>ressemble</Text>.
        </Text>
        <Text style={styles.subtitle}>
          200 caractères max — les autres filles la liront sur ton profil.
        </Text>

        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            numberOfLines={5}
            maxLength={BIO_MAX_LENGTH + 20 /* allow visible over-limit */}
            placeholder="Ex. Café, bouquins et longues balades au bord du Rhône."
            placeholderTextColor={Colors.textTertiary}
            textAlignVertical="top"
            autoFocus
            style={styles.input}
          />
          <Text
            style={[
              styles.counter,
              overLimit && styles.counterOverLimit,
            ]}
          >
            {remaining} / {BIO_MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Enregistrer"
            variant="primary"
            onPress={() => onSave(trimmed.slice(0, BIO_MAX_LENGTH))}
            disabled={overLimit || !hasChanges}
            accessibilityLabel="Enregistrer ma bio"
          />
          <Button
            label="Annuler"
            variant="ghost"
            onPress={onClose}
            accessibilityLabel="Annuler"
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
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
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputWrap: {
    gap: Spacing.xs,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    minHeight: 120,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: FontFamily.regular,
  },
  counter: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  counterOverLimit: {
    color: Colors.danger,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
