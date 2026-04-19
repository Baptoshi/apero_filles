import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { INTEREST_PHOTOS } from '@/data/photos';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Interest } from '@/types/user';

import { InterestCard } from './InterestCard';

interface InterestOption {
  value: Interest;
  caption: string;
}

/**
 * One-line captions rather than long pitches — feels like a curated magazine
 * rubric and fits under the photo without wrapping past two lines.
 */
const interests: readonly InterestOption[] = [
  { value: 'Apéro', caption: 'Verre entre copines, avec ou sans prétexte.' },
  { value: 'Sport', caption: 'Bouger, transpirer, rigoler ensemble.' },
  { value: 'Atelier créatif', caption: 'Céramique, couture, peinture — les mains occupées.' },
  { value: 'Talk', caption: 'Écouter des femmes qui ont des choses à dire.' },
  { value: 'Bien-être', caption: 'Yoga, méditation, parenthèses au calme.' },
  { value: 'Gastronomie', caption: 'Brunchs, grandes tables, bonnes adresses.' },
  { value: 'Sortie', caption: 'Rooftops, concerts, comédie, afters.' },
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
        keyExtractor={(item) => item.value}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.step}>Étape 3 sur 3</Text>
            <Text style={styles.title}>Tes centres d'intérêt&nbsp;?</Text>
            <Text style={styles.subtitle}>
              Choisis au moins deux univers qui te ressemblent. On s'occupe du
              reste.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <InterestCard
            label={item.value}
            caption={item.caption}
            photoUrl={INTEREST_PHOTOS[item.value]}
            selected={selected.includes(item.value)}
            onPress={() => toggle(item.value)}
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
