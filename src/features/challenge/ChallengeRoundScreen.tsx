import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import ScreenHeader from '../../shared/components/ScreenHeader';
import { buildQuizRound } from '../../domain/challenge/quizEngine';
import { QuizQuestion } from '../../domain/models';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'ChallengeRound'>;

const ChallengeRoundScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { questionCount, timeLimit } = route.params;
  const questions = useMemo<QuizQuestion[]>(
    () => buildQuizRound(questionCount),
    [questionCount],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [seconds, setSeconds] = useState(timeLimit);
  const finishedRef = useRef(false);

  const finish = useCallback((finalCorrect: number, finalSecondsUsed: number) => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    navigation.replace('ChallengeSummary', {
      correct: finalCorrect,
      total: questionCount,
      secondsUsed: Math.min(finalSecondsUsed, timeLimit),
    });
  }, [navigation, questionCount, timeLimit]);

  useEffect(() => {
    if (finishedRef.current) {
      return;
    }
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(t);
          finish(correct, timeLimit);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [correct, finish, timeLimit]);

  const current = questions[index];
  const progress = (index + (selected !== null ? 1 : 0)) / questionCount;

  const onSelect = (opt: number) => {
    if (selected !== null) {
      return;
    }
    setSelected(opt);
    const isRight = opt === current.correctIndex;
    const nextCorrect = isRight ? correct + 1 : correct;
    setCorrect(nextCorrect);
    setTimeout(() => {
      if (index + 1 >= questionCount) {
        finish(nextCorrect, timeLimit - seconds);
      } else {
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 700);
  };

  const optionStyle = (i: number) => {
    if (selected === null) {
      return styles.option;
    }
    if (i === current.correctIndex) {
      return [styles.option, styles.optionCorrect];
    }
    if (i === selected) {
      return [styles.option, styles.optionWrong];
    }
    return [styles.option, styles.optionDim];
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <BackgroundWrapper>
      <SafePadding>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <View style={styles.topRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {index + 1}
            </Text>
          </View>
          <Text style={styles.counter}>of {questionCount}</Text>
          <View style={styles.topSpacer} />
          <View style={styles.timer}>
            <Text style={styles.timerIcon}>{'\u23F1'}</Text>
            <Text style={styles.timerText}>{seconds}s</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.accent, colors.yellow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <View style={styles.questionBox}>
          <Text style={styles.question}>{current.question}</Text>
        </View>

        <View style={styles.options}>
          {current.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.9}
              onPress={() => onSelect(i)}
              style={optionStyle(i)}>
              <View style={styles.letter}>
                <Text style={styles.letterText}>{letters[i]}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
              {selected !== null && i === current.correctIndex ? (
                <Text style={styles.iconOk}>{'\u2713'}</Text>
              ) : null}
              {selected === i && i !== current.correctIndex ? (
                <Text style={styles.iconBad}>{'\u2715'}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 13,
  },
  topSpacer: {
    flex: 1,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  timerIcon: {
    color: colors.yellow,
    fontSize: 13,
  },
  timerText: {
    color: colors.yellow,
    fontWeight: '700',
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionBox: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  options: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCorrect: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: colors.green,
  },
  optionWrong: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: colors.red,
  },
  optionDim: {
    opacity: 0.55,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: colors.textMuted,
    fontWeight: '800',
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  iconOk: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '800',
  },
  iconBad: {
    color: colors.red,
    fontSize: 18,
    fontWeight: '800',
  },
});

export default ChallengeRoundScreen;
