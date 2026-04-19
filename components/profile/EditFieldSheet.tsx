import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

interface EditFieldSheetProps {
  visible: boolean;
  /** Label shown as the sheet eyebrow + field accessibility label. */
  title: string;
  /** One-line explanation under the title. */
  subtitle?: string;
  /** Current value, pre-filled in the input when the sheet opens. */
  initialValue: string;
  placeholder?: string;
  /** Basic validation, false disables the Save button. */
  validate?: (value: string) => boolean;
  /** Passed to the TextInput (keyboard, capitalization, autocomplete…). */
  inputProps?: Pick<
    TextInputProps,
    'keyboardType' | 'autoCapitalize' | 'autoComplete'
  >;
  /** Soft character limit enforced via maxLength on the TextInput. */
  maxLength?: number;
  onClose: () => void;
  onSave: (value: string) => void;
}

/**
 * Single-line text editor sheet — used for every short field on the
 * profile : prénom, nom, Instagram, etc. Each call-site passes the label,
 * an optional subtitle, a pre-filled value, and an onSave that writes
 * through to the auth store.
 */
export function EditFieldSheet({
  visible,
  title,
  subtitle,
  initialValue,
  placeholder,
  validate,
  inputProps,
  maxLength,
  onClose,
  onSave,
}: EditFieldSheetProps) {
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    if (visible) setDraft(initialValue);
  }, [visible, initialValue]);

  const trimmed = draft.trim();
  const hasChanges = trimmed !== initialValue.trim();
  const isValid = validate ? validate(trimmed) : trimmed.length > 0;
  const canSave = hasChanges && isValid;

  const submit = () => {
    if (!canSave) return;
    onSave(trimmed);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.55}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheet}
      >
        <Text style={styles.eyebrow}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          maxLength={maxLength}
          autoFocus
          returnKeyType="done"
          style={styles.input}
          {...inputProps}
        />

        <View style={styles.actions}>
          <Button
            label="Enregistrer"
            variant="primary"
            onPress={submit}
            disabled={!canSave}
            accessibilityLabel={`Enregistrer ${title}`}
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
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: FontFamily.regular,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
