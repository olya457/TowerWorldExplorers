export type RootStackParamList = {
  LaunchSequence: undefined;
  WelcomeJourney: undefined;
  ExplorationTabs: undefined;
  LandmarkProfile: { structureId: string };
  JournalArticle: { articleId: string };
  ChallengeRound: { questionCount: number; timeLimit: number };
  ChallengeSummary: { correct: number; total: number; secondsUsed: number };
};

export type TabParamList = {
  Atlas: undefined;
  WorldMap: undefined;
  Journal: undefined;
  Insights: undefined;
  Challenge: undefined;
};
