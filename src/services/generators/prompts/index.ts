import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

import { READING_PROMPTS } from './readingPrompts';
import { MATH_PROMPTS } from './mathPrompts';
import { VISUAL_PROMPTS } from './visualPrompts';
import { PUZZLE_PROMPTS } from './puzzlePrompts';

import { synthesizeDynamicPromptTemplate } from '../core/DynamicActivityTaxonomy.js';

export const PROMPTS_REGISTRY: Partial<Record<ActivityType, PromptTemplate>> = {
  ...READING_PROMPTS,
  ...MATH_PROMPTS,
  ...VISUAL_PROMPTS,
  ...PUZZLE_PROMPTS,
};

export const getPromptTemplate = (type: ActivityType): PromptTemplate => {
  return PROMPTS_REGISTRY[type] || synthesizeDynamicPromptTemplate(type);
};

export type { PromptTemplate };
