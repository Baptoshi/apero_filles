import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryScroll } from '@/components/discover/CategoryScroll';
import { FeedCard } from '@/components/events/FeedCard';
import { PageHero } from '@/components/layout/PageHero';
import { ClubUpsellCard } from '@/components/subscription/ClubUpsellCard';
import { CityPicker } from '@/components/ui/CityPicker';
import { SearchBar } from '@/components/ui/SearchBar';
import { type CategoryFilter } from '@/constants/categories';
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
 * The title reads "Découvrir à <city>" on a single line; the city name is
 * tappable and opens a small bottom-sheet picker. Below: search, category
 * pills, an optional upsell, then a vertical feed of matching events.
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
      .filter((event) => event.city === city)
      .filter((event) => (category === 'all' ? true : event.category === category))
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
            <PageHero
              title={
                <Text>
                  Découvrir à{'\n'}
                  <Text
                    style={styles.heroAccent}
                    onPress={() => setCityPickerOpen(true)}
                    suppressHighlighting
                  >
                    {city}
                    <Text style={styles.heroChevron}>{' ⌄'}</Text>
                  </Text>
                </Text>
              }
            />

            <View style={styles.searchWrap}>
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Rechercher un événement, un lieu…"
              />
            </View>

            <View style={styles.filterRow}>
              <CategoryScroll selected={category} onSelect={setCategory} />
            </View>

            {tier === 'free' ? (
              <View style={styles.upsellWrap}>
                <ClubUpsellCard onPress={() => router.push('/subscribe')} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun événement à afficher</Text>
            <Text style={styles.emptyBody}>
              Ajuste tes filtres ou change de ville — on ajoute de nouveaux
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
  heroAccent: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 44,
    color: Colors.accent,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  heroChevron: {
    fontFamily: FontFamily.semiBold,
    color: Colors.accent,
    fontStyle: 'normal',
    fontSize: 22,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
  },
  listSeparator: {
    height: Spacing.lg,
  },
  searchWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterRow: {
    marginBottom: Spacing.xl,
  },
  upsellWrap: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
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
