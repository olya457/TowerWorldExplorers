import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import { RootStackParamList } from '../../core/navigation/types';
import { QuizStats, createInitialQuizStats } from '../../domain/challenge/quizEngine';
import { saveQuizAttempt } from '../../domain/challenge/quizStatsStorage';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'ChallengeSummary'>;

const getLabel = (pct: number) => {
  if (pct >= 80) {
    return 'Amazing!';
  }
  if (pct >= 60) {
    return 'Great work!';
  }
  if (pct >= 40) {
    return 'Keep going!';
  }
  return 'Keep learning!';
};

const getRetryTime = (total: number) => {
  if (total <= 5) {
    return 45;
  }
  if (total <= 10) {
    return 90;
  }
  return 150;
};

const ChallengeSummaryScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { correct, total, secondsUsed } = route.params;
  const pct = Math.round((correct / total) * 100);
  const [stats, setStats] = useState<QuizStats>(createInitialQuizStats());

  useEffect(() => {
    saveQuizAttempt({
      correct,
      total,
      secondsUsed,
      createdAt: Date.now(),
    }).then(setStats).catch(() => {});
  }, [correct, secondsUsed, total]);

  const share = async () => {
    try {
      await Share.share({
        message: `I scored ${correct}/${total} (${pct}%) in ${secondsUsed}s on Skyline Challenge!`,
      });
    } catch {}
  };

  const again = () => {
    navigation.replace('ChallengeRound', {
      questionCount: total,
      timeLimit: getRetryTime(total),
    });
  };

  return (
    <BackgroundWrapper>
      <SafePadding>
        <View style={styles.center}>
          <Text style={styles.trophy}>{'\uD83C\uDFC6'}</Text>
          <Text style={styles.title}>Challenge Complete</Text>
          <Text style={styles.subtitle}>Score saved to your local progress</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.score}>
              <Text style={styles.scoreBig}>{correct}</Text>
              <Text style={styles.scoreSmall}>/{total}</Text>
            </Text>
            <Text style={styles.pct}>{pct}%</Text>
            <Text style={styles.timeUsed}>{secondsUsed}s used</Text>
            <Text style={styles.label}>{getLabel(pct)}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniValue}>{stats.bestPercent}%</Text>
              <Text style={styles.miniLabel}>best</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniValue}>{stats.attempts}</Text>
              <Text style={styles.miniLabel}>attempts</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={again} style={styles.againBtn}>
            <LinearGradient
              colors={[colors.accentAlt, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fill}>
              <Text style={styles.againIcon}>{'\u21BB'}</Text>
              <Text style={styles.againText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} onPress={share} style={styles.shareBtn}>
            <LinearGradient
              colors={[colors.accentAlt, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fill}>
              <Text style={styles.againIcon}>{'\u27A4'}</Text>
              <Text style={styles.againText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  trophy: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },
  scoreCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  score: {
    textAlign: 'center',
  },
  scoreBig: {
    color: colors.accentAlt,
    fontSize: 56,
    fontWeight: '800',
  },
  scoreSmall: {
    color: colors.textMuted,
    fontSize: 28,
    fontWeight: '700',
  },
  pct: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  timeUsed: {
    color: colors.yellow,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  label: {
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  miniStat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  miniValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  miniLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  againBtn: {
    width: '100%',
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareBtn: {
    width: '100%',
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fill: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  againIcon: {
    color: colors.text,
    fontSize: 16,
  },
  againText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ChallengeSummaryScreen;
