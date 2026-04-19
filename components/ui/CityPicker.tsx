import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import type { City } from '@/types/user';

interface CityPickerProps {
  visible: boolean;
  selected: City;
  onClose: () => void;
  onSelect: (city: City) => void;
}

const CITIES: readonly City[] = ['Lyon', 'Marseille', 'Toulouse', 'Montpellier', 'Rennes'];

/**
 * City picker — bottom sheet with a single-select list. Selection commits
 * the change and closes the sheet in one tap.
 */
export function CityPicker({ visible, selected, onClose, onSelect }: CityPickerProps) {
  const pick = (city: City) => {
    onSelect(city);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.7}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <Text style={styles.eyebrow}>Ma ville</Text>
        <Text style={styles.title}>Choisis ta ville</Text>

        <View style={styles.list}>
          {CITIES.map((city) => {
            const isActive = city === selected;
            return (
              <Pressable
                key={city}
                onPress={() => pick(city)}
                accessibilityRole="button"
                accessibilityLabel={city}
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={[styles.rowLabel, isActive && styles.rowLabelActive]}>
                  {city}
                </Text>
                {isActive ? (
                  <Check size={IconSize.content} color={Colors.accent} strokeWidth={2} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.lg,
  },
  list: {
    // rows separated by hairlines
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLabel: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    lineHeight: 26,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  rowLabelActive: {
    color: Colors.accent,
    fontStyle: 'italic',
  },
});
