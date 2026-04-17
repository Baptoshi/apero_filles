import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Simple editorial page header: a small uppercase eyebrow above a big
 * Playfair title. No avatar, no bell — navigation lives in the tab bar.
 */
export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 36,
    lineHeight: 42,
  },
});
