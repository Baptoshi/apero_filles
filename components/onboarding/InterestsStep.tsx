import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { INTEREST_PHOTOS } from '@/data/photos';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Interest } from '@/types/user';

import { InterestCard } from './InterestCard';

const interests: readonly Interest[] = [
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
      <FlatList
        data={interests}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.step}>Étape 5 sur 5</Text>
            <Text style={styles.title}>Tes centres d'intérêt&nbsp;?</Text>
          </View>
        }
        renderItem={({ item }) => (
          <InterestCard
            label={item}
            photoUrl={INTEREST_PHOTOS[item]}
            selected={selected.includes(item)}
            onPress={() => toggle(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
      />

      <View style={styles.footer}>
        <Button
          label="Retour"
          variant="ghost"
          onPress={onBack}
          accessibilityLabel="Revenir à l'étape précédente"
        />
        <Button
          label={
            selected.length < 2
              ? `Sélectionne-en ${2 - selected.length} de plus`
              : 'Terminer'
          }
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
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  list: {
    paddingHorizontal: Spacing.xxl,
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
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  row: {
    gap: Spacing.md,
  },
  rowGap: {
    height: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
});
