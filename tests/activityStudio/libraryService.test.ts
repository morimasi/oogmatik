import { describe, expect, it } from 'vitest';
import { getFeaturedLibraryActivities, getLibraryActivities } from '@/services/activityStudioLibraryService';

describe('activity studio library service', () => {
  it('profile filtrelemesinde sadece uyumlu etkinlikleri dondurur', () => {
    const items = getLibraryActivities({ profile: 'dyslexia' });

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.profiles.includes('dyslexia') || item.profiles.includes('mixed'))).toBe(true);
  });

  it('arama ve target skill filtrelerini birlikte uygular', () => {
    const items = getLibraryActivities({
      search: 'hece',
      targetSkill: 'fonolojik farkindalik',
    });

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.searchIndex.includes('hece'))).toBe(true);
    expect(items.every((item) => item.targetSkills.includes('fonolojik farkindalik'))).toBe(true);
  });

  it('featured etkinlikleri sira numarasina gore dondurur', () => {
    const items = getFeaturedLibraryActivities('dyslexia');

    expect(items.length).toBeGreaterThan(2);
    expect(items.every((item) => item.featured)).toBe(true);
    expect(items[0].sortOrder).toBeLessThanOrEqual(items[1].sortOrder);
  });
});
