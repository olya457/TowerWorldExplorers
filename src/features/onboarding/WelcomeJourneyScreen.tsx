import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import SafePadding from '../../shared/components/SafePadding';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';
import { storageKeys } from '../../shared/storage/keys';
import { writeJson } from '../../shared/storage/jsonStorage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WelcomeJourney'>;

type Slide = {
  image: any;
  title: string;
  subtitle: string;
};

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const slides: Slide[] = [
  {
    image: require('../../assets/onboarding1.png'),
    title: 'Welcome to Tower\nWorld Explorer',
    subtitle: 'Discover the world\u2019s tallest icons in a fun and interactive way',
  },
  {
    image: require('../../assets/onboarding2.png'),
    title: 'Explore Iconic Towers',
    subtitle: 'Browse stunning landmarks, learn their stories, and see what makes them unique',
  },
  {
    image: require('../../assets/onboarding3.png'),
    title: 'Travel the World',
    subtitle: 'Find towers on the map and explore their real-world locations',
  },
  {
    image: require('../../assets/onboarding4.png'),
    title: 'Learn & Discover',
    subtitle: 'Unlock fun facts, travel tips, and stories from around the globe',
  },
  {
    image: require('../../assets/onboarding5.png'),
    title: 'Test Your Knowledge',
    subtitle: 'Take quick quizzes, beat the timer, and become a true tower expert',
  },
];

const WelcomeJourneyScreen = () => {
  const navigation = useNavigation<Nav>();
  const [index, setIndex] = useState(0);

  const finish = () => {
    writeJson(storageKeys.onboardingCompleted, true).catch(() => {});
    navigation.reset({ index: 0, routes: [{ name: 'ExplorationTabs' }] });
  };

  const go = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const skip = () => {
    finish();
  };

  const current = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <BackgroundWrapper>
      <SafePadding style={styles.root}>
        <View style={styles.imageBox}>
          <Image
            source={current.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </View>

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={skip} activeOpacity={0.8} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={go} activeOpacity={0.9} style={styles.nextWrap}>
            <LinearGradient
              colors={[colors.accentAlt, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextBtn}>
              <Text style={styles.nextText}>{isLast ? 'Start' : 'Next'}</Text>
              <Text style={styles.nextArrow}>{'\u203A'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafePadding>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  imageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'android' ? -30 : 0,
  },
  image: {
    width: width * 0.72,
    height: isSmall ? height * 0.32 : height * 0.38,
  },
  textBox: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: isSmall ? 22 : 26,
    fontWeight: '800',
    lineHeight: isSmall ? 28 : 32,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 26,
    backgroundColor: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  skipBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  nextWrap: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  nextArrow: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default WelcomeJourneyScreen;
