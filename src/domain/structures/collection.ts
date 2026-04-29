import { Structure, StructureCategory } from '../models';
import { structures } from './structures';

export type StructureSortMode = 'heightDesc' | 'newest' | 'oldest' | 'nameAsc';

export type CollectionFilters = {
  category: 'All' | StructureCategory;
  query: string;
  sortMode: StructureSortMode;
  bookmarkedIds?: string[];
  visitedIds?: string[];
  onlyBookmarked?: boolean;
  onlyVisited?: boolean;
};

export type CollectionStats = {
  total: number;
  countries: number;
  tallest: Structure;
  averageHeight: number;
  newest: Structure;
};

const normalize = (value: string) => value.trim().toLowerCase();

export const getCollectionStats = (items: Structure[] = structures): CollectionStats => {
  const countries = new Set(items.map(item => item.country)).size;
  const tallest = [...items].sort((a, b) => b.height - a.height)[0];
  const newest = [...items].sort((a, b) => b.year - a.year)[0];
  const averageHeight = Math.round(
    items.reduce((sum, item) => sum + item.height, 0) / Math.max(items.length, 1),
  );

  return {
    total: items.length,
    countries,
    tallest,
    averageHeight,
    newest,
  };
};

export const applyCollectionFilters = (
  items: Structure[],
  filters: CollectionFilters,
) => {
  const query = normalize(filters.query);
  const bookmarked = new Set(filters.bookmarkedIds ?? []);
  const visited = new Set(filters.visitedIds ?? []);

  const filtered = items.filter(item => {
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }

    if (filters.onlyBookmarked && !bookmarked.has(item.id)) {
      return false;
    }

    if (filters.onlyVisited && !visited.has(item.id)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = normalize(
      [item.name, item.city, item.country, item.location, item.category, item.description].join(' '),
    );

    return haystack.includes(query);
  });

  return filtered.sort((a, b) => {
    if (filters.sortMode === 'newest') {
      return b.year - a.year;
    }
    if (filters.sortMode === 'oldest') {
      return a.year - b.year;
    }
    if (filters.sortMode === 'nameAsc') {
      return a.name.localeCompare(b.name);
    }
    return b.height - a.height;
  });
};

export const getNearbyStructures = (structureId: string, count = 4) => {
  const selected = structures.find(item => item.id === structureId);

  if (!selected) {
    return [];
  }

  return structures
    .filter(item => item.id !== selected.id)
    .map(item => ({
      item,
      distance:
        Math.abs(item.latitude - selected.latitude) +
        Math.abs(item.longitude - selected.longitude),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(entry => entry.item);
};

export const getCategorySummary = (items: Structure[] = structures) => {
  return items.reduce<Record<StructureCategory, number>>(
    (acc, item) => {
      acc[item.category] += 1;
      return acc;
    },
    { Skyscraper: 0, Tower: 0, Monument: 0 },
  );
};
