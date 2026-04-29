import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
};

const RandomButton = ({ label, onPress, style, compact }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.btn, compact && styles.btnCompact, style]}>
      <LinearGradient
        colors={[colors.accent, colors.yellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fill}>
        <View style={styles.inner}>
          <Text style={[styles.icon, compact && styles.iconCompact]}>{'\u21C4'}</Text>
          <Text
            style={[styles.text, compact && styles.textCompact]}
            numberOfLines={1}
            allowFontScaling={false}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 22,
    overflow: 'hidden',
  },
  btnCompact: {
    height: 48,
    borderRadius: 20,
  },
  fill: {
    flex: 1,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  iconCompact: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 14,
  },
});

export default RandomButton;
