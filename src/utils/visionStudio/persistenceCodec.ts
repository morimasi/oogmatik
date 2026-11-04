// ============================================================
// VisionStudio — Firestore Kalıcılık Kodeği
// Firestore iç içe dizi (array-in-array) kabul etmez:
// table içeriğindeki `rows: string[][]` yazılamaz.
// Bu yüzden satırlar `{ cells: string[] }` nesnelerine kodlanır,
// okurken tekrar `string[][]` biçimine çözülür.
// ============================================================
import type {
  ActivitySection,
  ActivitySectionContent,
  GeneratedActivity,
  TableContent,
} from '../../types/visionStudio';

interface EncodedTableContent {
  type: 'table';
  headers: string[];
  rows: Array<{ cells: string[] }>;
}

export type EncodedSection = Omit<ActivitySection, 'content'> & {
  content: Exclude<ActivitySectionContent, TableContent> | EncodedTableContent;
};

export type EncodedActivity = Omit<GeneratedActivity, 'sections'> & {
  sections: EncodedSection[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function encodeSections(sections: ActivitySection[]): EncodedSection[] {
  return (sections ?? []).map((section) => {
    if (section.content.type !== 'table') {
      return section as EncodedSection;
    }
    return {
      ...section,
      content: {
        type: 'table',
        headers: section.content.headers,
        rows: section.content.rows.map((cells) => ({ cells })),
      },
    };
  });
}

export function decodeSections(raw: unknown): ActivitySection[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((section) => {
    if (!isRecord(section) || !isRecord(section.content) || section.content.type !== 'table') {
      return section as ActivitySection;
    }

    const headers = Array.isArray(section.content.headers)
      ? section.content.headers.map((h) => String(h))
      : [];
    const rowsRaw = Array.isArray(section.content.rows) ? section.content.rows : [];
    const rows = rowsRaw.map((row) => {
      if (Array.isArray(row)) return row.map((cell) => String(cell ?? ''));
      if (isRecord(row) && Array.isArray(row.cells)) return row.cells.map((cell) => String(cell ?? ''));
      return [];
    });

    return {
      ...(section as unknown as ActivitySection),
      content: { type: 'table', headers, rows },
    };
  });
}

/** Firestore'a yazılacak güvenli (iç içe dizi içermeyen) kopya. */
export function encodeActivity(activity: GeneratedActivity): EncodedActivity {
  return { ...activity, sections: encodeSections(activity.sections) };
}

/** Firestore'dan okunan ham dokümanı uygulama modeline çevirir. */
export function decodeActivity(raw: unknown): GeneratedActivity {
  const activity = (raw ?? {}) as GeneratedActivity;
  return { ...activity, sections: decodeSections(activity.sections) };
}
