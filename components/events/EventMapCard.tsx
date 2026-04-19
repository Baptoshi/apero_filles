import { MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { MapsPicker } from '@/components/events/MapsPicker';
import { Colors } from '@/constants/colors';
import { IconSize, Radius } from '@/constants/spacing';
import { detectIosMapApps, openMaps, type MapApp } from '@/utils/maps';

interface EventMapCardProps {
  location: string;
  city: string;
}

/**
 * Minimal map card — clean grid, one pin.
 *
 * No curved streets, no park blocks, no fioriture. Just a warm neutral
 * canvas with a faint orthogonal grid suggesting a real city plan and a
 * terracotta pin in the middle. Tap → native maps.
 */
export function EventMapCard({ location, city }: EventMapCardProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [iosApps, setIosApps] = useState<MapApp[]>([]);

  const onPress = async () => {
    if (Platform.OS === 'ios') {
      const apps = await detectIosMapApps(location, city);
      if (apps.length > 1) {
        setIosApps(apps);
        setPickerVisible(true);
        return;
      }
      if (apps[0]) {
        openMaps(location, city, apps[0].url);
      } else {
        openMaps(location, city);
      }
      return;
    }
    openMaps(location, city);
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${location}, ${city} dans une app de cartes`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.mapWrap}>
          <Svg
            viewBox="0 0 640 280"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Canvas */}
            <Rect x="0" y="0" width="640" height="280" fill="#F3EADB" />

            {/* Horizontal streets — thin hairlines in a brighter cream */}
            <Line x1="0" y1="70" x2="640" y2="70" stroke="#FDF6EA" strokeWidth="14" />
            <Line x1="0" y1="140" x2="640" y2="140" stroke="#FDF6EA" strokeWidth="18" />
            <Line x1="0" y1="210" x2="640" y2="210" stroke="#FDF6EA" strokeWidth="14" />

            {/* Vertical streets */}
            <Line x1="120" y1="0" x2="120" y2="280" stroke="#FDF6EA" strokeWidth="12" />
            <Line x1="260" y1="0" x2="260" y2="280" stroke="#FDF6EA" strokeWidth="12" />
            <Line x1="400" y1="0" x2="400" y2="280" stroke="#FDF6EA" strokeWidth="14" />
            <Line x1="540" y1="0" x2="540" y2="280" stroke="#FDF6EA" strokeWidth="12" />

            {/* Drop shadow circle under the pin */}
            <Circle cx="320" cy="148" r="14" fill="rgba(42, 24, 16, 0.14)" />
          </Svg>

          <View style={styles.pinLayer} pointerEvents="none">
            <View style={styles.pin}>
              <MapPin
                size={IconSize.inline}
                color={Colors.accentContrast}
                fill={Colors.accentContrast}
                strokeWidth={0}
              />
            </View>
          </View>
        </View>
      </Pressable>

      <MapsPicker
        visible={pickerVisible}
        apps={iosApps}
        location={location}
        city={city}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

const PIN_SIZE = 28;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.9,
  },
  mapWrap: {
    aspectRatio: 16 / 7,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundMuted,
  },
  pinLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
});
