export const PROFILE_TABS = [
  { id: 'overview', label: 'Özet', icon: 'fa-solid fa-chart-pie' },
  { id: 'students', label: 'Öğrenciler', icon: 'fa-solid fa-user-graduate' },
  { id: 'analysis', label: 'Analiz', icon: 'fa-solid fa-clipboard-check' },
  { id: 'plans', label: 'Planlar', icon: 'fa-solid fa-graduation-cap' },
  { id: 'reports', label: 'Raporlar', icon: 'fa-solid fa-file-medical' },
  { id: 'shared', label: 'Benimle Paylaşılanlar', icon: 'fa-solid fa-share-nodes' },
  { id: 'settings', label: 'Ayarlar', icon: 'fa-solid fa-gear' },
] as const;

export type ProfileTabId = typeof PROFILE_TABS[number]['id'];

export const DEFAULT_UI_SETTINGS = {
  theme: 'light' as const,
  fontSize: 'medium' as const,
  lineHeight: 1.6,
  dyslexiaFriendly: true,
};