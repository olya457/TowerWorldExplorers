import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LaunchSequenceScreen from '../../features/launch/LaunchSequenceScreen';
import WelcomeJourneyScreen from '../../features/onboarding/WelcomeJourneyScreen';
import ExplorationTabs from './ExplorationTabs';
import LandmarkProfileScreen from '../../features/landmarks/LandmarkProfileScreen';
import JournalArticleScreen from '../../features/journal/JournalArticleScreen';
import ChallengeRoundScreen from '../../features/challenge/ChallengeRoundScreen';
import ChallengeSummaryScreen from '../../features/challenge/ChallengeSummaryScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="LaunchSequence"
      screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#0B1733' } }}>
      <Stack.Screen name="LaunchSequence" component={LaunchSequenceScreen} />
      <Stack.Screen name="WelcomeJourney" component={WelcomeJourneyScreen} />
      <Stack.Screen name="ExplorationTabs" component={ExplorationTabs} />
      <Stack.Screen
        name="LandmarkProfile"
        component={LandmarkProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="JournalArticle"
        component={JournalArticleScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChallengeRound"
        component={ChallengeRoundScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChallengeSummary"
        component={ChallengeSummaryScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
