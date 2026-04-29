import { useCallback, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { storageKeys } from '../../shared/storage/keys';

type LandmarkProgress = {
  bookmarkedIds: string[];
  visitedIds: string[];
  updatedAt: number;
};

const fallbackProgress: LandmarkProgress = {
  bookmarkedIds: [],
  visitedIds: [],
  updatedAt: 0,
};

const uniqueToggle = (items: string[], id: string) => {
  if (items.includes(id)) {
    return items.filter(item => item !== id);
  }
  return [...items, id];
};

export const useLandmarkProgress = () => {
  const [progress, setProgress] = useState<LandmarkProgress>(fallbackProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    readJson(storageKeys.landmarkProgress, fallbackProgress).then(value => {
      if (!mounted) {
        return;
      }
      setProgress({
        bookmarkedIds: Array.isArray(value.bookmarkedIds) ? value.bookmarkedIds : [],
        visitedIds: Array.isArray(value.visitedIds) ? value.visitedIds : [],
        updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
      });
      setHydrated(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const save = useCallback((next: LandmarkProgress) => {
    setProgress(next);
    writeJson(storageKeys.landmarkProgress, next).catch(() => {});
  }, []);

  const toggleBookmark = useCallback(
    (id: string) => {
      const next = {
        ...progress,
        bookmarkedIds: uniqueToggle(progress.bookmarkedIds, id),
        updatedAt: Date.now(),
      };
      save(next);
    },
    [progress, save],
  );

  const toggleVisited = useCallback(
    (id: string) => {
      const next = {
        ...progress,
        visitedIds: uniqueToggle(progress.visitedIds, id),
        updatedAt: Date.now(),
      };
      save(next);
    },
    [progress, save],
  );

  const markVisited = useCallback(
    (id: string) => {
      if (progress.visitedIds.includes(id)) {
        return;
      }
      save({
        ...progress,
        visitedIds: [...progress.visitedIds, id],
        updatedAt: Date.now(),
      });
    },
    [progress, save],
  );

  const bookmarkedSet = useMemo(
    () => new Set(progress.bookmarkedIds),
    [progress.bookmarkedIds],
  );
  const visitedSet = useMemo(() => new Set(progress.visitedIds), [progress.visitedIds]);

  return {
    hydrated,
    bookmarkedIds: progress.bookmarkedIds,
    visitedIds: progress.visitedIds,
    bookmarkedSet,
    visitedSet,
    isBookmarked: (id: string) => bookmarkedSet.has(id),
    isVisited: (id: string) => visitedSet.has(id),
    toggleBookmark,
    toggleVisited,
    markVisited,
  };
};
