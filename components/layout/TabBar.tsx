import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Compass,
  Home,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';
import { IconSize, Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/useAuthStore';

const tabIcons: Record<string, { Icon: LucideIcon; label: string }> = {
  index: { Icon: Home, label: 'Accueil' },
  discover: { Icon: Compass, label: 'Discover' },
  wallet: { Icon: Sparkles, label: 'Bons Plans' },
  filles: { Icon: Users, label: 'Filles' },
};

/**
 * Flat bottom bar — icons only, no labels. The profile tab shows the user's
 * own avatar (à la Timeleft) rather than a generic silhouette, which both
 * personalizes the chrome and acts as a clear "me" affordance.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // The profile tab is special: it renders the user's avatar.
          if (route.name === 'profile') {
            return (
              <ProfileTabItem
                key={route.key}
                focused={focused}
                onPress={onPress}
                firstName={user?.firstName ?? ''}
                gradient={user?.avatarGradient ?? 'peach'}
                tier={user?.tier ?? 'free'}
                photoUrl={user?.avatarUrl}
              />
            );
          }

          const config = tabIcons[route.name];
          if (!config) return null;

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={config.label}
              Icon={config.Icon}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabItemProps {
  focused: boolean;
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
}

function TabItem({ focused, label, Icon, onPress }: TabItemProps) {
  const dot = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    dot.value = withTiming(focused ? 1 : 0, { duration: 160 });
  }, [focused, dot]);

  const dotAnimated = useAnimatedStyle(() => ({
    opacity: dot.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Icon
        size={IconSize.nav + 2}
        strokeWidth={focused ? 2 : 1.6}
        color={focused ? Colors.text : Colors.textTertiary}
      />
      <Animated.View style={[styles.dot, dotAnimated]} />
    </Pressable>
  );
}

interface ProfileTabItemProps {
  focused: boolean;
  firstName: string;
  gradient: React.ComponentProps<typeof Avatar>['gradient'];
  tier: React.ComponentProps<typeof Avatar>['tier'];
  photoUrl?: string;
  onPress: () => void;
}

function ProfileTabItem({
  focused,
  firstName,
  gradient,
  tier,
  photoUrl,
  onPress,
}: ProfileTabItemProps) {
  const dot = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    dot.value = withTiming(focused ? 1 : 0, { duration: 160 });
  }, [focused, dot]);

  const dotAnimated = useAnimatedStyle(() => ({
    opacity: dot.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel="Mon profil"
      accessibilityState={{ selected: focused }}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={[styles.avatarWrap, focused && styles.avatarWrapFocused]}>
        <Avatar
          firstName={firstName}
          gradient={gradient}
          photoUrl={photoUrl}
          tier={tier}
          size={28}
        />
      </View>
      <Animated.View style={[styles.dot, dotAnimated]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  itemPressed: {
    opacity: 0.6,
  },
  avatarWrap: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  avatarWrapFocused: {
    borderColor: Colors.text,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
