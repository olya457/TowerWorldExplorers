import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import ScreenHeader from '../../shared/components/ScreenHeader';
import { getBlogById } from '../../domain/journal/articles';
import { getArticleReadingMinutes, useArticleReads } from '../../domain/journal/useArticleReads';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'JournalArticle'>;
type Rt = RouteProp<RootStackParamList, 'JournalArticle'>;

const JournalArticleScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const article = getBlogById(route.params.articleId);
  const { markRead } = useArticleReads();

  useEffect(() => {
    if (article) {
      markRead(article.id);
    }
  }, [article, markRead]);

  const minutes = useMemo(() => {
    if (!article) {
      return 0;
    }
    return getArticleReadingMinutes(
      [
        article.description,
        ...article.sections.map(section => section.text),
        ...article.tips.map(tip => tip.text),
      ].join(' '),
    );
  }, [article]);

  const share = async () => {
    if (!article) {
      return;
    }
    try {
      await Share.share({
        message: `${article.title}\n\n${article.description}`,
      });
    } catch {}
  };

  if (!article) {
    return (
      <BackgroundWrapper>
        <SafePadding>
          <ScreenHeader onBack={() => navigation.goBack()} />
          <Text style={styles.missing}>Article not found</Text>
        </SafePadding>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafePadding>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroEmoji}>{article.emoji}</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.subtitle}>{article.subtitle}</Text>
          <Text style={styles.readMeta}>{minutes} min guide • saved as read</Text>

          <View style={styles.introCard}>
            <Text style={styles.introText}>{article.description}</Text>
          </View>

          {article.sections.map((sec, idx) => (
            <View key={idx} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionEmojiWrap}>
                  <Text style={styles.sectionEmoji}>{sec.emoji}</Text>
                </View>
                <Text style={styles.sectionTitle}>{sec.title}</Text>
              </View>
              <Text style={styles.sectionText}>{sec.text}</Text>
            </View>
          ))}

          <Text style={styles.tipsTitle}>{'\u2728 '}Quick Tips</Text>
          <View style={styles.tipsCard}>
            {article.tips.map((tip, i) => (
              <View
                key={i}
                style={[styles.tipRow, i === article.tips.length - 1 && styles.tipRowLast]}>
                <View style={styles.tipEmojiWrap}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              {'\uD83D\uDCA1 '}Have a great visit and enjoy every perspective!
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.9} onPress={share} style={styles.shareBtn}>
            <LinearGradient
              colors={[colors.accentAlt, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareFill}>
              <View style={styles.shareInner}>
                <Text style={styles.shareIcon}>{'\u27A4'}</Text>
                <Text style={styles.shareText}>Share this article</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 120,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEmoji: {
    fontSize: 34,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  readMeta: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  introCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introText: {
    color: colors.textMuted,
    fontSize: 14.5,
    lineHeight: 22,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    flexShrink: 1,
  },
  sectionText: {
    color: colors.textMuted,
    fontSize: 14.5,
    lineHeight: 22,
  },
  tipsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 10,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tipRowLast: {
    borderBottomWidth: 0,
  },
  tipEmojiWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipText: {
    color: colors.text,
    fontSize: 14.5,
    flexShrink: 1,
  },
  footerNote: {
    marginTop: 24,
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    padding: 14,
  },
  footerNoteText: {
    color: colors.text,
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  shareBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 54,
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
    fontSize: 15,
    marginRight: 10,
  },
  shareText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  missing: {
    color: colors.text,
    textAlign: 'center',
    padding: 24,
  },
});

export default JournalArticleScreen;
