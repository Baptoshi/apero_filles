import {
  Flower2,
  Footprints,
  Mic,
  Palette,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { EventCategory } from '@/types/event';

type CategoryFilter = EventCategory | 'all';

interface CategoryScrollProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

/**
 * Horizontal scroll of category chips — editorial & on-brand.
 *
 * Every chip uses the same warm terracotta accent for its icon and label,
 * sitting on a cream `surfaceMuted` background (no border, no shadow). The
 * active chip flips to a solid terracotta fill with inverted colors. Keeps
 * the Amalfi warmth without stacking many tints.
 */
export function CategoryScroll({ selected, onSelect }: CategoryScrollProps) {
  return (
    <FlatList
      data={CATEGORY_ITEMS}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        const isActive = selected === item.id;
        const Icon = item.icon;
        const color = isActive ? Colors.accentContrast : Colors.accent;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipIdle,
              pressed && styles.chipPressed,
            ]}
          >
            <Icon size={18} color={color} strokeWidth={1.8} />
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelIdle]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

interface CategoryItem {
  id: CategoryFilter;
  label: string;
  icon: LucideIcon;
}

const CATEGORY_ITEMS: readonly CategoryItem[] = [
  { id: 'all', label: 'Tout', icon: Sparkles },
  { id: 'Apéro', label: 'Apéro', icon: Wine },
  { id: 'Sport', label: 'Sport', icon: Footprints },
  { id: 'Atelier créatif', label: 'Atelier', icon: Palette },
  { id: 'Talk', label: 'Talk', icon: Mic },
  { id: 'Bien-être', label: 'Bien-être', icon: Flower2 },
  { id: 'Gastronomie', label: 'Gastronomie', icon: UtensilsCrossed },
  { id: 'Sortie', label: 'Sortie', icon: Sparkles },
];

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.xl,
  },
  separator: {
    width: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: 10,
    borderRadius: Radius.full,
    minHeight: 40,
  },
  chipIdle: {
    backgroundColor: Colors.surfaceMuted,
  },
  chipActive: {
    backgroundColor: Colors.accent,
  },
  chipPressed: {
    opacity: 0.75,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  labelIdle: {
    color: Colors.text,
  },
  labelActive: {
    color: Colors.accentContrast,
  },
});
