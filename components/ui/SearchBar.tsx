import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, TouchTarget } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher',
  autoFocus = false,
  style,
  accessibilityLabel,
}: SearchBarProps) {
  const hasValue = value.length > 0;

  return (
    <View style={[styles.container, style]}>
      <Search size={IconSize.content} color={Colors.muted} strokeWidth={1.8} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        style={styles.input}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {hasValue ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={8}
          style={styles.clear}
        >
          <X size={IconSize.inline} color={Colors.muted} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: TouchTarget.min,
    borderRadius: Radius.full,
    backgroundColor: Colors.warmWhite,
    borderWidth: 1,
    borderColor: Colors.lightPeach,
  },
  input: {
    ...Typography.body,
    color: Colors.darkBrown,
    flex: 1,
    paddingVertical: 0,
  },
  clear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blush,
  },
});
