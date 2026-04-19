import {
  BookOpen,
  Coffee,
  Flower2,
  Leaf,
  Palette,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

/** Public filter IDs — stable keys used to match partners. */
export type DealCategory =
  | 'all'
  | 'cafe'
  | 'apero'
  | 'restaurant'
  | 'wellness'
  | 'shop'
  | 'workshop'
  | 'flowers'
  | 'book';

interface DealCategoryScrollProps {
  selected: DealCategory;
  onSelect: (category: DealCategory) => void;
}

/**
 * Horizontal scroll of deal category chips — mirrors `CategoryScroll` on the
 * Discover screen so both surfaces feel like part of the same app.
 *
 * Same chip system (terracotta icon + label on cream, inverted when active).
 * The category IDs are semantic groupings (café, apéro, restaurant…) so that
 * partner records can be bucketed via `matchesDealCategory` without having to
 * maintain a rigid enum on the domain side.
 */
export function DealCategoryScroll({
  selected,
  onSelect,
}: DealCategoryScrollProps) {
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
  id: DealCategory;
  label: string;
  icon: LucideIcon;
}

const CATEGORY_ITEMS: readonly CategoryItem[] = [
  { id: 'all', label: 'Tout', icon: Sparkles },
  { id: 'cafe', label: 'Café', icon: Coffee },
  { id: 'apero', label: 'Apéro', icon: Wine },
  { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { id: 'wellness', label: 'Bien-être', icon: Leaf },
  { id: 'shop', label: 'Mode & Déco', icon: ShoppingBag },
  { id: 'workshop', label: 'Atelier', icon: Palette },
  { id: 'flowers', label: 'Fleurs', icon: Flower2 },
  { id: 'book', label: 'Librairie', icon: BookOpen },
];

/**
 * True when a partner's free-form category string falls under the given
 * filter ID. Substring-based so we don't have to tag every record by hand.
 */
export function matchesDealCategory(
  partnerCategory: string,
  filter: DealCategory,
): boolean {
  if (filter === 'all') return true;
  const c = partnerCategory.toLocaleLowerCase();
  switch (filter) {
    case 'cafe':
      return c.includes('café');
    case 'apero':
      return c.includes('bar') || c.includes('cocktail') || c.includes('apéro');
    case 'restaurant':
      return c.includes('restaurant');
    case 'wellness':
      return c.includes('bien-être') || c.includes('spa') || c.includes('yoga');
    case 'shop':
      return c.includes('mode') || c.includes('déco') || c.includes('lifestyle');
    case 'workshop':
      return c.includes('atelier') && !c.includes('floral');
    case 'flowers':
      return c.includes('floral') || c.includes('fleur');
    case 'book':
      return c.includes('librairie');
    default:
      return true;
  }
}

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
