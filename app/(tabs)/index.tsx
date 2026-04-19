import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/events/FeedCard';
import { NotificationsSheet } from '@/components/home/NotificationsSheet';
import { PageHero } from '@/components/layout/PageHero';
import { ClubUpsellCard } from '@/components/subscription/ClubUpsellCard';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';
import { isUpcoming } from '@/utils/date';
import { buildFriendIds, rankEvents } from '@/utils/recommendations';

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
  const viewed = useEventsStore((s) => s.viewed);
  const toggleBookmark = useEventsStore((s) => s.toggleBookmark);

  const [tab, setTab] = useState<Tab>('upcoming');
  const [notifsOpen, setNotifsOpen] = useState(false);

  /**
   * The "À venir" tab is a ranked, personalised feed rather than a chrono
   * list of committed events. We:
   *   1. Gather signals (past attended, bookmarked, viewed on discover,
   *      registrations, declared interests).
   *   2. Hand them to the content-based recommender (`utils/recommendations`).
   *   3. Let the scoring engine hoist the user's committed events to the top
   *      and fill the rest with matching recommendations.
   *
   * "Passés" stays chronological — it's a personal rétro, not a feed.
   */
  const myEvents = useMemo(() => {
    if (!user) return { upcoming: [] as Event[], past: [] as Event[] };

    const isAttendingOrRegistered = (event: Event) =>
      event.attendees.some((attendee) => attendee.id === user.id) ||
      registrations.has(event.id);

    const pastAttended = events
      .filter((event) => !isUpcoming(event.date) && isAttendingOrRegistered(event))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const bookmarkedEvents = events.filter((event) => bookmarks.has(event.id));
    const viewedEvents = events.filter((event) => viewed.has(event.id));
    const committedIds = new Set<string>([
      ...registrations.keys(),
      ...bookmarks,
      ...events
        .filter((event) => event.attendees.some((a) => a.id === user.id))
        .map((event) => event.id),
    ]);

    const friendIds = buildFriendIds(user.id, [
      ...pastAttended,
      ...bookmarkedEvents,
    ]);

    // Scope the home feed to the user's city — Discover is the place to
    // explore nationwide. Keeps the meta count ("X à venir") meaningful.
    const upcomingCandidates = events.filter(
      (event) => isUpcoming(event.date) && event.city === user.city,
    );

    const upcoming = rankEvents(upcomingCandidates, {
      user,
      interests: user.interests,
      attendedEvents: pastAttended,
      bookmarkedEvents,
      viewedEvents,
      committedIds,
      friendIds,
    });

    return { upcoming, past: pastAttended };
  }, [events, user, registrations, bookmarks, viewed]);

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
          <View>
            <PageHero
              eyebrow={
                <Text style={styles.greeting}>
                  Bonjour,{' '}
                  <Text style={styles.greetingName}>
                    {user?.firstName ?? ''}
                  </Text>
                </Text>
              }
              accessory={
                <Pressable
                  onPress={() => setNotifsOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.bellBtn,
                    pressed && styles.bellPressed,
                  ]}
                >
                  <Bell
                    size={IconSize.content}
                    color={Colors.text}
                    strokeWidth={1.8}
                  />
                  <View style={styles.bellBadge} />
                </Pressable>
              }
              title={
                <Text>
                  Tes{'\n'}
                  <Text style={styles.heroAccent}>événements</Text>
                </Text>
              }
              subtitle={
                tab === 'upcoming'
                  ? 'Sélectionnés selon tes préférences.'
                  : 'Les moments déjà partagés.'
              }
            />

            <View style={styles.tabsRow}>
              {(
                [
                  { value: 'upcoming', label: 'À venir' },
                  { value: 'past', label: 'Passés' },
                ] as const
              ).map((opt) => {
                const isActive = tab === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTab(opt.value)}
                    accessibilityRole="tab"
                    accessibilityLabel={opt.label}
                    accessibilityState={{ selected: isActive }}
                    style={({ pressed }) => [
                      styles.tab,
                      pressed && styles.tabPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive ? styles.tabLabelActive : styles.tabLabelIdle,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.tabUnderline,
                        isActive
                          ? styles.tabUnderlineActive
                          : styles.tabUnderlineIdle,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
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
            <View style={styles.upsellWrap}>
              <ClubUpsellCard onPress={() => router.push('/subscribe')} />
            </View>
          ) : null
        }
      />

      <NotificationsSheet
        visible={notifsOpen}
        onClose={() => setNotifsOpen(false)}
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
  tabsRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  tabPressed: {
    opacity: 0.6,
  },
  tabLabel: {
    ...Typography.bodyBold,
    paddingBottom: Spacing.sm + 2,
  },
  tabLabelActive: {
    color: Colors.text,
  },
  tabLabelIdle: {
    color: Colors.textTertiary,
  },
  tabUnderline: {
    height: 2,
    alignSelf: 'stretch',
  },
  tabUnderlineActive: {
    backgroundColor: Colors.accent,
  },
  tabUnderlineIdle: {
    backgroundColor: Colors.border,
  },
  heroAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  greetingName: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    color: Colors.accent,
    fontSize: 16,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  bellPressed: {
    opacity: 0.65,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.surface,
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
  upsellWrap: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
});
