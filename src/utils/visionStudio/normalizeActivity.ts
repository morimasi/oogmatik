// ============================================================
// VisionStudio — AI Çıktısı Normalizasyonu
// Gemini'nin küçük şema sapmalarını (büyük harf zorluk, eksik id,
// yanlış section.type, boş açıklama vb.) tek bir yerde onarır.
// Sunucu (api/vision-studio/analyze.ts) ve testler bu saf fonksiyonları kullanır.
// ============================================================
import { v4 as uuid } from 'uuid';
import type {
  ActivityCategory,
  ActivitySection,
  ActivitySectionContent,
  AIAnalysisResult,
  DifficultyLevel,
  SectionType,
} from '../../types/visionStudio';

type UnknownRecord = Record<string, unknown>;

export interface NormalizedActivityDraft {
  title: string;
  grade: string;
  subject: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  objectives: Array<{ code: string; text: string }>;
  instructions: string;
  sections: ActivitySection[];
  answerKey: Array<{ sectionId: string; answer: string; explanation: string }>;
  teacherNotes: string;
  pedagogicalNote: string;
}

const CATEGORY_ALIASES: Record<string, ActivityCategory> = {
  matematik: 'matematik',
  'matematİk': 'matematik',
  math: 'matematik',
  matematiksel: 'matematik',
  turkce: 'turkce',
  'türkçe': 'turkce',
  'turkÇe': 'turkce',
  turkish: 'turkce',
  fen: 'fen',
  'fen bilimleri': 'fen',
  science: 'fen',
  sosyal: 'sosyal',
  'sosyal bilgiler': 'sosyal',
  tarih: 'sosyal',
  cografya: 'sosyal',
  'coğrafya': 'sosyal',
  ingilizce: 'ingilizce',
  'İngilizce': 'ingilizce',
  english: 'ingilizce',
  sanat: 'sanat',
  gorsel: 'sanat',
  'görsel sanatlar': 'sanat',
  beden: 'beden',
  'beden eğitimi': 'beden',
  spor: 'beden',
  diger: 'diger',
  'diğer': 'diger',
  other: 'diger',
};

const DIFFICULTY_ALIASES: Record<string, DifficultyLevel> = {
  kolay: 'kolay',
  'çok kolay': 'kolay',
  cok_kolay: 'kolay',
  easy: 'kolay',
  baslangic: 'kolay',
  'başlangıç': 'kolay',
  orta: 'orta',
  medium: 'orta',
  normal: 'orta',
  zor: 'zor',
  'çok zor': 'zor',
  cok_zor: 'zor',
  hard: 'zor',
  ileri: 'zor',
  uzman: 'zor',
};

const SECTION_TYPES: ReadonlySet<string> = new Set<SectionType>([
  'text',
  'question',
  'fillInTheBlank',
  'matching',
  'table',
  'image',
  'instruction',
  'pageBreak',
]);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter((v) => v.length > 0);
}

function asNumber(value: unknown, fallback: number): number {
  const num = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
  return typeof num === 'number' && Number.isFinite(num) ? num : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Kategori/zorluk eşlemesi için ASCII'ye indirger:
 * "MATEMATİK" -> "matematik", "Türkçe" -> "turkce", "Diğer" -> "diger".
 */
function normalizeLookupKey(raw: string): string {
  return raw
    .trim()
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .replace(/_/g, ' ');
}

export function normalizeCategory(raw: unknown, fallback: ActivityCategory = 'diger'): ActivityCategory {
  const key = normalizeLookupKey(asString(raw));
  if (!key) return fallback;
  return CATEGORY_ALIASES[key] ?? CATEGORY_ALIASES[key.replace(/\s/g, '')] ?? fallback;
}

export function normalizeDifficulty(raw: unknown, fallback: DifficultyLevel = 'orta'): DifficultyLevel {
  const key = normalizeLookupKey(asString(raw));
  if (!key) return fallback;
  return DIFFICULTY_ALIASES[key] ?? fallback;
}

function normalizeObjectives(value: unknown): Array<{ code: string; text: string }> {
  if (!Array.isArray(value)) return [];
  const result: Array<{ code: string; text: string }> = [];
  for (const item of value) {
    if (isRecord(item)) {
      const text = asString(item.text ?? item.description ?? item.kazanim);
      if (!text) continue;
      result.push({ code: asString(item.code ?? item.id) || 'GENEL', text });
    } else {
      const text = asString(item);
      if (text) result.push({ code: 'GENEL', text });
    }
  }
  return result;
}

function isUsableImageUrl(raw: string): boolean {
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(raw)) return true;
  return /^https?:\/\/\S+$/i.test(raw);
}

