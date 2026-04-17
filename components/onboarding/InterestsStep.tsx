import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PillTag } from '@/components/ui/PillTag';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Interest } from '@/types/user';

const interests: Interest[] = [
  'Apéro',
  'Sport',
  'Atelier créatif',
  'Talk',
  'Bien-être',
  'Gastronomie',
  'Sortie',
];

interface InterestsStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function InterestsStep({ onComplete, onBack }: InterestsStepProps) {
  const selected = useAuthStore((s) => s.onboardingDraft.interests);
  const toggle = useAuthStore((s) => s.toggleDraftInterest);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.step}>Étape 3 sur 3</Text>
        <Text style={styles.title}>Tes centres d'intérêt ?</Text>
        <Text style={styles.subtitle}>Sélectionne-en au moins 2, on t'en proposera plus.</Text>
      </View>

      <View style={styles.pillsWrap}>
        {interests.map((interest) => (
          <PillTag
            key={interest}
            label={interest}
            selected={selected.includes(interest)}
            onPress={() => toggle(interest)}
            style={styles.pill}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label="Retour"
          variant="ghost"
          onPress={onBack}
          accessibilityLabel="Revenir à l'étape précédente"
        />
        <Button
          label="Terminer"
          onPress={onComplete}
          disabled={selected.length < 2}
          accessibilityLabel="Valider mes centres d'intérêt"
        />
      </View>
    </View>
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
    color: Colors.terracotta,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.darkBrown,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.brown,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: 'auto',
  },
});
