import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/events/FeedCard';
import { CityPicker } from '@/components/ui/CityPicker';
import { PillTag } from '@/components/ui/PillTag';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  CATEGORY_FILTERS,
  categoryLabel,
  type CategoryFilter,
} from '@/constants/categories';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';
import type { City } from '@/types/user';
import { isUpcoming } from '@/utils/date';

/**
 * Discover — editorial title with an interactive city accent.
 *
 * The page filters the feed to the currently-selected city (persisted on the
 * user profile) and exposes category pills. The city name inside the title
 * is tappable and opens a small bottom-sheet picker.
 */
export default function DiscoverScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setCity = useAuthStore((s) => s.setCity);
  const tier = useAuthStore((s) => s.tier);
  const events = useEventsStore((s) => s.events);
  const bookmarks = useEventsStore((s) => s.bookmarks);
  const toggleBookmark = useEventsStore((s) => s.toggleBookmark);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  const city: City = user?.city ?? 'Lyon';

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return events
      .filter((event) => isUpcoming(event.date))
      .filter((event) => (category === 'all' ? true : event.category === category))
      .filter((event) => event.city === city)
      .filter((event) => {
        if (!q) return true;
        return (
          event.title.toLocaleLowerCase().includes(q) ||
          event.location.toLocaleLowerCase().includes(q) ||
          event.city.toLocaleLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, category, city, query]);

  const openEvent = useCallback(
    (event: Event) => router.push(`/event/${event.id}`),
    [router],
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <View style={styles.cardWrap}>
        <FeedCard
          event={item}
          tier={tier}
          bookmarked={bookmarks.has(item.id)}
          onPress={() => openEvent(item)}
          onToggleBookmark={() => toggleBookmark(item.id)}
        />
      </View>
    ),
    [tier, bookmarks, openEvent, toggleBookmark],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>
                Découvrir à{' '}
                <Pressable
                  onPress={() => setCityPickerOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Changer de ville — actuellement ${city}`}
                >
                  {({ pressed }) => (
                    <Text style={[styles.cityAccent, pressed && styles.cityPressed]}>
                      {city}
                      <Text style={styles.cityChevron}> ⌄</Text>
                    </Text>
                  )}
                </Pressable>
              </Text>
            </View>

            <View style={styles.controls}>
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Rechercher un événement, un lieu…"
              />
            </View>

            <FlatList
              data={CATEGORY_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.filterList}
              ItemSeparatorComponent={() => <View style={styles.filterSeparator} />}
              renderItem={({ item }) => (
                <PillTag
                  label={categoryLabel(item)}
                  selected={category === item}
                  onPress={() => setCategory(item)}
                />
              )}
              style={styles.filterRow}
            />

            {tier === 'free' ? (
              <Pressable
                onPress={() => router.push('/subscribe')}
                accessibilityRole="link"
                accessibilityLabel="Rejoindre le club pour profiter de prix réduits"
                style={({ pressed }) => [styles.upsell, pressed && styles.upsellPressed]}
              >
                <Text style={styles.upsellEyebrow}>Rejoins le club</Text>
                <Text style={styles.upsellBody}>
                  Prix réduits sur tous les événements et accès à l'annuaire.
                </Text>
                <Text style={styles.upsellCta}>Voir les formules →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun événement à afficher</Text>
            <Text style={styles.emptyBody}>
              Ajuste tes filtres ou repasse dans quelques jours — on ajoute de nouveaux
              événements toutes les semaines.
            </Text>
          </View>
        }
      />

      <CityPicker
        visible={cityPickerOpen}
        selected={city}
        onClose={() => setCityPickerOpen(false)}
        onSelect={setCity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xxxl * 3,
  },
  titleWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 46,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  cityAccent: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 46,
    color: Colors.accent,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  cityChevron: {
    fontFamily: FontFamily.semiBold,
    color: Colors.accent,
    fontSize: 28,
  },
  cityPressed: {
    opacity: 0.6,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
  },
  listSeparator: {
    height: Spacing.lg,
  },
  controls: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterRow: {
    marginBottom: Spacing.xl,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
  },
  filterSeparator: {
    width: Spacing.sm,
  },
  upsell: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  upsellPressed: {
    opacity: 0.6,
  },
  upsellEyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  upsellBody: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  upsellCta: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  empty: {
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