function normalizeSection(raw: unknown, index: number): ActivitySection | null {
  if (!isRecord(raw)) return null;
  const rawContent = isRecord(raw.content) ? raw.content : {};
  const declaredType = asString(rawContent.type) || asString(raw.type);
  const type = SECTION_TYPES.has(declaredType) ? (declaredType as SectionType) : 'text';

  let content: ActivitySectionContent | null = null;

  switch (type) {
    case 'text':
    case 'instruction': {
      const text = asString(
        rawContent.text ?? rawContent.content ?? rawContent.questionText ?? raw.text
      );
      if (!text) return null;
      content = type === 'text' ? { type: 'text', text } : { type: 'instruction', text };
      break;
    }

    case 'pageBreak': {
      content = { type: 'pageBreak' };
      break;
    }

    case 'question': {
      const questionText = asString(
        rawContent.questionText ?? rawContent.question ?? rawContent.text ?? rawContent.q
      );
      if (!questionText) return null;
      const options = asStringArray(rawContent.options ?? rawContent.choices);
      const correctAnswer = asString(rawContent.correctAnswer ?? rawContent.answer);
      const explanation = asString(rawContent.explanation);
      content = {
        type: 'question',
        questionText,
        ...(options.length > 0 ? { options } : {}),
        ...(correctAnswer ? { correctAnswer } : {}),
        ...(explanation ? { explanation } : {}),
      };
      break;
    }

    case 'fillInTheBlank': {
      const sentence = asString(rawContent.sentence ?? rawContent.text);
      const blanks = asStringArray(rawContent.blanks ?? rawContent.answers);
      if (!sentence || blanks.length === 0) return null;
      content = { type: 'fillInTheBlank', sentence, blanks };
      break;
    }

    case 'matching': {
      const pairsRaw = Array.isArray(rawContent.pairs) ? rawContent.pairs : [];
      const pairs = pairsRaw
        .filter(isRecord)
        .map((p) => ({ left: asString(p.left), right: asString(p.right) }))
        .filter((p) => p.left && p.right);
      if (pairs.length < 2) return null;
      content = { type: 'matching', pairs };
      break;
    }

    case 'table': {
      const headers = asStringArray(rawContent.headers ?? rawContent.columns);
      const rowsRaw = Array.isArray(rawContent.rows) ? rawContent.rows : [];
      if (rowsRaw.length === 0) return null;
      const rows = rowsRaw.map((row) => (Array.isArray(row) ? row.map(asString) : [asString(row)]));
      const width = Math.max(headers.length, ...rows.map((r) => r.length));
      if (width === 0) return null;
      const safeHeaders = headers.length > 0
        ? headers
        : Array.from({ length: width }, (_, i) => `Sütun ${i + 1}`);
      const safeRows = rows.map((row) =>
        Array.from({ length: safeHeaders.length }, (_, i) => row[i] ?? '')
      );
      content = { type: 'table', headers: safeHeaders, rows: safeRows };
      break;
    }

    case 'image': {
      const url = asString(rawContent.url ?? rawContent.src);
      if (!isUsableImageUrl(url)) return null;
      content = {
        type: 'image',
        url,
        alt: asString(rawContent.alt) || 'Etkinlik görseli',
        ...(asString(rawContent.caption) ? { caption: asString(rawContent.caption) } : {}),
      };
      break;
    }

    default:
      return null;
  }

  const objectiveRefs = asStringArray(raw.objectiveRefs);
  return {
    id: asString(raw.id) || `section-${index + 1}-${uuid().slice(0, 8)}`,
    order: clamp(asNumber(raw.order, index + 1), 0, 999),
    type,
    title: asString(raw.title),
    content,
    points: clamp(asNumber(raw.points, 0), 0, 100),
    objectiveRefs,
  };
}

/**
 * Ham AI etkinlik nesnesini güvenli, şema uyumlu bir taslağa dönüştürür.
 * Zorunlu alanlar onarılamıyorsa `null` döner (çağıran taraf etkinliği atlar).
 */
