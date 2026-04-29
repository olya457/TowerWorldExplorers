import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import AtlasScreen from '../../features/atlas/AtlasScreen';
import WorldMapScreen from '../../features/map/WorldMapScreen';
import TravelJournalScreen from '../../features/journal/TravelJournalScreen';
import InsightDeckScreen from '../../features/insights/InsightDeckScreen';
import ChallengeHubScreen from '../../features/challenge/ChallengeHubScreen';
import FloatingTabBar from '../../shared/components/FloatingTabBar';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const renderFloatingTabBar = (props: BottomTabBarProps) => (
  <FloatingTabBar {...props} />
);

const ExplorationTabs = () => {
  return (
    <Tab.Navigator
      tabBar={renderFloatingTabBar}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Atlas" component={AtlasScreen} options={{ title: 'Atlas' }} />
      <Tab.Screen name="WorldMap" component={WorldMapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Journal" component={TravelJournalScreen} options={{ title: 'Journal' }} />
      <Tab.Screen name="Insights" component={InsightDeckScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="Challenge" component={ChallengeHubScreen} options={{ title: 'Challenge' }} />
    </Tab.Navigator>
  );
};

export default ExplorationTabs;
