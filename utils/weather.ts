import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Deterministic fake weather for the demo — picks an icon + temperature
 * from the event id so the same event always shows the same reading.
 *
 * In production this would be replaced by a single call to a weather API
 * (OpenWeather, Météo-France, …) keyed on the event's city + date.
 */
export interface MockWeather {
  icon: LucideIcon;
  temperature: string;
}

const ICONS: LucideIcon[] = [Sun, CloudSun, Cloud, CloudDrizzle, CloudRain];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getMockWeather(eventId: string): MockWeather {
  const h = hash(eventId);
  const iconSafe = ICONS[h % ICONS.length] ?? Sun;
  const temp = 14 + (h % 11); // 14° → 24°
  return { icon: iconSafe, temperature: `${temp}°` };
}
