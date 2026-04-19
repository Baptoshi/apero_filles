import { Linking, Platform } from 'react-native';

/**
 * Resolve the set of map apps the user has installed on iOS.
 *
 * iOS doesn't offer a system-wide "open in..." chooser for URLs, so we check
 * which of the three common map apps can handle their URL scheme and return
 * them. The caller can then show its own picker.
 *
 * On Android and web, a single `geo:` URI (Android) or Google Maps URL (web)
 * is enough — the OS will show its native chooser on Android.
 */
export interface MapApp {
  id: 'apple' | 'google' | 'waze';
  label: string;
  url: string;
}

function buildUrls(location: string, city: string) {
  const query = encodeURIComponent(`${location} ${city}`);
  return {
    geo: `geo:0,0?q=${query}`,
    apple: `http://maps.apple.com/?q=${query}`,
    appleApp: `maps://?q=${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    googleApp: `comgooglemaps://?q=${query}`,
    wazeApp: `waze://?q=${query}&navigate=yes`,
  };
}

/**
 * On iOS, return the installed map apps with their absolute URL.
 * Resolves to [] on non-iOS platforms.
 */
export async function detectIosMapApps(
  location: string,
  city: string,
): Promise<MapApp[]> {
  if (Platform.OS !== 'ios') return [];
  const urls = buildUrls(location, city);

  const checks = await Promise.all([
    Linking.canOpenURL(urls.appleApp).catch(() => true), // always available on iOS
    Linking.canOpenURL(urls.googleApp).catch(() => false),
    Linking.canOpenURL(urls.wazeApp).catch(() => false),
  ]);

  const apps: MapApp[] = [];
  if (checks[0]) apps.push({ id: 'apple', label: 'Plans', url: urls.apple });
  if (checks[1]) apps.push({ id: 'google', label: 'Google Maps', url: urls.googleApp });
  if (checks[2]) apps.push({ id: 'waze', label: 'Waze', url: urls.wazeApp });
  return apps;
}

/**
 * Open a native maps experience for the given location.
 *
 *   - Android → `geo:` URI triggers the native app chooser (Google Maps,
 *     Waze, Maps.me, OsmAnd…). The user picks in the system dialog.
 *   - iOS → no system picker exists; the caller should render a custom
 *     sheet from `detectIosMapApps(...)` and forward the chosen URL here.
 *     When invoked without a specific URL on iOS we fall back to Apple Plans.
 *   - Web → opens Google Maps in a new tab.
 */
export function openMaps(location: string, city: string, explicitUrl?: string) {
  if (explicitUrl) {
    Linking.openURL(explicitUrl).catch(() => {});
    return;
  }

  const urls = buildUrls(location, city);
  if (Platform.OS === 'android') {
    Linking.openURL(urls.geo).catch(() => Linking.openURL(urls.google));
    return;
  }
  if (Platform.OS === 'ios') {
    Linking.openURL(urls.apple).catch(() => {});
    return;
  }
  // Web
  Linking.openURL(urls.google).catch(() => {});
}
