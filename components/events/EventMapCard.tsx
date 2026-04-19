import { MapPin } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MapsPicker } from '@/components/events/MapsPicker';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import type { City } from '@/types/user';
import { deriveEventCoords, staticMapUrl } from '@/utils/geo';
import { detectIosMapApps, openMaps, type MapApp } from '@/utils/maps';

interface EventMapCardProps {
  /** Event id used to derive a stable per-event coordinate. */
  eventId: string;
  location: string;
  city: City;
  /** Optional explicit coordinates. Overrides the city-centre fallback. */
  coords?: { lat: number; lng: number };
}

/**
 * Airbnb-style map preview backed by a real street map.
 *
 * We fetch a static PNG from `staticmap.openstreetmap.de` (free, no API
 * key required) for the event's coordinates and overlay our own pin on
 * top in React Native — that way the marker stays on-brand and we never
 * depend on the static service's marker styling.
 *
 * If the network image fails (offline / service down), a soft warm
 * placeholder kicks in so the layout never collapses.
 *
 * Tap → opens the user's preferred maps app (system picker on iOS when
 * multiple apps are installed, geo: intent on Android, Google Maps web
 * fallback on the browser).
 */
export function EventMapCard({
  eventId,
  location,
  city,
  coords,
}: EventMapCardProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [iosApps, setIosApps] = useState<MapApp[]>([]);
  const [imageFailed, setImageFailed] = useState(false);

  const finalCoords = useMemo(
    () => coords ?? deriveEventCoords(eventId, city),
    [coords, eventId, city],
  );

  const mapImageUrl = useMemo(
    () => staticMapUrl(finalCoords, { zoom: 15, width: 720, height: 400 }),
    [finalCoords],
  );

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
          {imageFailed ? (
            <View style={styles.fallback}>
              <Text style={styles.fallbackTitle}>{location}</Text>
              <Text style={styles.fallbackSub}>{city}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: mapImageUrl }}
              style={styles.mapImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
              accessibilityIgnoresInvertColors
            />
          )}

          {/* Airbnb-style pin — white pill with terracotta dot, centred. */}
          <View style={styles.pinLayer} pointerEvents="none">
            <View style={styles.pin}>
              <View style={styles.pinDot}>
                <MapPin
                  size={12}
                  color={Colors.accentContrast}
                  fill={Colors.accentContrast}
                  strokeWidth={0}
                />
              </View>
              <Text style={styles.pinLabel} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          {/* "Voir sur la carte →" affordance — bottom-right Airbnb cue. */}
          <View style={styles.cta} pointerEvents="none">
            <Text style={styles.ctaLabel}>Voir sur la carte →</Text>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.92,
  },
  mapWrap: {
    aspectRatio: 16 / 9,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundMuted,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceMuted,
  },
  fallbackTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  fallbackSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pinLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    maxWidth: '85%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: {
    ...Typography.small,
    fontSize: 12,
    color: Colors.text,
    flexShrink: 1,
  },
  cta: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(251, 246, 238, 0.95)',
  },
  ctaLabel: {
    ...Typography.small,
    color: Colors.text,
  },
});
