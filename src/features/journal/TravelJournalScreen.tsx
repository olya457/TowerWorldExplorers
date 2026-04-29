import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import { blogArticles, BlogArticleExt } from '../../domain/journal/articles';
import { getArticleReadingMinutes, useArticleReads } from '../../domain/journal/useArticleReads';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TravelJournalScreen = () => {
  const navigation = useNavigation<Nav>();
  const reads = useArticleReads();
  const [query, setQuery] = useState('');

  const articles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return blogArticles;
    }
    return blogArticles.filter(article =>
      `${article.title} ${article.subtitle} ${article.description}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const renderItem = ({ item }: { item: BlogArticleExt }) => {
    const text = [
      item.description,
      ...item.sections.map(section => section.text),
      ...item.tips.map(tip => tip.text),
    ].join(' ');
    const minutes = getArticleReadingMinutes(text);
    const read = reads.isRead(item.id);

    return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('JournalArticle', { articleId: item.id })}
      style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {minutes} min read
            {read ? '  •  read' : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <View style={styles.readMore}>
        <Text style={styles.readMoreText}>Read more</Text>
        <Text style={styles.readMoreArrow}>{'\u2192'}</Text>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <BackgroundWrapper>
      <SafePadding>
        <View style={styles.header}>
          <Text style={styles.title}>
            {'\uD83D\uDCDA '}Travel Journal
          </Text>
          <Text style={styles.subtitle}>
            {blogArticles.length} guides, {reads.readIds.length} read
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>{'\u2315'}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search travel guides..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={articles}
          keyExtractor={a => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No guides found</Text>
              <Text style={styles.emptyText}>Try another word from a city, topic, or travel tip.</Text>
            </View>
          }
        />
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },
  searchBox: {
    height: 46,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.yellow,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  readMoreText: {
    color: colors.accentAlt,
    fontWeight: '700',
    marginRight: 6,
  },
  readMoreArrow: {
    color: colors.accentAlt,
    fontWeight: '700',
    fontSize: 16,
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

export default TravelJournalScreen;
