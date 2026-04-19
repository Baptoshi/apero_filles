import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/events/FeedCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';
import { isUpcoming } from '@/utils/date';

type Tab = 'upcoming' | 'past';

/**
 * Home — two-tab feed of the user's events.
 *
 * Tab `À venir` lists upcoming events the user is attending (or has
 * bookmarked). Tab `Passés` shows events already gone that the user was part
 * of. The header is a single segmented control — no greeting, no city name,
 * the context is already obvious.
 */
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const events = useEventsStore((s) => s.events);
  const bookmarks = useEventsStore((s) => s.bookmarks);
  const registrations = useEventsStore((s) => s.registrations);
  const toggleBookmark = useEventsStore((s) => s.toggleBookmark);

  const [tab, setTab] = useState<Tab>('upcoming');

  /**
   * An event belongs to the user's personal list when:
   *   - they are an attendee, OR
   *   - they have registered for it via the store, OR
   *   - they have bookmarked it (upcoming only — past bookmarks are less relevant).
   */
  const myEvents = useMemo(() => {
    if (!user) return { upcoming: [] as Event[], past: [] as Event[] };

    const isMine = (event: Event) =>
      event.attendees.some((attendee) => attendee.id === user.id) ||
      registrations.has(event.id) ||
      bookmarks.has(event.id);

    const upcoming = events
      .filter((event) => isUpcoming(event.date) && isMine(event))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const past = events
      .filter(
        (event) =>
          !isUpcoming(event.date) &&
          (event.attendees.some((attendee) => attendee.id === user.id) ||
            registrations.has(event.id)),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcoming, past };
  }, [events, user, registrations, bookmarks]);

  const data = tab === 'upcoming' ? myEvents.upcoming : myEvents.past;

  const openEvent = useCallback(
    (event: Event) => router.push(`/event/${event.id}`),
    [router],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={[
                { value: 'upcoming', label: 'À venir' },
                { value: 'past', label: 'Passés' },
              ]}
              style={styles.segment}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <FeedCard
              event={item}
              tier={tier}
              bookmarked={bookmarks.has(item.id)}
              onPress={() => openEvent(item)}
              onToggleBookmark={() => toggleBookmark(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {tab === 'upcoming'
                ? 'Rien de prévu pour le moment'
                : 'Rien dans le rétro'}
            </Text>
            <Text style={styles.emptyBody}>
              {tab === 'upcoming'
                ? "Découvre les événements à venir et inscris-toi à ton premier apéro."
                : 'Les événements auxquels tu auras participé apparaîtront ici.'}
            </Text>
            {tab === 'upcoming' ? (
              <Pressable
                onPress={() => router.push('/(tabs)/discover')}
                accessibilityRole="button"
                accessibilityLabel="Découvrir les événements"
                style={({ pressed }) => [styles.emptyCta, pressed && styles.emptyPressed]}
              >
                <Text style={styles.emptyCtaLabel}>Découvrir →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={
          tier === 'free' && tab === 'upcoming' ? (
            <Pressable
              onPress={() => router.push('/subscribe')}
              accessibilityRole="button"
              accessibilityLabel="Découvrir les formules"
              style={({ pressed }) => [styles.upsell, pressed && styles.upsellPressed]}
            >
              <Text style={styles.upsellEyebrow}>Rejoins le club</Text>
              <Text style={styles.upsellTitle}>Prix réduits, bons plans, annuaire.</Text>
              <Text style={styles.upsellCta}>Voir les formules →</Text>
            </Pressable>
          ) : null
        }
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  segment: {
    alignSelf: 'center',
  },
  separator: {
    height: Spacing.lg,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
  },
  empty: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  emptyCta: {
    alignSelf: 'flex-start',
  },
  emptyPressed: {
    opacity: 0.6,
  },
  emptyCtaLabel: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
  upsell: {
    marginTop: Spacing.xxxl,
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  upsellPressed: {
    opacity: 0.6,
  },
  upsellEyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  upsellTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  upsellCta: {
    ...Typography.bodyBold,
    color: Colors.accent,
  },
});
