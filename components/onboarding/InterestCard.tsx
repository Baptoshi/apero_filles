import { Check } from 'lucide-react-native';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

interface InterestCardProps {
  label: string;
  photoUrl?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Big editorial card for the onboarding interests step.
 *
 * Photo-led: a square image fills the card, the interest name sits over a
 * soft brown wash in white Playfair italic, and a check badge appears in
 * the top-right corner when selected. No text caption — the photo carries
 * the meaning.
 *
 * Designed to be used in a 2-column grid inside a FlatList.
 */
export function InterestCard({
  label,
  photoUrl,
  selected,
  onPress,
}: InterestCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && styles.cardPressed,
      ]}
    >
      <ImageBackground
        source={photoUrl ? { uri: photoUrl } : undefined}
        style={styles.photo}
        imageStyle={styles.photoImage}
      >
        <View style={styles.photoOverlay} />

        <View style={styles.topRow}>
          <View
            style={[
              styles.check,
              selected ? styles.checkSelected : styles.checkIdle,
            ]}
          >
            {selected ? (
              <Check size={IconSize.inline} color={Colors.accentContrast} strokeWidth={2.5} />
            ) : null}
          </View>
        </View>

        <Text style={styles.label}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIdle: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  cardPressed: {
    opacity: 0.85,
  },
  photo: {
    aspectRatio: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  photoImage: {
    // The border-radius of the card takes care of rounding ; this keeps
    // the image from bleeding past the rounded corners.
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 24, 16, 0.22)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  checkIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  checkSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    fontFamily: FontFamily.display,
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: Colors.accentContrast,
  },
});
