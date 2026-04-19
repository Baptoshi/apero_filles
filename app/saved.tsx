import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedGridCard } from '@/components/events/SavedGridCard';
import { IconButton } from '@/components/ui/IconButton';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { useEventsStore } from '@/stores/useEventsStore';
import type { Event } from '@/types/event';

/**
 * Saved events — compact 2-column grid. All bookmarks (future, present,
 * past) sorted chronologically, most recent first. Tapping a card opens
 * the full event detail page.
 */
export default function SavedScreen() {
  const router = useRouter();
  const events = useEventsStore((s) => s.events);
  const bookmarks = useEventsStore((s) => s.bookmarks);

  const saved = useMemo(
    () =>
      events
        .filter((event) => bookmarks.has(event.id))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [events, bookmarks],
  );

  const openEvent = useCallback(
    (event: Event) => router.push(`/event/${event.id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <SavedGridCard event={item} onPress={() => openEvent(item)} />
    ),
    [openEvent],
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

      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.title}>
              Mes <Text style={styles.titleAccent}>favoris</Text>
            </Text>
            <Text style={styles.subtitle}>
              {saved.length === 0
                ? "Rien ici pour l'instant."
                : `${saved.length} événement${saved.length > 1 ? 's' : ''} sauvegardé${saved.length > 1 ? 's' : ''}.`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Appuie sur l'icône cœur d'un événement pour le garder sous la main.
            </Text>
          </View>
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
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl * 3,
  },
  columnWrapper: {
    gap: Spacing.md,
  },
  rowGap: {
    height: Spacing.lg,
  },
  intro: {
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 42,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  titleAccent: {
    fontStyle: 'italic',
    color: Colors.accent,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  empty: {
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
