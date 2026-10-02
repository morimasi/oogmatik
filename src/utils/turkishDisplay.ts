import type { Difficulty } from '../types/common';

const QUESTION_LABELS: Record<string, string> = {
  who: 'Kim?',
  kim: 'Kim?',
  what: 'Ne?',
  ne: 'Ne?',
  where: 'Nerede?',
  nerede: 'Nerede?',
  when: 'Ne zaman?',
  'ne zaman': 'Ne zaman?',
  why: 'Neden?',
  neden: 'Neden?',
  niçin: 'Neden?',
  how: 'Nasıl?',
  nasıl: 'Nasıl?',
};

const DIFFICULTY_LABELS: Record<string, Difficulty> = {
  easy: 'Kolay',
  kolay: 'Kolay',
  medium: 'Orta',
  orta: 'Orta',
  hard: 'Zor',
  zor: 'Zor',
};

export const getTurkishQuestionLabel = (value: unknown): string => {
  if (typeof value !== 'string') return 'Soru';
  return QUESTION_LABELS[value.trim().toLocaleLowerCase('en-US')] ?? 'Soru';
};

export const getTurkishDifficultyLabel = (value: unknown): Difficulty => {
  if (typeof value !== 'string') return 'Orta';
  return DIFFICULTY_LABELS[value.trim().toLocaleLowerCase('en-US')] ?? 'Orta';
};
