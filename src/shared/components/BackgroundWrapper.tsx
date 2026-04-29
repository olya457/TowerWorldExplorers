import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const BackgroundWrapper = ({ children, style }: Props) => {
  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundAlt, colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default BackgroundWrapper;
