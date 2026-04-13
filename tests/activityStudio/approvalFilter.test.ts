import { describe, expect, it } from 'vitest';
import { filterDraftsBySource, isActivityStudioDraft } from '@/services/activityStudioApprovalFilter';
import type { ActivityDraft } from '@/types/admin';

const makeDraft = (overrides: Partial<ActivityDraft>): ActivityDraft => ({
  id: 'd1',
  title: 'draft',
  baseType: 'reading',
  productionMode: 'ocr_variation',
  status: 'pending_review',
  content: [],
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('activityStudioApprovalFilter', () => {
  it('activity studio taslagini dogru tanir', () => {
    const studio = makeDraft({ productionMode: 'prompt_generation' });
    const other = makeDraft({ productionMode: 'ocr_variation' });

    expect(isActivityStudioDraft(studio)).toBe(true);
    expect(isActivityStudioDraft(other)).toBe(false);
  });

  it('kaynak filtresine gore listeyi daraltir', () => {
    const drafts = [
      makeDraft({ id: 'a', productionMode: 'prompt_generation' }),
      makeDraft({ id: 'b', productionMode: 'ocr_variation' }),
    ];

    expect(filterDraftsBySource(drafts, 'activity-studio')).toHaveLength(1);
    expect(filterDraftsBySource(drafts, 'other')).toHaveLength(1);
    expect(filterDraftsBySource(drafts, 'all')).toHaveLength(2);
  });
});
