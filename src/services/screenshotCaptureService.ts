import type { AdStudioTarget } from '../types/adStudio';

export async function captureElementAsDataUrl(element: HTMLElement): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: '#0f0a2e',
    scale: 2,
    useCORS: false,
    allowTaint: true,
    logging: false,
    width: 400,
    height: 300,
  });
  return canvas.toDataURL('image/jpeg', 0.85);
}

const MODULE_COLORS: Record<AdStudioTarget, string> = {
  dashboard: '#6366f1',
  users: '#8b5cf6',
  teachers: '#a78bfa',
  students: '#c084fc',
  activities: '#7c3aed',
  prompts: '#6d28d9',
  static_content: '#5b21b6',
  feedbacks: '#4c1d95',
  drafts: '#9333ea',
  approvals: '#7e22ce',
  permissions: '#a21caf',
  content_engine: '#d946ef',
  math_studio: '#f59e0b',
  reading_studio: '#10b981',
  writing_studio: '#3b82f6',
  screening_assessment: '#ef4444',
  sari_kitap: '#f97316',
  infographic_studio: '#06b6d4',
  super_studio: '#8b5cf6',
  all_modules: '#6366f1',
};

export function getModuleColor(target: AdStudioTarget): string {
  return MODULE_COLORS[target] || '#6366f1';
}
