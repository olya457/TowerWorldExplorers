import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  name: 'atlas' | 'globe' | 'journal' | 'insights' | 'challenge';
  active: boolean;
  size?: number;
};

const symbolMap: Record<Props['name'], string> = {
  atlas: '\uD83C\uDFD9',
  globe: '\uD83C\uDF0D',
  journal: '\uD83D\uDCD6',
  insights: '\uD83D\uDCA1',
  challenge: '\uD83C\uDFC6',
};

const TabIcon = ({ name, active, size = 20 }: Props) => {
  const wrapSizeStyle = { width: size + 6, height: size + 6 };
  const textSizeStyle = { fontSize: size, lineHeight: size + 4 };

  return (
    <View style={[styles.wrap, wrapSizeStyle, !active && styles.inactive]}>
      <Text style={[styles.icon, textSizeStyle]}>
        {symbolMap[name]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.text,
  },
  inactive: {
    opacity: 0.55,
  },
});

export default TabIcon;