export function normalizeActivityDraft(
  raw: unknown,
  context: { grade?: string; subject?: string; category?: ActivityCategory } = {}
): NormalizedActivityDraft | null {
  if (!isRecord(raw)) return null;

  const sectionsRaw = Array.isArray(raw.sections) ? raw.sections : [];
  const sections: ActivitySection[] = [];
  const usedIds = new Set<string>();
  sectionsRaw.forEach((section, index) => {
    const normalized = normalizeSection(section, index);
    if (!normalized) return;
    if (usedIds.has(normalized.id)) {
      normalized.id = `${normalized.id}-${index + 1}`;
    }
    usedIds.add(normalized.id);
    sections.push({ ...normalized, order: index + 1 });
  });

  if (sections.length === 0) return null;

  const title = asString(raw.title ?? raw.name) || 'Yeni Etkinlik';
  const objectives = normalizeObjectives(raw.objectives ?? raw.kazanimlar);
  const safeObjectives = objectives.length > 0
    ? objectives
    : [{ code: 'GENEL', text: 'MEB kazanımı belirtilmedi' }];

  const answerKeyRaw = Array.isArray(raw.answerKey) ? raw.answerKey : [];
  const answerKey = answerKeyRaw
    .map((entry, index) => {
      if (!isRecord(entry)) return null;
      const answer = asString(entry.answer ?? entry.correctAnswer);
      if (!answer) return null;
      const declaredSectionId = asString(entry.sectionId);
      const sectionId = usedIds.has(declaredSectionId)
        ? declaredSectionId
        : sections[index]?.id ?? sections[0].id;
      return { sectionId, answer, explanation: asString(entry.explanation) };
    })
    .filter((entry): entry is { sectionId: string; answer: string; explanation: string } => entry !== null);

  const pedagogicalNote =
    asString(raw.pedagogicalNote ?? raw.pedagogical_note) ||
    `Bu etkinlik, "${safeObjectives[0].text}" kazanımını öğrencinin yakınsal gelişim alanında (ZPD) desteklemek için tasarlanmıştır. Disleksi dostu yazı tipi, düşük bilişsel yük ve kademeli zorluk ilkeleri gözetilmiştir.`;

  return {
    title,
    grade: asString(raw.grade) || context.grade || '5. Sınıf',
    subject: asString(raw.subject) || context.subject || 'Genel',
    category: normalizeCategory(raw.category ?? context.category),
    difficulty: normalizeDifficulty(raw.difficulty),
    durationMinutes: clamp(Math.round(asNumber(raw.durationMinutes, 40)), 5, 180),
    objectives: safeObjectives,
    instructions: asString(raw.instructions ?? raw.instruction) || 'Yönergeyi okuyun ve etkinliği tamamlayın.',
    sections,
    answerKey,
    teacherNotes: asString(raw.teacherNotes ?? raw.teacher_note),
    pedagogicalNote,
  };
}

/** Gemini analiz bloğunu onarır; eksik alanları ilk etkinlikten türetir. */
export function normalizeAnalysis(
  raw: unknown,
  draft: NormalizedActivityDraft,
  meta: { modelUsed: string; tokensUsed?: number }
): AIAnalysisResult {
  const record = isRecord(raw) ? raw : {};
  const summary = asString(record.summary);
  return {
    detectedCategory: normalizeCategory(record.detectedCategory ?? draft.category, draft.category),
    detectedGrade: asString(record.detectedGrade) || draft.grade,
    detectedSubject: asString(record.detectedSubject) || draft.subject,
    detectedDifficulty: normalizeDifficulty(record.detectedDifficulty ?? draft.difficulty, draft.difficulty),
    detectedObjectives: normalizeObjectives(record.detectedObjectives).length > 0
      ? normalizeObjectives(record.detectedObjectives)
      : draft.objectives,
    detectedActivityType: asString(record.detectedActivityType) || 'Çalışma sayfası',
    summary:
      summary.length >= 10
        ? summary
        : `${draft.title} etkinliği ${draft.grade} düzeyinde, ${draft.subject} kazanımlarına yönelik olarak analiz edildi.`,
    tokensUsed: Math.max(0, Math.round(meta.tokensUsed ?? asNumber(record.tokensUsed, 0))),
    modelUsed: asString(record.modelUsed) || meta.modelUsed,
  };
}

/** Aynı başlıklı tekrar üretilmiş varyasyonları eler. */
export function dedupeByTitle<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = normalizeLookupKey(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
