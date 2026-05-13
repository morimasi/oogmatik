import { BarChart3, Plus, Clock, PieChart } from 'lucide-react';
import type { ScreeningView } from './types';

export const SCREENING_TABS: Array<{
  id: ScreeningView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Panel', icon: BarChart3 },
  { id: 'new-screening', label: 'Yeni Tarama', icon: Plus },
  { id: 'history', label: 'Geçmiş', icon: Clock },
  { id: 'analytics', label: 'Analiz', icon: PieChart },
];

export const RISK_LABELS: Record<string, string> = {
  low: 'Düşük Risk',
  medium: 'Orta Risk',
  high: 'Yüksek Risk',
};

export const STATUS_LABELS: Record<string, string> = {
  completed: 'Tamamlandı',
  pending: 'Bekleyen',
  archived: 'Arşivli',
};

export const RESPONDENT_LABELS: Record<string, string> = {
  parent: 'Ebeveyn',
  teacher: 'Öğretmen',
};

export const GRADE_OPTIONS = [
  'Okul Öncesi',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
];

export const ANSWER_OPTIONS = [
  { val: 0, label: 'Hiç' },
  { val: 1, label: 'Nadiren' },
  { val: 2, label: 'Bazen' },
  { val: 3, label: 'Sık Sık' },
  { val: 4, label: 'Her Zaman' },
];
