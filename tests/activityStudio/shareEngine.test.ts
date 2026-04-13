import { describe, it, expect } from 'vitest';
import { createShareLink } from '@/components/ActivityStudio/preview/ShareEngine';

describe('activity studio share engine', () => {
  it('paylasim linki uretir', () => {
    const link = createShareLink({ activityId: 'id-1', ownerId: 'u-1' });
    expect(link.startsWith('/shared/activity-studio/')).toBe(true);
  });
});
