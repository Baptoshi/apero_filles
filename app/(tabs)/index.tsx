import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/events/FeedCard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';
import { isUpcoming } from '@/utils/date';

/**
 * Home — vertical feed of upcoming events on a warm cream canvas.
 *
 * Top chrome is intentionally bare: just a small wordmark and the editorial
 * greeting. Profile access lives in the tab bar; saved events live on the
 * profile page.
 */
export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier);
  const events = useEventsStore((s) => s.events);
  const bookmarks = useEventsStore((s) => s.bookmarks);
  const toggleBookmark = useEventsStore((s) => s.toggleBookmark);

  const upcoming = useMemo(
    () =>
      events
        .filter((event) => isUpcoming(event.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events],
  );

  const openEvent = useCallback(
    (event: Event) => router.push(`/event/${event.id}`),
    [router],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <HomeIntro firstName={user?.firstName ?? ''} city={user?.city ?? ''} />
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
        ListFooterComponent={
          tier === 'free' ? (
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

function HomeIntro({ firstName, city }: { firstName: string; city: string }) {
  return (
    <View style={styles.intro}>
      <Text style={styles.greetingSmall}>Salut {firstName}</Text>
      <Text style={styles.greetingBig}>
        Les événements à <Text style={styles.greetingCity}>{city}</Text>
      </Text>
    </View>
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
  intro: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  greetingSmall: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  greetingBig: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 40,
    lineHeight: 46,
  },
  greetingCity: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  separator: {
    height: Spacing.lg,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
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
