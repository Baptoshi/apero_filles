import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import type { City } from '@/types/user';

import { ChoiceCard } from './ChoiceCard';

const cities: { value: City; sublabel: string }[] = [
  { value: 'Lyon', sublabel: 'Entre Rhône, Saône et traboules' },
  { value: 'Marseille', sublabel: 'Soleil, rooftops et bonne humeur' },
  { value: 'Toulouse', sublabel: 'La ville rose' },
  { value: 'Montpellier', sublabel: "Au cœur de l'Hérault" },
  { value: 'Rennes', sublabel: 'La perle bretonne' },
];

interface CityStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function CityStep({ onNext, onBack }: CityStepProps) {
  const selected = useAuthStore((s) => s.onboardingDraft.city);
  const setDraftCity = useAuthStore((s) => s.setDraftCity);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.step}>Étape 3 sur 5</Text>
        <Text style={styles.title}>Tu es à quelle ville ?</Text>
      </View>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ChoiceCard
            label={item.value}
            sublabel={item.sublabel}
            selected={selected === item.value}
            onPress={() => setDraftCity(item.value)}
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
          disabled={!selected}
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
