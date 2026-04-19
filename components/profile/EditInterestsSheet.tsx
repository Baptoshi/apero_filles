import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { Interest } from '@/types/user';

const ALL_INTERESTS: readonly Interest[] = [
  'Apéro',
  'Sport',
  'Atelier créatif',
  'Talk',
  'Bien-être',
  'Gastronomie',
  'Sortie',
];

const MIN_INTERESTS = 2;

interface EditInterestsSheetProps {
  visible: boolean;
  initialValue: readonly Interest[];
  onClose: () => void;
  onSave: (interests: Interest[]) => void;
}

/**
 * Compact interests picker — chip grid, multi-select. Requires at least
 * two interests so the recommender stays useful. Save button is disabled
 * below the threshold.
 */
export function EditInterestsSheet({
  visible,
  initialValue,
  onClose,
  onSave,
}: EditInterestsSheetProps) {
  const [draft, setDraft] = useState<Interest[]>([...initialValue]);

  useEffect(() => {
    if (visible) setDraft([...initialValue]);
  }, [visible, initialValue]);

  const toggle = (interest: Interest) => {
    setDraft((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const canSave = draft.length >= MIN_INTERESTS;
  const hasChanges =
    draft.length !== initialValue.length ||
    draft.some((i) => !initialValue.includes(i));

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.75}>
      <View style={styles.sheet}>
        <Text style={styles.eyebrow}>Mes intérêts</Text>
        <Text style={styles.title}>
          Ce qui <Text style={styles.titleAccent}>te parle</Text>.
        </Text>
        <Text style={styles.subtitle}>
          Au moins {MIN_INTERESTS} sélections — on s'en sert pour te proposer
          les bons événements.
        </Text>

        <View style={styles.chips}>
          {ALL_INTERESTS.map((interest) => {
            const selected = draft.includes(interest);
            return (
              <Pressable
                key={interest}
                onPress={() => toggle(interest)}
                accessibilityRole="button"
                accessibilityLabel={interest}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.chip,
                  selected ? styles.chipSelected : styles.chipIdle,
                  pressed && styles.chipPressed,
                ]}
              >
                {selected ? (
                  <Check
                    size={IconSize.inline}
                    color={Colors.accentContrast}
                    strokeWidth={2.5}
                  />
                ) : null}
                <Text
                  style={[
                    styles.chipLabel,
                    selected ? styles.chipLabelSelected : styles.chipLabelIdle,
                  ]}
                >
                  {interest}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Button
            label={
              canSave
                ? 'Enregistrer'
                : `Sélectionne-en ${MIN_INTERESTS - draft.length} de plus`
            }
            variant="primary"
            onPress={() => onSave(draft)}
            disabled={!canSave || !hasChanges}
            accessibilityLabel="Enregistrer les centres d'intérêt"
          />
          <Button
            label="Annuler"
            variant="ghost"
            onPress={onClose}
            accessibilityLabel="Annuler"
          />
        </View>
      </View>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipLabel: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  chipLabelIdle: {
    color: Colors.text,
  },
  chipLabelSelected: {
    color: Colors.accentContrast,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
