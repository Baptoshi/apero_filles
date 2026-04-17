import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/events/FeedCard';
import { IconButton } from '@/components/ui/IconButton';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';

export default function SavedScreen() {
  const router = useRouter();
  const tier = useAuthStore((s) => s.tier);
  const events = useEventsStore((s) => s.events);
  const bookmarks = useEventsStore((s) => s.bookmarks);
  const toggleBookmark = useEventsStore((s) => s.toggleBookmark);

  const saved = useMemo(
    () =>
      events
        .filter((event) => bookmarks.has(event.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events, bookmarks],
  );

  const openEvent = useCallback(
    (event: Event) => router.push(`/event/${event.id}`),
    [router],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.topBar}>
        <IconButton
          icon={<ChevronLeft size={IconSize.content} color={Colors.text} strokeWidth={2} />}
          accessibilityLabel="Retour"
          onPress={() => router.back()}
        />
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>À ne pas oublier</Text>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.subtitle}>
          {saved.length === 0
            ? "Rien ici pour l'instant."
            : `${saved.length} événement${saved.length > 1 ? 's' : ''} sauvegardé${saved.length > 1 ? 's' : ''}.`}
        </Text>
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Appuie sur l'icône signet d'un événement pour le garder sous la main.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  intro: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 36,
    lineHeight: 42,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: Spacing.xxxl * 3,
  },
  separator: {
    height: Spacing.md,
  },
  cardWrap: {
    paddingHorizontal: Spacing.xl,
  },
  empty: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
