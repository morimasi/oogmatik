/**
 * profileUtils — Profil modüllerinin paylaştığı saf yardımcılar.
 *
 * Buradaki fonksiyonlar React'ten bağımsızdır; davranışları
 * tests/profileModules.smoke.test.ts ile doğrulanır.
 */
import type { Student } from '../../../types';

export interface SavedAnalysisView {
  name: string;
  sortBy: 'date' | 'score' | 'student';
  filterStudent: string;
}

const SORT_KEYS: SavedAnalysisView['sortBy'][] = ['date', 'score', 'student'];

const isSortKey = (value: unknown): value is SavedAnalysisView['sortBy'] =>
  typeof value === 'string' && (SORT_KEYS as string[]).includes(value);

/** Bozuk/eski localStorage içeriğini çökmeden SavedAnalysisView[]'e çevirir. */
export const parseSavedViews = (raw: string | null): SavedAnalysisView[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({
        name: typeof item.name === 'string' ? item.name : '',
        sortBy: isSortKey(item.sortBy) ? item.sortBy : 'date',
        filterStudent: typeof item.filterStudent === 'string' ? item.filterStudent : '',
      }))
      .filter((item) => item.name.trim().length > 0);
  } catch {
    return [];
  }
};

export const serializeSavedViews = (views: SavedAnalysisView[]): string =>
  JSON.stringify(
    views
      .filter((view) => view.name.trim().length > 0)
      .map((view) => ({
        name: view.name.trim(),
        sortBy: isSortKey(view.sortBy) ? view.sortBy : 'date',
        filterStudent: view.filterStudent ?? '',
      }))
  );

const normalize = (value: unknown): string =>
  typeof value === 'string' ? value.toLocaleLowerCase('tr-TR') : '';

const diagnosisList = (student: Student): string[] => {
  const raw = (student as unknown as { diagnosis?: unknown }).diagnosis;
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === 'string');
  if (typeof raw === 'string' && raw.trim()) return [raw];
  return [];
};

/**
 * Öğrenci listesini arama metni ve tanı rozetine göre filtreler.
 * Eksik alanlar (grade/name/diagnosis) çökme yerine eşleşmez sayılır.
 */
export const filterStudents = (
  students: Student[],
  query: string,
  diagFilter: string
): Student[] => {
  const q = normalize(query).trim();
  const filter = diagFilter && diagFilter !== 'all' ? diagFilter.toLowerCase() : '';

  return students.filter((student) => {
    const diagnosis = diagnosisList(student);
    const profile = normalize((student as unknown as { learningProfile?: unknown }).learningProfile);

    const matchesSearch =
      q.length === 0 ||
      normalize(student.name).includes(q) ||
      normalize(student.grade).includes(q) ||
      diagnosis.some((item) => normalize(item).includes(q));

    const matchesFilter =
      filter.length === 0 ||
      diagnosis.some((item) => normalize(item).includes(filter)) ||
      profile.includes(filter);

    return matchesSearch && matchesFilter;
  });
};

/** KVKK veri indirmesinde dışa aktarılan kullanıcı alanları (izin listesi). */
export const PROFILE_EXPORT_FIELDS = [
  'id',
  'name',
  'email',
  'role',
  'profession',
  'institution',
  'phone',
  'bio',
  'avatar',
  'createdAt',
  'pedagogySettings',
  'aiAssistantSettings',
] as const;

export interface ProfileExportPayload {
  schemaVersion: '1.0';
  generatedAt: string;
  note: string;
  user: Record<string, unknown>;
  counts: { assessments: number; worksheets: number; curriculums: number };
  data: {
    assessments: unknown[];
    worksheets: unknown[];
    curriculums: unknown[];
  };
}

/**
 * Kullanıcının kendi verisini dışa aktarmak için izin listesiyle süzülmüş
 * bir paket üretir. Bilinmeyen alanlar (ör. jeton, şifre özeti) pakete girmez.
 */
export const buildProfileExport = (input: {
  user: Record<string, unknown>;
  assessments: unknown[];
  worksheets: unknown[];
  curriculums: unknown[];
  generatedAt?: string;
}): ProfileExportPayload => {
  const user: Record<string, unknown> = {};
  for (const field of PROFILE_EXPORT_FIELDS) {
    if (field in input.user) user[field] = input.user[field];
  }

  return {
    schemaVersion: '1.0',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    note: 'Bu dosya KVKK kapsamında kullanıcının kendi verisini içerir; üçüncü kişilerle paylaşılmamalıdır.',
    user,
    counts: {
      assessments: input.assessments.length,
      worksheets: input.worksheets.length,
      curriculums: input.curriculums.length,
    },
    data: {
      assessments: input.assessments,
      worksheets: input.worksheets,
      curriculums: input.curriculums,
    },
  };
};

/** Tarayıcıda JSON indirme başlatır; ortam desteklemiyorsa false döner. */
export const downloadJsonFile = (fileName: string, payload: unknown): boolean => {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return false;
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
};
