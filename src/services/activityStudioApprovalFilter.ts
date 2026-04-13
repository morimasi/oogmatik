import type { ActivityDraft } from '@/types/admin';

export type ApprovalSourceFilter = 'all' | 'activity-studio' | 'other';

export function isActivityStudioDraft(draft: ActivityDraft): boolean {
  const source = (draft.metadata as Record<string, unknown> | undefined)?.source;
  return (
    draft.baseType === 'activity-studio' ||
    draft.productionMode === 'prompt_generation' ||
    source === 'activity-studio'
  );
}

export function filterDraftsBySource(
  drafts: ActivityDraft[],
  sourceFilter: ApprovalSourceFilter
): ActivityDraft[] {
  if (sourceFilter === 'all') {
    return drafts;
  }

  if (sourceFilter === 'activity-studio') {
    return drafts.filter(isActivityStudioDraft);
  }

  return drafts.filter((draft) => !isActivityStudioDraft(draft));
}
