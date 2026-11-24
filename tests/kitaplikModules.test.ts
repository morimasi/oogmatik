import { describe, it, expect, beforeEach } from 'vitest';
import { statsService } from '../src/services/statsService';
import { ActivityType } from '../src/types/activity';
import { rbacService } from '../src/services/rbacService';
import { buildDefaultRBAC } from '../src/types/rbac-advanced';

const createMemoryStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
};

describe('Kitaplık Modülleri (Favoriler, Dijital Arşiv, Paylaşılanlar, İşlem Geçmişi)', () => {
  beforeEach(() => {
    const memStorage = createMemoryStorage();
    Object.defineProperty(globalThis, 'localStorage', { value: memStorage, configurable: true });
    Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
    rbacService.updateSettings(buildDefaultRBAC());
  });

  describe('statsService — Favori Etkinliklerim', () => {
    it('adds and removes favorites in localStorage cleanly', () => {
      expect(statsService.getFavorites()).toEqual([]);

      const afterAdd = statsService.toggleFavorite(ActivityType.WORD_SEARCH);
      expect(afterAdd).toContain(ActivityType.WORD_SEARCH);
      expect(statsService.isFavorite(ActivityType.WORD_SEARCH)).toBe(true);

      const afterRemove = statsService.toggleFavorite(ActivityType.WORD_SEARCH);
      expect(afterRemove).not.toContain(ActivityType.WORD_SEARCH);
      expect(statsService.isFavorite(ActivityType.WORD_SEARCH)).toBe(false);
    });

    it('merges remote favorites with local favorites without duplicates', () => {
      statsService.toggleFavorite(ActivityType.WORD_SEARCH);
      const merged = statsService.syncFavorites([
        ActivityType.WORD_SEARCH,
        ActivityType.MATH_PUZZLE,
      ]);
      expect(merged).toHaveLength(2);
      expect(merged).toContain(ActivityType.WORD_SEARCH);
      expect(merged).toContain(ActivityType.MATH_PUZZLE);
    });
  });

  describe('RBAC — Kitaplık Modül Erişim Matrisi', () => {
    it('grants teacher access to all 4 Kitaplık modules', () => {
      expect(rbacService.canAccessModule('teacher', 'favorites')).toBe(true);
      expect(rbacService.canAccessModule('teacher', 'archive')).toBe(true);
      expect(rbacService.canAccessModule('teacher', 'shared-materials')).toBe(true);
      expect(rbacService.canAccessModule('teacher', 'activity-history')).toBe(true);
    });

    it('restricts student from archive deletion while allowing shared-materials and activity-history view', () => {
      expect(rbacService.canAccessModule('student', 'shared-materials')).toBe(true);
      expect(rbacService.canAccessModule('student', 'activity-history')).toBe(true);
      expect(rbacService.hasPermission('student', 'archive', 'delete')).toBe(false);
      expect(rbacService.hasPermission('student', 'shared-materials', 'export')).toBe(false);
    });

    it('grants parent view access to shared-materials and activity-history', () => {
      expect(rbacService.canAccessModule('parent', 'shared-materials')).toBe(true);
      expect(rbacService.canAccessModule('parent', 'activity-history')).toBe(true);
    });
  });
});
