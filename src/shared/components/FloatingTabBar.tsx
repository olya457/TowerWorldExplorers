import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import TabIcon from './TabIcon';

const iconMap: Record<string, 'atlas' | 'globe' | 'journal' | 'insights' | 'challenge'> = {
  Atlas: 'atlas',
  WorldMap: 'globe',
  Journal: 'journal',
  Insights: 'insights',
  Challenge: 'challenge',
};

const FloatingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width <= 390 || height <= 720;
  const bottomOffset = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 8) + (compact ? 8 : 14)
    : compact ? 16 : 24;
  const wrapOffsetStyle = {
    left: compact ? 12 : 16,
    right: compact ? 12 : 16,
    bottom: bottomOffset,
  };

  return (
    <View style={[styles.wrap, wrapOffsetStyle]} pointerEvents="box-none">
      <View style={[styles.bar, compact && styles.barCompact]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={`${label} tab`}
              style={[styles.item, compact && styles.itemCompact]}>
              <View
                style={[
                  styles.iconWrap,
                  compact && styles.iconWrapCompact,
                  isFocused && styles.iconWrapActive,
                ]}>
                <TabIcon
                  name={iconMap[route.name] || 'atlas'}
                  active={isFocused}
                  size={compact ? 18 : 20}
                />
              </View>
              {compact ? null : (
                <Text
                  style={[styles.label, isFocused && styles.labelActive]}
                  numberOfLines={1}
                  allowFontScaling={false}>
                  {label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'stretch',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11,23,51,0.92)',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  barCompact: {
    borderRadius: 24,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 0,
  },
  itemCompact: {
    height: 46,
    paddingVertical: 0,
  },
  iconWrap: {
    width: 42,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 2,
  },
  iconWrapCompact: {
    width: 44,
    height: 38,
    borderRadius: 16,
    marginBottom: 0,
  },
  iconWrapActive: {
    backgroundColor: colors.tabActiveBg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accentAlt,
    fontWeight: '700',
  },
});

export default FloatingTabBar;
