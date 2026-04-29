import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { storageKeys } from '../../shared/storage/keys';
import {
  QuizAttempt,
  QuizStats,
  createInitialQuizStats,
  mergeAttemptIntoStats,
} from './quizEngine';

export const readQuizStats = () =>
  readJson<QuizStats>(storageKeys.quizStats, createInitialQuizStats());

export const saveQuizAttempt = async (attempt: QuizAttempt) => {
  const current = await readQuizStats();
  const next = mergeAttemptIntoStats(current, attempt);
  await writeJson(storageKeys.quizStats, next);
  return next;
};
