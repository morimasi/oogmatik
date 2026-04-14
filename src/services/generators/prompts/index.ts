import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

import { READING_PROMPTS } from './readingPrompts';
import { MATH_PROMPTS } from './mathPrompts';
import { VISUAL_PROMPTS } from './visualPrompts';
import { PUZZLE_PROMPTS } from './puzzlePrompts';
import { SARI_KITAP_PROMPTS } from './sariKitapPrompts';

export const PROMPTS_REGISTRY: Partial<Record<ActivityType, PromptTemplate>> = {
  ...READING_PROMPTS,
  ...MATH_PROMPTS,
  ...VISUAL_PROMPTS,
  ...PUZZLE_PROMPTS,
  ...SARI_KITAP_PROMPTS,
};

export const getPromptTemplate = (type: ActivityType): PromptTemplate | undefined => {
  return PROMPTS_REGISTRY[type];
};

export type { PromptTemplate };
