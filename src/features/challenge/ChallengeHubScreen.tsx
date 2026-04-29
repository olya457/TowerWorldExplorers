import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import { RootStackParamList } from '../../core/navigation/types';
import { QuizStats, createInitialQuizStats } from '../../domain/challenge/quizEngine';
import { readQuizStats } from '../../domain/challenge/quizStatsStorage';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const presets = [
  { label: 'Sprint', questionCount: 5, timeLimit: 45 },
  { label: 'Classic', questionCount: 10, timeLimit: 90 },
  { label: 'Expert', questionCount: 15, timeLimit: 150 },
];

const CheckItem = ({ text }: { text: string }) => (
  <View style={styles.checkRow}>
    <View style={styles.checkDot}>
      <Text style={styles.checkIcon}>{'\u2713'}</Text>
    </View>
    <Text style={styles.checkText}>{text}</Text>
  </View>
);

const ChallengeHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const [selectedPreset, setSelectedPreset] = useState(presets[1]);
  const [stats, setStats] = useState<QuizStats>(createInitialQuizStats());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      readQuizStats().then(value => {
        if (active) {
          setStats(value);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const start = () =>
    navigation.navigate('ChallengeRound', {
      questionCount: selectedPreset.questionCount,
      timeLimit: selectedPreset.timeLimit,
    });

  return (
    <BackgroundWrapper>
      <SafePadding>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.trophyWrap}>
            <Text style={styles.trophy}>{'\uD83C\uDFC6'}</Text>
          </View>

          <Text style={styles.title}>Skyline Challenge</Text>
          <Text style={styles.subtitle}>
            Pick a pace, answer shuffled questions, and build a score history.
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.scoreTile}>
              <Text style={styles.scoreValue}>{stats.bestPercent}%</Text>
              <Text style={styles.scoreLabel}>best</Text>
            </View>
            <View style={styles.scoreTile}>
              <Text style={styles.scoreValue}>{stats.attempts}</Text>
              <Text style={styles.scoreLabel}>runs</Text>
            </View>
            <View style={styles.scoreTile}>
              <Text style={styles.scoreValue}>
                {stats.latest ? `${stats.latest.correct}/${stats.latest.total}` : '0/0'}
              </Text>
              <Text style={styles.scoreLabel}>latest</Text>
            </View>
          </View>

          <View style={styles.presetRow}>
            {presets.map(preset => {
              const active = selectedPreset.label === preset.label;
              return (
                <TouchableOpacity
                  key={preset.label}
                  activeOpacity={0.85}
                  onPress={() => setSelectedPreset(preset)}
                  style={[styles.presetCard, active && styles.presetCardActive]}>
                  <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                    {preset.label}
                  </Text>
                  <Text style={styles.presetMeta}>{preset.questionCount} Q</Text>
                  <Text style={styles.presetMeta}>{preset.timeLimit}s</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoCard}>
            <CheckItem text={`${selectedPreset.questionCount} questions selected`} />
            <CheckItem text={`${selectedPreset.timeLimit} seconds to complete`} />
            <CheckItem text="Answers shuffle every round" />
            <CheckItem text="Best score is saved locally" />
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={start} style={styles.startBtn}>
            <LinearGradient
              colors={[colors.accent, colors.yellow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startFill}>
              <Text style={styles.startText}>Start Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 160,
  },
  trophyWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(250,204,21,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  trophy: {
    fontSize: 62,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  scoreTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scoreValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  presetRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  presetCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    justifyContent: 'center',
  },
  presetCardActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  presetLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  presetLabelActive: {
    color: colors.accentAlt,
  },
  presetMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.accentAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: colors.accentAlt,
    fontSize: 14,
    fontWeight: '800',
  },
  checkText: {
    color: colors.text,
    fontSize: 15,
  },
  startBtn: {
    width: '100%',
    marginTop: 28,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startFill: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ChallengeHubScreen;
