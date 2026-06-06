import { SavedWorksheet, SavedAssessment, Curriculum } from '../../../types';
import { ActivityAssignment } from '../../../types/assignment';
import { IEPGoal, GradeEntry, BehaviorIncident, PortfolioItem } from '../../../types/student-advanced';

export interface ClinicalNote {
  id: string;
  category: 'baseline' | 'progress' | 'goal';
  date: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface PlanRevision {
  id: string;
  date: string;
  author: string;
  changeDescription: string;
  previousValue: string;
  newValue: string;
}

export interface EnrichedCurriculum extends Curriculum {
  revisions: PlanRevision[];
  lastReviewed: string;
  nextReview: string;
}

export interface MaterialCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}

// All mock generators have been removed to ensure the system is entirely synchronized with real Firestore data.

export const getMaterialCategories = (worksheets: SavedWorksheet[]): MaterialCategory[] => {
  const categoryMap = new Map<string, { count: number }>();
  worksheets.forEach(ws => {
    const key = ws.category?.title || 'Genel';
    const existing = categoryMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(key, { count: 1 });
    }
  });

  const iconMap: Record<string, { icon: string; color: string }> = {
    'Fonolojik Farkındalık': { icon: 'fa-waveform-lines', color: 'text-emerald-500' },
    'Matematik': { icon: 'fa-calculator', color: 'text-blue-500' },
    'Okuma Anlama': { icon: 'fa-book-open', color: 'text-purple-500' },
    'Görsel Algı': { icon: 'fa-eye', color: 'text-amber-500' },
    'Dikkat ve Odaklanma': { icon: 'fa-bullseye', color: 'text-rose-500' },
    'Yaratıcı Yazarlık': { icon: 'fa-pen-fancy', color: 'text-indigo-500' },
    'Kelime Dağarcığı': { icon: 'fa-spell-check', color: 'text-teal-500' },
  };

  return Array.from(categoryMap.entries()).map(([label, data]) => {
    const meta = iconMap[label] || { icon: 'fa-folder', color: 'text-zinc-500' };
    return { id: label.toLowerCase().replace(/\s+/g, '-'), label, icon: meta.icon, color: meta.color, count: data.count };
  });
};
