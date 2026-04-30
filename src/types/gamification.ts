/**
 * OOGMATIK - Gamification Types
 * Rozetler ve Başarımlar Sistemi Tipleri
 */

export type AchievementCriteria = 
  | 'activity_count' 
  | 'perfect_score' 
  | 'subject_mastery' 
  | 'daily_streak' 
  | 'time_spent';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'general' | 'math' | 'verbal' | 'logic' | 'consistency';
  criteriaType: AchievementCriteria;
  criteriaValue: number;
  points: number;
}

export interface StudentBadge {
  badgeId: string;
  earnedAt: string;
  metadata?: Record<string, unknown>;
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'FIRST_STEP',
    title: 'İlk Adım',
    description: 'İlk aktiviteni başarıyla tamamladın!',
    icon: '🎯',
    category: 'general',
    criteriaType: 'activity_count',
    criteriaValue: 1,
    points: 10
  },
  {
    id: 'QUICK_LEARNER',
    title: 'Hızlı Öğrenci',
    description: '5 farklı aktivite tamamlayarak hız kazandın.',
    icon: '⚡',
    category: 'general',
    criteriaType: 'activity_count',
    criteriaValue: 5,
    points: 50
  },
  {
    id: 'PERFECT_TEN',
    title: 'Kusursuz Onluk',
    description: 'Tam puanla (100) bir aktivite tamamladın!',
    icon: '⭐',
    category: 'general',
    criteriaType: 'perfect_score',
    criteriaValue: 100,
    points: 100
  },
  {
    id: 'MATH_WIZARD',
    title: 'Matematik Ustası',
    description: '10 adet matematik stüdyosu aktivitesi tamamladın.',
    icon: '🧮',
    category: 'math',
    criteriaType: 'subject_mastery',
    criteriaValue: 10,
    points: 200
  },
  {
    id: 'READING_OWL',
    title: 'Kitap Kurdu',
    description: '10 adet okuma anlama aktivitesi tamamladın.',
    icon: '🦉',
    category: 'verbal',
    criteriaType: 'subject_mastery',
    criteriaValue: 10,
    points: 200
  }
];
