import { activityStudioLibrary } from '@/data/activityStudioLibrary';
import type { ActivityLibraryItem, ActivityLibraryQuery } from '@/types/activityStudio';

const normalizeText = (value: string): string =>
  value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ç', 'c')
    .replaceAll('ğ', 'g')
    .replaceAll('ı', 'i')
    .replaceAll('ö', 'o')
    .replaceAll('ş', 's')
    .replaceAll('ü', 'u')
    .replace(/\s+/g, ' ')
    .trim();

const matchesProfile = (item: ActivityLibraryItem, profile: ActivityLibraryQuery['profile']): boolean => {
  if (!profile) {
    return true;
  }

  return item.profiles.includes(profile) || item.profiles.includes('mixed');
};

const matchesSearch = (item: ActivityLibraryItem, search: string | undefined): boolean => {
  if (!search) {
    return true;
  }

  return item.searchIndex.includes(normalizeText(search));
};

const matchesTargetSkill = (item: ActivityLibraryItem, targetSkill: string | undefined): boolean => {
  if (!targetSkill) {
    return true;
  }

  const normalizedSkill = normalizeText(targetSkill);
  return item.targetSkills.some((skill) => normalizeText(skill).includes(normalizedSkill));
};

const sortLibraryItems = (items: ActivityLibraryItem[]): ActivityLibraryItem[] =>
  [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.title.localeCompare(right.title, 'tr-TR');
  });

export function getLibraryActivities(query: ActivityLibraryQuery = {}): ActivityLibraryItem[] {
  const filteredItems = activityStudioLibrary.filter((item) => {
    if (query.category && item.category !== query.category) {
      return false;
    }

    if (query.ageGroup && !item.ageGroups.includes(query.ageGroup)) {
      return false;
    }

    if (query.difficulty && !item.difficultyLevels.includes(query.difficulty)) {
      return false;
    }

    if (query.featuredOnly && item.featured === false) {
      return false;
    }

    return matchesProfile(item, query.profile) && matchesSearch(item, query.search) && matchesTargetSkill(item, query.targetSkill);
  });

  return sortLibraryItems(filteredItems);
}

export function getFeaturedLibraryActivities(profile?: ActivityLibraryQuery['profile']): ActivityLibraryItem[] {
  return getLibraryActivities({ featuredOnly: true, profile });
}

export function getLibraryActivityById(id: string): ActivityLibraryItem | undefined {
  return activityStudioLibrary.find((item) => item.id === id);
}
