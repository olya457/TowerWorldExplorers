import { useCallback, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { storageKeys } from '../../shared/storage/keys';

export const getArticleReadingMinutes = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
};

export const useArticleReads = () => {
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    readJson(storageKeys.articleReads, [] as string[]).then(value => {
      if (mounted && Array.isArray(value)) {
        setReadIds(value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const markRead = useCallback(
    (id: string) => {
      if (readIds.includes(id)) {
        return;
      }
      const next = [...readIds, id];
      setReadIds(next);
      writeJson(storageKeys.articleReads, next).catch(() => {});
    },
    [readIds],
  );

  const readSet = useMemo(() => new Set(readIds), [readIds]);

  return {
    readIds,
    readSet,
    isRead: (id: string) => readSet.has(id),
    markRead,
  };
};
