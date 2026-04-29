import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';

import { facts } from '../../domain/insights/facts';
import { useInsightFavorites } from '../../domain/insights/useInsightFavorites';
import { FactItem } from '../../domain/models';
import { colors } from '../../shared/theme/colors';

const categoryOptions = [
  { label: 'All', value: 'All' },
  { label: 'Skyscraper', value: 'Skyscraper' },
  { label: 'Tower', value: 'Tower' },
  { label: 'Monument', value: 'Monument' },
] as const;

const InsightDeckScreen = () => {
  const { width, height } = useWindowDimensions();
  const [filter, setFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [highlightedFactId, setHighlightedFactId] = useState<string | null>(null);
  const favorites = useInsightFavorites();
  const compact = width <= 390 || height <= 720;
  const horizontalPadding = compact ? 16 : 20;
  const listStyle = useMemo(
    () => [
      styles.list,
      compact && styles.listCompact,
      { paddingHorizontal: horizontalPadding },
    ],
    [compact, horizontalPadding],
  );

  const dailyFact = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    return facts[day % facts.length];
  }, []);

  const items = useMemo<FactItem[]>(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = facts.filter(fact => {
      if (filter !== 'All' && fact.category !== filter) {
        return false;
      }
      if (favoritesOnly && !favorites.favoriteSet.has(fact.id)) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return `${fact.topic} ${fact.text} ${fact.category}`
        .toLowerCase()
        .includes(normalized);
    });

    if (!highlightedFactId) {
      return filtered;
    }

    const highlighted = filtered.find(fact => fact.id === highlightedFactId);
    if (!highlighted) {
      return filtered;
    }

    return [
      highlighted,
      ...filtered.filter(fact => fact.id !== highlightedFactId),
    ];
  }, [favorites.favoriteSet, favoritesOnly, filter, highlightedFactId, query]);

  const openRandom = () => {
    const pool = items.length ? items : facts;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setFavoritesOnly(false);
    setQuery('');
    setFilter(pick.category);
    setHighlightedFactId(pick.id);
  };

  const toggleFavoritesOnly = () => {
    setHighlightedFactId(null);
    setFavoritesOnly(value => !value);
  };

  const shareFact = (item: FactItem) => {
    Share.share({ message: `${item.topic}: ${item.text}` }).catch(() => {});
  };

  const renderItem = ({ item }: { item: FactItem }) => (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        highlightedFactId === item.id && styles.cardHighlighted,
      ]}>
      <View style={styles.cardTop}>
        <Text style={styles.topic}>{'\uD83D\uDCA1 '}{item.topic}</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => favorites.toggleFavorite(item.id)}
          style={styles.favoriteBtn}>
          <Text style={styles.favoriteText}>
            {favorites.isFavorite(item.id) ? '\u2605' : '\u2606'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => shareFact(item)}
        style={[styles.shareBtn, compact && styles.shareBtnCompact]}>
        <LinearGradient
          colors={[colors.accentAlt, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareFill}>
          <View style={styles.shareInner}>
            <Text style={styles.shareIcon}>{'\u27A4'}</Text>
            <Text style={styles.shareText}>Share</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundWrapper>
      <SafePadding>
        <FlatList
          data={items}
          keyExtractor={f => f.id}
          renderItem={renderItem}
          contentContainerStyle={listStyle}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={[styles.header, compact && styles.headerCompact]}>
                <Text style={[styles.title, compact && styles.titleCompact]}>
                  Insight Deck
                </Text>
                <Text
                  style={[styles.subtitle, compact && styles.subtitleCompact]}
                  numberOfLines={compact ? 2 : 1}>
                  Search, save, and share focused facts
                </Text>
              </View>

              <View style={[styles.dailyCard, compact && styles.dailyCardCompact]}>
                <Text style={styles.dailyLabel}>Daily insight</Text>
                <Text
                  style={[styles.dailyText, compact && styles.dailyTextCompact]}
                  numberOfLines={compact ? 3 : undefined}>
                  {dailyFact.text}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => shareFact(dailyFact)}
                  style={[styles.dailyAction, compact && styles.dailyActionCompact]}>
                  <Text style={styles.dailyActionText} numberOfLines={1} allowFontScaling={false}>
                    Share today
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.searchBox, compact && styles.searchBoxCompact]}>
                <Text style={styles.searchIcon}>{'\u2315'}</Text>
                <TextInput
                  value={query}
                  onChangeText={value => {
                    setHighlightedFactId(null);
                    setQuery(value);
                  }}
                  placeholder={compact ? 'Search facts...' : 'Search topic or fact...'}
                  placeholderTextColor={colors.textDim}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.categoryGrid, compact && styles.categoryGridCompact]}>
                {categoryOptions.map(option => {
                  const active = filter === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.85}
                      onPress={() => {
                        setHighlightedFactId(null);
                        setFilter(option.value);
                      }}
                      style={[styles.categoryBtn, active && styles.categoryBtnActive]}>
                      <Text
                        style={[
                          styles.categoryBtnText,
                          active && styles.categoryBtnTextActive,
                        ]}
                        numberOfLines={1}
                        allowFontScaling={false}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={toggleFavoritesOnly}
                  style={[
                    styles.toggleBtn,
                    compact && styles.toggleBtnCompact,
                    favoritesOnly && styles.toggleBtnActive,
                  ]}>
                  <Text
                    style={[styles.toggleText, favoritesOnly && styles.toggleTextActive]}
                    numberOfLines={1}
                    allowFontScaling={false}>
                    Saved only
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={openRandom}
                  style={[styles.randomBtn, compact && styles.randomBtnCompact]}>
                  <Text style={styles.randomText} numberOfLines={1} allowFontScaling={false}>
                    {compact ? 'Random' : 'Random fact'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No facts found</Text>
              <Text style={styles.emptyText}>Try a different search or turn off saved-only mode.</Text>
            </View>
          }
        />
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerCompact: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  titleCompact: {
    fontSize: 24,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  dailyCard: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  dailyCardCompact: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  dailyLabel: {
    color: colors.accentAlt,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dailyText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  dailyTextCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  dailyAction: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dailyActionCompact: {
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  dailyActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  searchBox: {
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  searchBoxCompact: {
    height: 44,
    marginBottom: 6,
  },
  searchIcon: {
    color: colors.textMuted,
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 6,
  },
  categoryGridCompact: {
    gap: 6,
    paddingTop: 4,
  },
  categoryBtn: {
    width: '48.8%',
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  categoryBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  categoryBtnTextActive: {
    color: colors.text,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 12,
  },
  controlsRowCompact: {
    gap: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnCompact: {
    height: 38,
    borderRadius: 13,
  },
  toggleBtnActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  toggleText: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 13,
  },
  toggleTextActive: {
    color: colors.text,
  },
  randomBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomBtnCompact: {
    height: 38,
    borderRadius: 13,
  },
  randomText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 150,
  },
  listCompact: {
    paddingTop: 0,
    paddingBottom: 126,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardCompact: {
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
  },
  cardHighlighted: {
    borderColor: colors.yellow,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topic: {
    color: colors.accentAlt,
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  favoriteBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  favoriteText: {
    color: colors.yellow,
    fontSize: 20,
    lineHeight: 22,
  },
  category: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  shareBtn: {
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
    height: 44,
  },
  shareBtnCompact: {
    height: 40,
    marginTop: 12,
    borderRadius: 13,
  },
  shareFill: {
    flex: 1,
  },
  shareInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  shareText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 6,
  },
});

export default InsightDeckScreen;
