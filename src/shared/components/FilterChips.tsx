import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  items: readonly string[];
  active: string;
  onChange: (item: string) => void;
};

const FilterChips = ({ items, active, onChange }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map(item => {
        const isActive = item === active;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item)}
            activeOpacity={0.85}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text
              style={[styles.text, isActive && styles.textActive]}
              numberOfLines={1}
              allowFontScaling={false}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingRight: 34,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 46,
    minWidth: 72,
    maxWidth: 150,
    paddingHorizontal: 20,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textActive: {
    color: colors.text,
    fontWeight: '700',
  },
});

export default FilterChips;
