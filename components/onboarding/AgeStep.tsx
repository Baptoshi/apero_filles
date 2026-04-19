import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';

import { ChoiceCard } from './ChoiceCard';

interface AgeRange {
  label: string;
  sublabel: string;
  median: number;
}

const ageRanges: AgeRange[] = [
  { label: '18 – 24 ans', sublabel: 'Jeune et curieuse', median: 22 },
  { label: '25 – 29 ans', sublabel: 'Carrière et copines', median: 27 },
  { label: '30 – 34 ans', sublabel: 'Équilibre et liberté', median: 32 },
  { label: '35 – 39 ans', sublabel: 'Affirmée et inspirée', median: 37 },
  { label: '40 ans et +', sublabel: 'Épanouie, toujours curieuse', median: 42 },
];

interface AgeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AgeStep({ onNext, onBack }: AgeStepProps) {
  const age = useAuthStore((s) => s.onboardingDraft.age);
  const setDraftAge = useAuthStore((s) => s.setDraftAge);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.step}>Étape 4 sur 5</Text>
        <Text style={styles.title}>Ta tranche d'âge ?</Text>
        <Text style={styles.subtitle}>Ça nous aide à te suggérer les bons événements.</Text>
      </View>
      <FlatList
        data={ageRanges}
        keyExtractor={(item) => item.label}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ChoiceCard
            label={item.label}
            sublabel={item.sublabel}
            selected={age === item.median}
            onPress={() => setDraftAge(item.median)}
          />
        )}
      />
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
          disabled={age === null}
          accessibilityLabel="Continuer vers l'étape suivante"
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
  list: {
    paddingVertical: Spacing.sm,
  },
  separator: {
    height: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
});
