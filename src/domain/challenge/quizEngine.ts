import { QuizQuestion } from '../models';
import { quizQuestions } from './questionBank';

export type QuizAttempt = {
  correct: number;
  total: number;
  secondsUsed: number;
  createdAt: number;
};

export type QuizStats = {
  attempts: number;
  bestPercent: number;
  bestCorrect: number;
  bestTotal: number;
  latest?: QuizAttempt;
};

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const buildQuizRound = (count: number): QuizQuestion[] => {
  return shuffle(quizQuestions)
    .slice(0, count)
    .map(question => {
      const correctOption = question.options[question.correctIndex];
      const options = shuffle(question.options);
      return {
        ...question,
        options,
        correctIndex: options.indexOf(correctOption),
      };
    });
};

export const createInitialQuizStats = (): QuizStats => ({
  attempts: 0,
  bestPercent: 0,
  bestCorrect: 0,
  bestTotal: 0,
});

export const mergeAttemptIntoStats = (
  current: QuizStats,
  attempt: QuizAttempt,
): QuizStats => {
  const currentBest = current.bestPercent ?? 0;
  const attemptPercent = Math.round((attempt.correct / Math.max(attempt.total, 1)) * 100);
  const isBest =
    attemptPercent > currentBest ||
    (attemptPercent === currentBest && attempt.correct > (current.bestCorrect ?? 0));

  return {
    attempts: (current.attempts ?? 0) + 1,
    bestPercent: isBest ? attemptPercent : currentBest,
    bestCorrect: isBest ? attempt.correct : current.bestCorrect ?? 0,
    bestTotal: isBest ? attempt.total : current.bestTotal ?? 0,
    latest: attempt,
  };
};
