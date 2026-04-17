import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilleCard } from '@/components/filles/FilleCard';
import { Header } from '@/components/layout/Header';
import { PillTag } from '@/components/ui/PillTag';
import { SearchBar } from '@/components/ui/SearchBar';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { mockUsers } from '@/data/mock';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User, City } from '@/types/user';

const CITY_FILTERS: readonly (City | 'all')[] = [
  'all',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Montpellier',
  'Rennes',
];

export default function FillesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City | 'all'>('all');

  const candidates = useMemo(() => mockUsers.filter((u) => u.id !== user?.id), [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return candidates
      .filter((u) => (city === 'all' ? true : u.city === city))
      .filter((u) => {
        if (!q) return true;
        return (
          u.firstName.toLocaleLowerCase().includes(q) ||
          u.bio.toLocaleLowerCase().includes(q) ||
          u.city.toLocaleLowerCase().includes(q)
        );
      });
  }, [candidates, query, city]);

  const openProfile = useCallback(
    (u: User) => {
      if (tier === 'free') {
        router.push('/subscribe');
        return;
      }
      router.push(`/fille/${u.id}`);
    },
    [router, tier],
  );

  const keyExtractor = useCallback((u: User) => u.id, []);

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <FilleCard user={item} onPress={() => openProfile(item)} />
    ),
    [openProfile],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Header title="Les Filles" subtitle={`${candidates.length} membres autour de toi`} />

      <View style={styles.controls}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher une fille, une ville..."
        />
      </View>

      <View style={styles.cityRow}>
        {CITY_FILTERS.map((entry) => (
          <PillTag
            key={entry}
            label={entry === 'all' ? 'Toutes' : entry}
            selected={city === entry}
            variant="outline"
            onPress={() => setCity(entry)}
          />
        ))}
      </View>

      {tier === 'free' ? (
        <View style={styles.lockNote}>
          <Text style={styles.lockTitle}>Réservé aux membres</Text>
          <Text style={styles.lockBody}>
            Tu peux voir l'annuaire, mais les profils détaillés sont réservés aux membres du club.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyBody}>Change de ville ou réessaie avec un autre prénom.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  controls: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  cityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  lockNote: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.blush,
    borderWidth: 1,
    borderColor: Colors.lightPeach,
  },
  lockTitle: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    marginBottom: 2,
  },
  lockBody: {
    ...Typography.caption,
    color: Colors.brown,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl * 3,
  },
  separator: {
    height: Spacing.md,
  },
  empty: {
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.warmWhite,
    borderWidth: 1,
    borderColor: Colors.lightPeach,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.bodyBold,
    color: Colors.darkBrown,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.brown,
    textAlign: 'center',
  },
});
