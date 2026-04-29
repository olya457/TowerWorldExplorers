import { useCallback, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { storageKeys } from '../../shared/storage/keys';

const fallback: string[] = [];

export const useInsightFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(fallback);

  useEffect(() => {
    let mounted = true;
    readJson(storageKeys.insightFavorites, fallback).then(value => {
      if (mounted && Array.isArray(value)) {
        setFavoriteIds(value);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = favoriteIds.includes(id)
        ? favoriteIds.filter(item => item !== id)
        : [...favoriteIds, id];
      setFavoriteIds(next);
      writeJson(storageKeys.insightFavorites, next).catch(() => {});
    },
    [favoriteIds],
  );

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    favoriteIds,
    favoriteSet,
    toggleFavorite,
    isFavorite: (id: string) => favoriteSet.has(id),
  };
};
