import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';
import { openMaps, type MapApp } from '@/utils/maps';

interface MapsPickerProps {
  visible: boolean;
  apps: MapApp[];
  location: string;
  city: string;
  onClose: () => void;
}

/**
 * iOS-only picker for choosing which maps app to open a location in.
 *
 * iOS doesn't provide a system-wide "Open in..." chooser, so we emulate the
 * behaviour with a native-feeling bottom sheet listing the installed map apps
 * (Plans, Google Maps, Waze).
 */
export function MapsPicker({ visible, apps, location, city, onClose }: MapsPickerProps) {
  const pick = (app: MapApp) => {
    openMaps(location, city, app.url);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeightRatio={0.55}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Ouvrir</Text>
        <Text style={styles.title}>{location}</Text>
        <Text style={styles.city}>{city}</Text>

        <View style={styles.list}>
          {apps.map((app) => (
            <Pressable
              key={app.id}
              onPress={() => pick(app)}
              accessibilityRole="button"
              accessibilityLabel={app.label}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.rowLabel}>{app.label}</Text>
              <Text style={styles.rowArrow}>↗</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  city: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    fontSize: 20,
    lineHeight: 24,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  rowArrow: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 18,
  },
});
