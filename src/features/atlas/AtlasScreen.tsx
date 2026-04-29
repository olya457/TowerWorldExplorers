import React, { useMemo, useState } from 'react';
import {
  FlatList,
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import RandomButton from '../../shared/components/RandomButton';
import { structures } from '../../domain/structures/structures';
import {
  StructureSortMode,
  applyCollectionFilters,
  getCollectionStats,
} from '../../domain/structures/collection';
import { useLandmarkProgress } from '../../domain/structures/useLandmarkProgress';
import { Structure } from '../../domain/models';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const sortOptions: Array<{ label: string; value: StructureSortMode }> = [
  { label: 'Tallest', value: 'heightDesc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'A-Z', value: 'nameAsc' },
];

type ViewMode = 'all' | 'saved' | 'visited';

const AtlasScreen = () => {
  const navigation = useNavigation<Nav>();
  const { width, height } = useWindowDimensions();
  const progress = useLandmarkProgress();
  const stats = useMemo(() => getCollectionStats(), []);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<StructureSortMode>('heightDesc');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const compact = width <= 390 || height <= 700;
  const horizontalPadding = compact ? 16 : 20;
  const cardSizeStyle = useMemo(
    () => ({
      width: width - horizontalPadding * 2,
      height: compact ? 176 : 190,
    }),
    [compact, horizontalPadding, width],
  );
  const listStyle = useMemo(
    () => [
      styles.list,
      compact && styles.listCompact,
      { paddingHorizontal: horizontalPadding },
    ],
    [compact, horizontalPadding],
  );

  const items = useMemo(() => {
    return applyCollectionFilters(structures, {
      category: 'All',
      query,
      sortMode,
      bookmarkedIds: progress.bookmarkedIds,
      visitedIds: progress.visitedIds,
      onlyBookmarked: viewMode === 'saved',
      onlyVisited: viewMode === 'visited',
    });
  }, [
    progress.bookmarkedIds,
    progress.visitedIds,
    query,
    sortMode,
    viewMode,
  ]);
  const randomLabel = compact
    ? 'Surprise me'
    : items.length
      ? 'Surprise me from this set'
      : 'Open any landmark';

  const openRandom = () => {
    const pool = items.length ? items : structures;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    navigation.navigate('LandmarkProfile', { structureId: pick.id });
  };

  const openStructure = (id: string) => {
    progress.markVisited(id);
    navigation.navigate('LandmarkProfile', { structureId: id });
  };

  const renderItem = ({ item }: { item: Structure }) => {
    const saved = progress.isBookmarked(item.id);
    const visited = progress.isVisited(item.id);
    const bookmark = (event: GestureResponderEvent) => {
      event.stopPropagation();
      progress.toggleBookmark(item.id);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openStructure(item.id)}
        style={[styles.card, cardSizeStyle]}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.78)']}
          style={styles.cardOverlay}
        />
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {visited ? (
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedText}>Visited</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={bookmark} style={styles.saveBtn}>
          <Text style={styles.saveText}>{saved ? '\u2605' : '\u2606'}</Text>
        </TouchableOpacity>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardCity}>{item.location}</Text>
          <Text style={styles.cardMeta}>
            {item.height}m
            {item.floors ? `  \u2022  ${item.floors} floors` : ''}
            {`  \u2022  ${item.year}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <SafePadding>
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={listStyle}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={[styles.header, compact && styles.headerCompact]}>
                <Text style={[styles.brand, compact && styles.brandCompact]}>
                  <Text style={styles.brandSky}>Tower</Text>
                  <Text style={styles.brandGuide}>Atlas</Text>
                </Text>
                <Text
                  style={[styles.subtitle, compact && styles.subtitleCompact]}
                  numberOfLines={compact ? 2 : 1}>
                  Curated landmarks, progress, and travel-ready facts
                </Text>
              </View>

              <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
                <View style={[styles.statCard, compact && styles.statCardCompact]}>
                  <Text style={[styles.statValue, compact && styles.statValueCompact]}>
                    {stats.total}
                  </Text>
                  <Text style={styles.statLabel}>places</Text>
                </View>
                <View style={[styles.statCard, compact && styles.statCardCompact]}>
                  <Text style={[styles.statValue, compact && styles.statValueCompact]}>
                    {stats.countries}
                  </Text>
                  <Text style={styles.statLabel}>countries</Text>
                </View>
                <View style={[styles.statCard, compact && styles.statCardCompact]}>
                  <Text style={[styles.statValue, compact && styles.statValueCompact]}>
                    {progress.bookmarkedIds.length}
                  </Text>
                  <Text style={styles.statLabel}>saved</Text>
                </View>
                <View style={[styles.statCard, compact && styles.statCardCompact]}>
                  <Text style={[styles.statValue, compact && styles.statValueCompact]}>
                    {progress.visitedIds.length}
                  </Text>
                  <Text style={styles.statLabel}>visited</Text>
                </View>
              </View>

              <View style={[styles.searchBox, compact && styles.searchBoxCompact]}>
                <Text style={styles.searchIcon}>{'\u2315'}</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={compact ? 'Search landmarks...' : 'Search city, country, landmark...'}
                  placeholderTextColor={colors.textDim}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.modeRow, compact && styles.modeRowCompact]}>
                {(['all', 'saved', 'visited'] as ViewMode[]).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    activeOpacity={0.85}
                    onPress={() => setViewMode(mode)}
                    style={[
                      styles.modeBtn,
                      compact && styles.modeBtnCompact,
                      viewMode === mode && styles.modeBtnActive,
                    ]}>
                    <Text
                      style={[styles.modeText, viewMode === mode && styles.modeTextActive]}
                      numberOfLines={1}
                      allowFontScaling={false}>
                      {mode === 'all' ? 'Library' : mode === 'saved' ? 'Saved' : 'Visited'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.sortRow, compact && styles.sortRowCompact]}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.85}
                    onPress={() => setSortMode(option.value)}
                    style={[
                      styles.sortBtn,
                      compact && styles.sortBtnCompact,
                      sortMode === option.value && styles.sortBtnActive,
                    ]}>
                    <Text
                      style={[styles.sortText, sortMode === option.value && styles.sortTextActive]}
                      numberOfLines={1}
                      allowFontScaling={false}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.randomWrap, compact && styles.randomWrapCompact]}>
                <RandomButton label={randomLabel} onPress={openRandom} compact={compact} />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No landmarks here yet</Text>
              <Text style={styles.emptyText}>Try another category, search term, or progress filter.</Text>
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
    paddingBottom: 10,
  },
  headerCompact: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
  },
  brandCompact: {
    fontSize: 25,
  },
  brandSky: {
    color: colors.accentAlt,
  },
  brandGuide: {
    color: colors.yellow,
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statsRowCompact: {
    gap: 6,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statCardCompact: {
    borderRadius: 13,
    paddingVertical: 8,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statValueCompact: {
    fontSize: 16,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  searchBox: {
    height: 48,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 6,
  },
  modeRowCompact: {
    gap: 6,
    paddingTop: 4,
  },
  modeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnCompact: {
    height: 38,
    borderRadius: 13,
  },
  modeBtnActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  modeTextActive: {
    color: colors.text,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
  },
  sortRowCompact: {
    gap: 6,
    paddingTop: 8,
  },
  sortBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtnCompact: {
    height: 34,
  },
  sortBtnActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  sortText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sortTextActive: {
    color: colors.background,
  },
  randomWrap: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  randomWrapCompact: {
    paddingTop: 10,
    paddingBottom: 6,
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
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 62,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(11,23,51,0.78)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  visitedBadge: {
    backgroundColor: 'rgba(34,197,94,0.22)',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  visitedText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  saveBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(11,23,51,0.82)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: colors.yellow,
    fontSize: 22,
    lineHeight: 24,
  },
  cardText: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  cardCity: {
    color: colors.yellow,
    fontWeight: '700',
    marginTop: 2,
  },
  cardMeta: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  empty: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 22,
    marginTop: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
});

export default AtlasScreen;
