import { TeacherActivityType } from '../../../types/teacher';

export const ACTIVITY_LABELS: Record<TeacherActivityType, string> = {
  worksheet: 'Çalışma Kağıdı',
  assessment: 'Değerlendirme',
  plan: 'Müfredat Planı',
  report: 'Rapor',
  login: 'Giriş',
  export: 'Dışa Aktarma',
  student_added: 'Öğrenci Ekleme',
};

export const ACTIVITY_ICONS: Record<TeacherActivityType, string> = {
  worksheet: 'fa-file-pen',
  assessment: 'fa-clipboard-check',
  plan: 'fa-graduation-cap',
  report: 'fa-file-medical',
  login: 'fa-right-to-bracket',
  export: 'fa-download',
  student_added: 'fa-user-plus',
};

export const ACTIVITY_COLORS: Record<TeacherActivityType, string> = {
  worksheet: 'bg-blue-500',
  assessment: 'bg-emerald-500',
  plan: 'bg-indigo-500',
  report: 'bg-amber-500',
  login: 'bg-zinc-500',
  export: 'bg-purple-500',
  student_added: 'bg-teal-500',
};

export const ACTIVITY_BG_COLORS: Record<TeacherActivityType, string> = {
  worksheet: 'from-blue-500/10 to-blue-600/5',
  assessment: 'from-emerald-500/10 to-emerald-600/5',
  plan: 'from-indigo-500/10 to-indigo-600/5',
  report: 'from-amber-500/10 to-amber-600/5',
  login: 'from-zinc-500/10 to-zinc-600/5',
  export: 'from-purple-500/10 to-purple-600/5',
  student_added: 'from-teal-500/10 to-teal-600/5',
};

export const ACTIVITY_BORDER_COLORS: Record<TeacherActivityType, string> = {
  worksheet: 'border-l-blue-500',
  assessment: 'border-l-emerald-500',
  plan: 'border-l-indigo-500',
  report: 'border-l-amber-500',
  login: 'border-l-zinc-500',
  export: 'border-l-purple-500',
  student_added: 'border-l-teal-500',
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  suspended: { label: 'Askıda', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400', dot: 'bg-rose-500' },
  pending: { label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
};

export const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
