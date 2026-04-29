import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

type Variant = 'solid' | 'gradient' | 'outline' | 'gold';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const PrimaryButton = ({ title, onPress, variant = 'solid', style, icon, disabled }: Props) => {
  const content = (
    <View style={styles.inner}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={variant === 'outline' ? styles.textOutline : styles.text}>{title}</Text>
    </View>
  );

  if (variant === 'gradient' || variant === 'gold') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        onPress={onPress}
        style={[styles.base, style, disabled && styles.disabled]}>
        <LinearGradient
          colors={variant === 'gold' ? [colors.accent, colors.yellow] : [colors.accentAlt, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={[styles.base, styles.outline, style, disabled && styles.disabled]}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
    disabled={disabled}
    onPress={onPress}
    style={[styles.base, styles.solid, style, disabled && styles.disabled]}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 52,
  },
  disabled: {
    opacity: 0.6,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  solid: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  textOutline: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrimaryButton;
