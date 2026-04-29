import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePersistentAndroidInsets } from '../hooks/usePersistentInsets';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  top?: boolean;
  bottom?: boolean;
  extraTop?: number;
  extraBottom?: number;
};

const SafePadding = ({
  children,
  style,
  top = true,
  bottom = true,
  extraTop = 0,
  extraBottom = 0,
}: Props) => {
  const insets = useSafeAreaInsets();
  const androidInsets = usePersistentAndroidInsets();

  const topPad =
    Platform.OS === 'android'
      ? androidInsets.top + extraTop
      : (top ? insets.top : 0) + extraTop;
  const bottomPad =
    Platform.OS === 'android'
      ? androidInsets.bottom + extraBottom
      : (bottom ? insets.bottom : 0) + extraBottom;
  const paddingStyle = {
    paddingTop: top ? topPad : 0,
    paddingBottom: bottom ? bottomPad : 0,
  };

  return (
    <View
      style={[
        styles.root,
        paddingStyle,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default SafePadding;
