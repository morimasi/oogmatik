/**
 * @file src/services/generators/infographic/infographicAdapter.ts
 * @description InfographicStudio v3 Ultra Premium — Infographic Adapter
 *
 * 94 INFOGRAPHIC aktivite için AI + Offline Generator Pair'ları
 * Registry'ye köprü vazifesi görür.
 *
 * Sprint 1: İlk 10 aktivite (Kat 1: Görsel & Mekansal)
 */

import { ActivityType } from '../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
  CustomizationSchema,
  InfographicActivityContent,
} from '../../../types/infographic';
import { generateWithSchema } from '../../geminiClient';

// ── HELPER: Kategori Tespiti ─────────────────────────────────────────────────

function detectTopicCategory(
  topic: string
): 'science' | 'math' | 'language' | 'social' | 'general' {
  const t = topic.toLowerCase();
  if (
    t.includes('canlı') ||
    t.includes('hayvan') ||
    t.includes('bitki') ||
    t.includes('doğa') ||
    t.includes('fen') ||
    t.includes('gezegen') ||
    t.includes('su döngüsü') ||
    t.includes('enerji')
  )
    return 'science';
  if (
    t.includes('sayı') ||
    t.includes('matematik') ||
    t.includes('geometri') ||
    t.includes('açı') ||
    t.includes('kesir') ||
    t.includes('oran') ||
    t.includes('yüzde')
  )
    return 'math';
  if (
    t.includes('hikaye') ||
    t.includes('masal') ||
    t.includes('şiir') ||
    t.includes('yazı') ||
    t.includes('okuma') ||
    t.includes('harf') ||
    t.includes('kelime')
  )
    return 'language';
  if (
    t.includes('tarih') ||
    t.includes('cumhuriyet') ||
    t.includes('atatürk') ||
    t.includes('coğrafya') ||
    t.includes('harita') ||
    t.includes('ülke')
  )
    return 'social';
  return 'general';
}

function generateGenericConcepts(topic: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${topic} — Kavram ${i + 1}`);
}

function generateGenericSteps(
  topic: string,
  count: number
): Array<{ stepNumber: number; label: string; description: string; isCheckpoint: boolean }> {
  return Array.from({ length: count }, (_, i) => ({
    stepNumber: i + 1,
    label: `Adım ${i + 1}`,
    description: `${topic} konusunda ${i + 1}. adım açıklaması.`,
    isCheckpoint: (i + 1) % 3 === 0,
  }));
}

// ── AI GENERATOR BASE PROMPT ─────────────────────────────────────────────────

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.

KONU: ${params.topic}

ÖZEL PARAMETRELER:
${JSON.stringify(params.activityParams, null, 2)}

KURALLAR:
${rules}

JSON ÇIKTI:`;
}

// ── 1. INFOGRAPHIC_CONCEPT_MAP (Kavram Haritası) ────────────────────────────

async function generateInfographic_ConceptMap_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const minConcepts = (params.activityParams.minConcepts as number) || 5;
  const maxConcepts = (params.activityParams.maxConcepts as number) || 12;

  const prompt = buildAIPrompt(
    'KAVRAM HARİTASI',
    params,
    `
1. Ana kavram merkezde, alt kavramlar hiyerarşik sırada
2. Pedagojik not: Neden bu yapı, öğrenciye nasıl fayda (min 100 kelime)
3. A4 kompakt yerleşim: Minimal margin, optimum font
4. Lexend font, disleksi uyumlu renkler
5. En az ${minConcepts}, en fazla ${maxConcepts} alt kavram
6. Her kavram için seviye (1-3) ve bağlantılar belirt
7. Tanı koyucu dil kullanma: "disleksisi var" yerine "disleksi desteğine ihtiyacı var"
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      centralConcept: { type: 'string' as const },
      subConcepts: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            label: { type: 'string' as const },
            level: { type: 'number' as const },
            connections: { type: 'array' as const, items: { type: 'string' as const } },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    centralConcept: string;
    subConcepts: Array<{ label: string; level: number; connections: string[] }>;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Kavram Haritası`,
    content: {
      hierarchy: {
        label: data.centralConcept || params.topic,
        children: (data.subConcepts || []).map((c) => ({
          label: c.label,
          level: c.level,
          description: `Bağlantılar: ${(c.connections || []).join(', ')}`,
        })),
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Bu kavram haritası, ${params.topic} konusunu hiyerarşik olarak yapılandırarak öğrencinin zihinsel şemasını güçlendirir. ${params.ageGroup} yaş grubu için somut örneklerle desteklenmelidir.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Kavramsal düşünme', 'Hiyerarşik analiz'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_ConceptMap_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const minConcepts = (params.activityParams.minConcepts as number) || 5;
  const category = detectTopicCategory(params.topic);

  const templates: Record<string, string[]> = {
    science: [
      'Canlılar',
      'Üreticiler',
      'Tüketiciler',
      'Ayrıştırıcılar',
      'Ekosistem',
      'Besin Zinciri',
    ],
    math: [
      'Sayılar',
      'Doğal Sayılar',
      'Tam Sayılar',
      'Rasyonel Sayılar',
      'İrrasyonel Sayılar',
      'Reel Sayılar',
    ],
    language: ['Cümle', 'Özne', 'Yüklem', 'Nesne', 'Tümleç', 'Zarf'],
    social: ['Coğrafya', 'İklim', 'Nüfus', 'Ekonomi', 'Kültür', 'Tarih'],
    general: generateGenericConcepts(params.topic, minConcepts),
  };

  const subConcepts = templates[category] || templates.general;

  return {
    title: `${params.topic} — Kavram Haritası`,
    content: {
      hierarchy: {
        label: params.topic,
        children: subConcepts.slice(0, minConcepts).map((label, i) => ({
          label,
          level: Math.floor(i / 2) + 1,
          description: `${params.topic} ile ilişkili alt kavram`,
        })),
      },
    },
    pedagogicalNote: `Bu kavram haritası, "${params.topic}" konusunu hiyerarşik olarak yapılandırarak öğrencinin zihinsel şemasını güçlendirir. ${params.ageGroup} yaş grubu için somut örneklerle desteklenmelidir. Disleksi desteğine ihtiyacı olan öğrenciler için renkli bağlantılar ve görsel ipuçları kullanılmalıdır.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Kavramsal düşünme', 'Hiyerarşik analiz'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const conceptMapSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'minConcepts',
      type: 'number',
      label: 'Minimum Kavram Sayısı',
      defaultValue: 5,
      description: 'En az kaç alt kavram oluşturulsun?',
    },
    {
      name: 'maxConcepts',
      type: 'number',
      label: 'Maximum Kavram Sayısı',
      defaultValue: 12,
      description: 'En fazla kaç alt kavram?',
    },
    {
      name: 'orientation',
      type: 'enum',
      label: 'Yerleşim Tipi',
      defaultValue: 'radial',
      options: ['radial', 'tree', 'network'],
      description: 'Kavramların görsel düzeni',
    },
    {
      name: 'includeExamples',
      type: 'boolean',
      label: 'Örnek Ekle',
      defaultValue: true,
      description: 'Her kavrama örnek cümle eklensin mi?',
    },
  ],
};

export const INFOGRAPHIC_CONCEPT_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CONCEPT_MAP,
  aiGenerator: generateInfographic_ConceptMap_AI,
  offlineGenerator: generateInfographic_ConceptMap_Offline,
  customizationSchema: conceptMapSchema,
};

// ── 2. INFOGRAPHIC_COMPARE (Karşılaştırma Tablosu) ──────────────────────────

async function generateInfographic_Compare_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KARŞILAŞTIRMA TABLOSU',
    params,
    `
1. İki kavram/konu yan yana karşılaştırılmalı
2. Ortak özellikler ayrı bir sütunda gösterilmeli
3. Pedagojik not: Karşılaştırmanın öğrenmeye katkısı (min 100 kelime)
4. Lexend font, disleksi uyumlu renkler
5. Her madde kısa ve net olmalı
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      leftTitle: { type: 'string' as const },
      rightTitle: { type: 'string' as const },
      leftItems: { type: 'array' as const, items: { type: 'string' as const } },
      rightItems: { type: 'array' as const, items: { type: 'string' as const } },
      commonGround: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    leftTitle: string;
    rightTitle: string;
    leftItems: string[];
    rightItems: string[];
    commonGround: string[];
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Karşılaştırma`,
    content: {
      comparisons: {
        leftTitle: data.leftTitle || 'A',
        rightTitle: data.rightTitle || 'B',
        leftItems: data.leftItems || [],
        rightItems: data.rightItems || [],
        commonGround: data.commonGround || [],
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Bu karşılaştırma tablosu, öğrencinin analitik düşünme becerisini geliştirir. İki kavram arasındaki benzerlik ve farklılıkları görmek, zihinsel modellemeyi kolaylaştırır.`,
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Analitik düşünme', 'Karşılaştırmalı analiz'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_Compare_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectTopicCategory(params.topic);

  const templates: Record<
    string,
    { left: string; right: string; leftItems: string[]; rightItems: string[]; common: string[] }
  > = {
    science: {
      left: 'Bitki Hücresi',
      right: 'Hayvan Hücresi',
      leftItems: ['Hücre duvarı var', 'Kloroplast var', 'Büyük koful', 'Fotosentez yapar'],
      rightItems: ['Hücre duvarı yok', 'Kloroplast yok', 'Küçük koful', 'Fotosentez yapmaz'],
      common: ['Hücre zarı', 'Çekirdek', 'Mitokondri', 'Ribozom'],
    },
    math: {
      left: 'Doğal Sayılar',
      right: 'Tam Sayılar',
      leftItems: ['0 ve pozitif', 'Sayma sayıları + 0', 'Negatif yok', 'Sonlu küme'],
      rightItems: ['Negatif dahil', 'Sıfır dahil', 'Pozitif dahil', 'Sonsuz küme'],
      common: ['Toplama', 'Çarpma', 'Sıralama', 'Sayı doğrusu'],
    },
    language: {
      left: 'Ad (İsim)',
      right: 'Sıfat (Ön Ad)',
      leftItems: ['Varlık adı', 'Çoğul eki alır', '-lar/-ler', 'Özne olur'],
      rightItems: ['Nitelik belirtir', 'İsimden önce gelir', '-sız/-siz', 'Tamlama yapar'],
      common: ['İsim çekim eki almaz', 'Cümlede görevli', 'Ad tamlaması kurar'],
    },
    social: {
      left: 'İklim',
      right: 'Hava Durumu',
      leftItems: ['Uzun dönem', 'Geniş bölge', 'Değişmez', 'Bilimsel'],
      rightItems: ['Kısa dönem', 'Dar bölge', 'Değişken', 'Günlük'],
      common: ['Atmosfer olayları', 'Sıcaklık', 'Yağış', 'Rüzgar'],
    },
    general: {
      left: `${params.topic} — A`,
      right: `${params.topic} — B`,
      leftItems: ['Özellik 1', 'Özellik 2', 'Özellik 3'],
      rightItems: ['Farklı 1', 'Farklı 2', 'Farklı 3'],
      common: ['Ortak 1', 'Ortak 2'],
    },
  };

  const t = templates[category] || templates.general;

  return {
    title: `${params.topic} — Karşılaştırma Tablosu`,
    content: {
      comparisons: {
        leftTitle: t.left,
        rightTitle: t.right,
        leftItems: t.leftItems,
        rightItems: t.rightItems,
        commonGround: t.common,
      },
    },
    pedagogicalNote: `Bu karşılaştırma tablosu, "${params.topic}" konusundaki iki kavram arasındaki benzerlik ve farklılıkları ortaya koyarak öğrencinin analitik düşünme becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için renk kodlu sütunlar kullanılmalıdır.`,
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Analitik düşünme', 'Karşılaştırmalı analiz'],
    estimatedDuration: 12,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const compareSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'criteria',
      type: 'string',
      label: 'Karşılaştırma Kriteri',
      defaultValue: 'temel',
      description: 'Hangi açıdan karşılaştırılsın?',
    },
    {
      name: 'includeCommon',
      type: 'boolean',
      label: 'Ortak Alan Göster',
      defaultValue: true,
      description: 'Venn şeması ortak alanı gösterilsin mi?',
    },
    {
      name: 'itemCount',
      type: 'number',
      label: 'Madde Sayısı',
      defaultValue: 4,
      description: 'Her sütunda kaç madde olsun?',
    },
  ],
};

export const INFOGRAPHIC_COMPARE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_COMPARE,
  aiGenerator: generateInfographic_Compare_AI,
  offlineGenerator: generateInfographic_Compare_Offline,
  customizationSchema: compareSchema,
};

// ── 3. INFOGRAPHIC_VISUAL_LOGIC (Görsel Mantık) ─────────────────────────────

async function generateInfographic_VisualLogic_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'GÖRSEL MANTIK',
    params,
    `
1. Görsel mantık bulmacası oluştur (şekil, desen, sıra)
2. Öğrencinin deseni tamamlaması istensin
3. Pedagojik not: Görsel mantığın bilişsel gelişime katkısı (min 100 kelime)
4. Lexend font, disleksi uyumlu
5. 3-5 adımlı sıra mantığı kur
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      pattern: { type: 'array' as const, items: { type: 'string' as const } },
      question: { type: 'string' as const },
      answer: { type: 'string' as const },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    pattern: string[];
    question: string;
    answer: string;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Görsel Mantık`,
    content: {
      questions: [
        {
          question: data.question || 'Deseni tamamlayın: ' + (data.pattern || []).join(' → '),
          questionType: 'fill-blank',
          answer: data.answer,
          difficulty: 'medium',
        },
      ],
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Görsel mantık etkinlikleri, öğrencinin desen tanıma ve sıralama becerilerini geliştirir. Bu beceriler matematiksel düşünmenin temelini oluşturur.`,
    layoutHints: { orientation: 'horizontal', fontSize: 12, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Desen tanıma', 'Sıralama', 'Mantıksal çıkarım'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_VisualLogic_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const patterns = [
    {
      pattern: ['●', '○', '●', '○', '●', '?'],
      answer: '○',
      question: 'Deseni tamamlayın: ● ○ ● ○ ● ?',
    },
    {
      pattern: ['▲', '▲', '▼', '▲', '▲', '?'],
      answer: '▼',
      question: 'Deseni tamamlayın: ▲ ▲ ▼ ▲ ▲ ?',
    },
    {
      pattern: ['1', '2', '4', '8', '?'],
      answer: '16',
      question: 'Sayı desenini tamamlayın: 1, 2, 4, 8, ?',
    },
  ];

  const p = patterns[Math.floor(Math.random() * patterns.length)];

  return {
    title: `${params.topic} — Görsel Mantık`,
    content: {
      questions: [
        {
          question: p.question,
          questionType: 'fill-blank',
          answer: p.answer,
          difficulty: 'easy',
          visualCue: p.pattern.join('  '),
        },
      ],
    },
    pedagogicalNote: `Görsel mantık etkinlikleri, "${params.topic}" konusu bağlamında öğrencinin desen tanıma ve sıralama becerilerini geliştirir. Bu beceriler matematiksel düşünmenin temelini oluşturur. Disleksi desteğine ihtiyacı olan öğrenciler için görsel ipuçları büyüklük ve renk kontrastıyla desteklenmelidir.`,
    layoutHints: { orientation: 'horizontal', fontSize: 14, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Desen tanıma', 'Sıralama', 'Mantıksal çıkarım'],
    estimatedDuration: 10,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const visualLogicSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'patternType',
      type: 'enum',
      label: 'Desen Tipi',
      defaultValue: 'shape',
      options: ['shape', 'number', 'color', 'size'],
      description: 'Hangi tür desen kullanılsın?',
    },
    {
      name: 'stepCount',
      type: 'number',
      label: 'Adım Sayısı',
      defaultValue: 5,
      description: 'Desen kaç adımlı olsun?',
    },
  ],
};

export const INFOGRAPHIC_VISUAL_LOGIC: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_VISUAL_LOGIC,
  aiGenerator: generateInfographic_VisualLogic_AI,
  offlineGenerator: generateInfographic_VisualLogic_Offline,
  customizationSchema: visualLogicSchema,
};

// ── 4. INFOGRAPHIC_VENN_DIAGRAM (Venn Şeması) ───────────────────────────────

async function generateInfographic_VennDiagram_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'VENN ŞEMASI',
    params,
    `
1. İki küme ve kesişim alanı tanımla
2. Her küme için 4-6 özellik yaz
3. Kesişim alanı için 2-4 ortak özellik yaz
4. Pedagojik not: Venn şemasının öğrenmeye katkısı (min 100 kelime)
5. Lexend font, disleksi uyumlu
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      setA: { type: 'string' as const },
      setB: { type: 'string' as const },
      itemsA: { type: 'array' as const, items: { type: 'string' as const } },
      itemsB: { type: 'array' as const, items: { type: 'string' as const } },
      intersection: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    setA: string;
    setB: string;
    itemsA: string[];
    itemsB: string[];
    intersection: string[];
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Venn Şeması`,
    content: {
      comparisons: {
        leftTitle: data.setA || 'A Kümesi',
        rightTitle: data.setB || 'B Kümesi',
        leftItems: data.itemsA || [],
        rightItems: data.itemsB || [],
        commonGround: data.intersection || [],
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Venn şeması, iki kavram kümesi arasındaki ilişkiyi görselleştirerek öğrencinin karşılaştırmalı düşünme becerisini güçlendirir. Kesişim alanı, ortak özellikleri fark etmeyi kolaylaştırır.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Küme analizi', 'Karşılaştırmalı düşünme', 'Sınıflandırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_VennDiagram_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectTopicCategory(params.topic);

  const templates: Record<
    string,
    { setA: string; setB: string; itemsA: string[]; itemsB: string[]; intersection: string[] }
  > = {
    science: {
      setA: 'Memeliler',
      setB: 'Kuşlar',
      itemsA: ['Sıcak kanlı', 'Süt verir', 'Kıl-covered', 'Akciğer solunumu'],
      itemsB: ['Tüy-covered', 'Yumurta', 'Gaga', 'Uçabilen türler'],
      intersection: ['Omurgalı', 'Sıcak kanlı', 'Akciğer solunumu', 'Yavru bakımı'],
    },
    math: {
      setA: 'Çift Sayılar',
      setB: "3'ün Katları",
      itemsA: ['2', '4', '6', '8', '10'],
      itemsB: ['3', '6', '9', '12', '15'],
      intersection: ['6', '12', '18', '24'],
    },
    language: {
      setA: 'Sesli Harfler',
      setB: 'Sessiz Harfler',
      itemsA: ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'],
      itemsB: ['B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ'],
      intersection: ['Alfabe', 'Harf', 'Yazı'],
    },
    social: {
      setA: 'Kara Yolları',
      setB: 'Demir Yolları',
      itemsA: ['Esnek güzergah', 'Bireysel', 'Hızlı', 'Pahalı yakıt'],
      itemsB: ['Sabit hat', 'Toplu', 'Yüksek kapasite', 'Çevreci'],
      intersection: ['Ulaşım', 'İnsan yapımı', 'Ekonomik katkı'],
    },
    general: {
      setA: `${params.topic} — A`,
      setB: `${params.topic} — B`,
      itemsA: ['Özellik A1', 'Özellik A2', 'Özellik A3', 'Özellik A4'],
      itemsB: ['Özellik B1', 'Özellik B2', 'Özellik B3', 'Özellik B4'],
      intersection: ['Ortak 1', 'Ortak 2', 'Ortak 3'],
    },
  };

  const t = templates[category] || templates.general;

  return {
    title: `${params.topic} — Venn Şeması`,
    content: {
      comparisons: {
        leftTitle: t.setA,
        rightTitle: t.setB,
        leftItems: t.itemsA,
        rightItems: t.itemsB,
        commonGround: t.intersection,
      },
    },
    pedagogicalNote: `Venn şeması, "${params.topic}" konusunda iki kavram kümesi arasındaki ilişkiyi görselleştirerek öğrencinin karşılaştırmalı düşünme becerisini güçlendirir. Kesişim alanı, ortak özellikleri fark etmeyi kolaylaştırır. Disleksi desteğine ihtiyacı olan öğrenciler için renkli daireler ve net etiketler kullanılmalıdır.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Küme analizi', 'Karşılaştırmalı düşünme', 'Sınıflandırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const vennDiagramSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'setA',
      type: 'string',
      label: 'A Kümesi Adı',
      defaultValue: '',
      description: 'Birinci kümenin adı',
    },
    {
      name: 'setB',
      type: 'string',
      label: 'B Kümesi Adı',
      defaultValue: '',
      description: 'İkinci kümenin adı',
    },
    {
      name: 'itemCount',
      type: 'number',
      label: 'Madde Sayısı',
      defaultValue: 4,
      description: 'Her kümede kaç madde olsun?',
    },
  ],
};

export const INFOGRAPHIC_VENN_DIAGRAM: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_VENN_DIAGRAM,
  aiGenerator: generateInfographic_VennDiagram_AI,
  offlineGenerator: generateInfographic_VennDiagram_Offline,
  customizationSchema: vennDiagramSchema,
};

// ── 5. INFOGRAPHIC_MIND_MAP (Zihin Haritası) ────────────────────────────────

async function generateInfographic_MindMap_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ZİHİN HARİTASI',
    params,
    `
1. Merkez konu etrafında 4-6 ana dal
2. Her dalda 2-4 alt dal
3. Pedagojik not: Zihin haritasının öğrenmeye katkısı (min 100 kelime)
4. Lexend font, disleksi uyumlu
5. Renk kodlu dallar
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      center: { type: 'string' as const },
      branches: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            color: { type: 'string' as const },
            subItems: { type: 'array' as const, items: { type: 'string' as const } },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    center: string;
    branches: Array<{ name: string; color: string; subItems: string[] }>;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Zihin Haritası`,
    content: {
      hierarchy: {
        label: data.center || params.topic,
        children: (data.branches || []).map((b) => ({
          label: b.name,
          color: b.color,
          children: (b.subItems || []).map((s) => ({ label: s })),
        })),
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Zihin haritası, öğrencinin konuyu bütünsel olarak görmesini sağlar. Renkli dallar ve görsel hiyerarşi, hafızada kalıcılığı artırır.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Bütünsel düşünme', 'İlişkilendirme', 'Yaratıcı düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_MindMap_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectTopicCategory(params.topic);

  const templates: Record<string, Array<{ name: string; color: string; subItems: string[] }>> = {
    science: [
      { name: 'Canlılar', color: '#4CAF50', subItems: ['Bitkiler', 'Hayvanlar', 'Mantarlar'] },
      { name: 'Madde', color: '#2196F3', subItems: ['Katı', 'Sıvı', 'Gaz'] },
      { name: 'Enerji', color: '#FF9800', subItems: ['Isı', 'Işık', 'Ses'] },
      { name: 'Dünya', color: '#9C27B0', subItems: ['Katmanlar', 'İklim', 'Doğal afetler'] },
    ],
    math: [
      { name: 'Sayılar', color: '#2196F3', subItems: ['Doğal', 'Tam', 'Rasyonel'] },
      { name: 'İşlemler', color: '#4CAF50', subItems: ['Toplama', 'Çıkarma', 'Çarpma', 'Bölme'] },
      { name: 'Geometri', color: '#FF9800', subItems: ['Şekiller', 'Açılar', 'Alan'] },
      { name: 'Veri', color: '#9C27B0', subItems: ['Tablo', 'Grafik', 'Ortalama'] },
    ],
    language: [
      { name: 'Sözcük', color: '#2196F3', subItems: ['Ad', 'Sıfat', 'Fiil'] },
      { name: 'Cümle', color: '#4CAF50', subItems: ['Özne', 'Yüklem', 'Nesne'] },
      { name: 'Yazım', color: '#FF9800', subItems: ['Noktalama', 'Büyük harf', 'Hece'] },
      { name: 'Anlatım', color: '#9C27B0', subItems: ['Hikaye', 'Şiir', 'Makale'] },
    ],
    social: [
      { name: 'Tarih', color: '#9C27B0', subItems: ['Cumhuriyet', 'Savaşlar', 'İnkılaplar'] },
      { name: 'Coğrafya', color: '#4CAF50', subItems: ['İklim', 'Nüfus', 'Şehirler'] },
      { name: 'Kültür', color: '#FF9800', subItems: ['Gelenekler', 'Bayramlar', 'Yemekler'] },
      { name: 'Ekonomi', color: '#2196F3', subItems: ['Tarım', 'Sanayi', 'Ticaret'] },
    ],
    general: [
      { name: 'Alt Konu 1', color: '#2196F3', subItems: ['Detay A', 'Detay B'] },
      { name: 'Alt Konu 2', color: '#4CAF50', subItems: ['Detay C', 'Detay D'] },
      { name: 'Alt Konu 3', color: '#FF9800', subItems: ['Detay E', 'Detay F'] },
      { name: 'Alt Konu 4', color: '#9C27B0', subItems: ['Detay G', 'Detay H'] },
    ],
  };

  const branches = templates[category] || templates.general;

  return {
    title: `${params.topic} — Zihin Haritası`,
    content: {
      hierarchy: {
        label: params.topic,
        children: branches.map((b) => ({
          label: b.name,
          color: b.color,
          children: b.subItems.map((s) => ({ label: s })),
        })),
      },
    },
    pedagogicalNote: `Zihin haritası, "${params.topic}" konusunu bütünsel olarak görmeyi sağlar. Renkli dallar ve görsel hiyerarşi, hafızada kalıcılığı artırır. Disleksi desteğine ihtiyacı olan öğrenciler için her dal farklı renkte olmalı ve görsel sembollerle desteklenmelidir.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Bütünsel düşünme', 'İlişkilendirme', 'Yaratıcı düşünme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const mindMapSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'branchCount',
      type: 'number',
      label: 'Ana Dal Sayısı',
      defaultValue: 4,
      description: 'Merkezden kaç ana dal çıksın?',
    },
    {
      name: 'subItemCount',
      type: 'number',
      label: 'Alt Dal Sayısı',
      defaultValue: 3,
      description: 'Her dalda kaç alt öğe olsun?',
    },
    {
      name: 'useColors',
      type: 'boolean',
      label: 'Renkli Dallar',
      defaultValue: true,
      description: 'Her dal farklı renkte olsun mu?',
    },
  ],
};

export const INFOGRAPHIC_MIND_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MIND_MAP,
  aiGenerator: generateInfographic_MindMap_AI,
  offlineGenerator: generateInfographic_MindMap_Offline,
  customizationSchema: mindMapSchema,
};

// ── 6. INFOGRAPHIC_FLOWCHART (Akış Şeması) ──────────────────────────────────

async function generateInfographic_Flowchart_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'AKIŞ ŞEMASI',
    params,
    `
1. Süreci adım adım akış şeması olarak göster
2. Karar noktaları (Evet/Hayır) dahil et
3. Pedagojik not: Akış şemasının süreç öğrenimine katkısı (min 100 kelime)
4. Lexend font, disleksi uyumlu
5. 5-8 adımlı süreç oluştur
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      steps: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            stepNumber: { type: 'number' as const },
            label: { type: 'string' as const },
            description: { type: 'string' as const },
            isDecision: { type: 'boolean' as const },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    steps: Array<{ stepNumber: number; label: string; description: string; isDecision: boolean }>;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Akış Şeması`,
    content: {
      steps: (data.steps || []).map((s) => ({
        stepNumber: s.stepNumber,
        label: s.label,
        description: s.description,
        isCheckpoint: s.isDecision || false,
      })),
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Akış şeması, öğrencinin bir süreci adım adım takip etmesini sağlar. Sıralı düşünme ve karar verme becerilerini geliştirir.`,
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Sıralı düşünme', 'Süreç analizi', 'Karar verme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_Flowchart_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const steps = generateGenericSteps(params.topic, 6);

  return {
    title: `${params.topic} — Akış Şeması`,
    content: { steps },
    pedagogicalNote: `Akış şeması, "${params.topic}" konusundaki süreci adım adım göstererek öğrencinin sıralı düşünme becerisini geliştirir. Her adımda ne yapılacağı net bir şekilde belirtilmelidir. Disleksi desteğine ihtiyacı olan öğrenciler için ok işaretleri ve görsel semboller kullanılmalıdır.`,
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Sıralı düşünme', 'Süreç analizi', 'Karar verme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const flowchartSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'stepCount',
      type: 'number',
      label: 'Adım Sayısı',
      defaultValue: 6,
      description: 'Akış şeması kaç adımlı olsun?',
    },
    {
      name: 'includeDecisions',
      type: 'boolean',
      label: 'Karar Noktaları',
      defaultValue: true,
      description: 'Evet/Hayır karar noktaları eklensin mi?',
    },
  ],
};

export const INFOGRAPHIC_FLOWCHART: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_FLOWCHART,
  aiGenerator: generateInfographic_Flowchart_AI,
  offlineGenerator: generateInfographic_Flowchart_Offline,
  customizationSchema: flowchartSchema,
};

// ── 7. INFOGRAPHIC_MATRIX_ANALYSIS (Matris Analizi) ─────────────────────────

async function generateInfographic_MatrixAnalysis_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'MATRIS ANALIZI',
    params,
    `
1. 3x3 veya 4x4 matris tablosu oluştur
2. Satır ve sütun başlıkları belirle
3. Her hücreyi kısa ve net doldur
4. Pedagojik not: Matris analizinini öğrenmeye katkısı (min 100 kelime)
5. Lexend font, disleksi uyumlu
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      rowHeaders: { type: 'array' as const, items: { type: 'string' as const } },
      colHeaders: { type: 'array' as const, items: { type: 'string' as const } },
      cells: {
        type: 'array' as const,
        items: { type: 'array' as const, items: { type: 'string' as const } },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    rowHeaders: string[];
    colHeaders: string[];
    cells: string[][];
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Matris Analizi`,
    content: {
      comparisons: {
        leftTitle: (data.rowHeaders || []).join(', '),
        rightTitle: (data.colHeaders || []).join(', '),
        leftItems: (data.cells || []).flat(),
        rightItems: [],
        commonGround: [],
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Matris analizi, öğrencinin çok boyutlu düşünme becerisini geliştirir. Satır ve sütun kesişimindeki bilgiyi okuma, analitik düşünmeyi destekler.`,
    layoutHints: {
      orientation: 'grid',
      fontSize: 10,
      colorScheme: 'dyslexia-friendly',
      columnCount: 1,
    },
    targetSkills: ['Çok boyutlu analiz', 'Tablo okuma', 'İlişkilendirme'],
    estimatedDuration: 18,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_MatrixAnalysis_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const rowHeaders = ['Kolay', 'Orta', 'Zor'];
  const colHeaders = ['Bilgi', 'Beceri', 'Tutum'];
  const cells = [
    ['Tanımlar', 'Uygular', 'Değerlendirir'],
    ['Açıklar', 'Çözer', 'Savunur'],
    ['Analiz eder', 'Sentezler', 'Önceliklendirir'],
  ];

  return {
    title: `${params.topic} — Matris Analizi`,
    content: {
      comparisons: {
        leftTitle: rowHeaders.join(', '),
        rightTitle: colHeaders.join(', '),
        leftItems: cells.flat(),
        rightItems: [],
        commonGround: [],
      },
    },
    pedagogicalNote: `Matris analizi, "${params.topic}" konusunu çok boyutlu olarak incelemeyi sağlar. Öğrenci, farklı kriterlere göre bilgiyi sınıflandırma becerisi kazanır. Disleksi desteğine ihtiyacı olan öğrenciler için hücreler renk kodlu ve net sınırlarla ayrılmalıdır.`,
    layoutHints: {
      orientation: 'grid',
      fontSize: 10,
      colorScheme: 'dyslexia-friendly',
      columnCount: 1,
    },
    targetSkills: ['Çok boyutlu analiz', 'Tablo okuma', 'İlişkilendirme'],
    estimatedDuration: 18,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const matrixAnalysisSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'rowCount',
      type: 'number',
      label: 'Satır Sayısı',
      defaultValue: 3,
      description: 'Matris kaç satırlı olsun?',
    },
    {
      name: 'colCount',
      type: 'number',
      label: 'Sütun Sayısı',
      defaultValue: 3,
      description: 'Matris kaç sütunlu olsun?',
    },
    {
      name: 'criteria',
      type: 'string',
      label: 'Kriter',
      defaultValue: 'zorluk x beceri',
      description: 'Matris hangi kriterlere göre oluşturulsun?',
    },
  ],
};

export const INFOGRAPHIC_MATRIX_ANALYSIS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS,
  aiGenerator: generateInfographic_MatrixAnalysis_AI,
  offlineGenerator: generateInfographic_MatrixAnalysis_Offline,
  customizationSchema: matrixAnalysisSchema,
};

// ── 8. INFOGRAPHIC_CAUSE_EFFECT (Sebep-Sonuç İlişkisi) ──────────────────────

async function generateInfographic_CauseEffect_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SEBEP-SONUÇ İLİŞKİSİ',
    params,
    `
1. En az 3 sebep ve 3 sonuç belirt
2. Her sebep-sonuç ilişkisini ok ile bağla
3. Pedagojik not: Sebep-sonuç düşünmenin gelişime katkısı (min 100 kelime)
4. Lexend font, disleksi uyumlu
5. Zincirleme etkiler göster
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      causes: { type: 'array' as const, items: { type: 'string' as const } },
      effects: { type: 'array' as const, items: { type: 'string' as const } },
      chain: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    causes: string[];
    effects: string[];
    chain: string[];
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Sebep-Sonuç`,
    content: {
      questions: [
        ...(data.causes || []).map((c) => ({
          question: `Sebep: ${c}`,
          questionType: 'open-ended' as const,
          difficulty: 'medium' as const,
        })),
        ...(data.effects || []).map((e) => ({
          question: `Sonuç: ${e}`,
          questionType: 'open-ended' as const,
          difficulty: 'medium' as const,
        })),
      ],
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Sebep-sonuç ilişkisi kurmak, öğrencinin nedensel düşünme becerisini geliştirir. Bu beceri, bilimsel düşünce ve problem çözme için temeldir.`,
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Nedensel düşünme', 'İlişki kurma', 'Analiz'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_CauseEffect_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectTopicCategory(params.topic);

  const templates: Record<string, { causes: string[]; effects: string[]; chain: string[] }> = {
    science: {
      causes: ['Ormanların yok edilmesi', 'Fosil yakıt kullanımı', 'Su kirliliği'],
      effects: ['İklim değişikliği', 'Hava kirliliği', 'Canlı türlerinin azalması'],
      chain: ['Fosil yakıt → Sera gazı → Küresel ısınma → İklim değişikliği'],
    },
    math: {
      causes: ['İşlem sırası karıştırma', 'Taban kavramını bilmeme', 'Dikkat eksikliği'],
      effects: ['Yanlış sonuç', 'İşlem hatası', 'Tekrar gereği'],
      chain: ['Yanlış işlem sırası → Hatalı sonuç → Kavram yanlışlığı'],
    },
    language: {
      causes: ['Noktalama işaretlerini bilmeme', 'Özne-yüklem uyumsuzluğu', 'Yazım hatası'],
      effects: ['Anlam karmaşası', 'Okuma zorluğu', 'İletişim kopukluğu'],
      chain: ['Yazım hatası → Anlam bozulması → İletişim sorunu'],
    },
    social: {
      causes: ['Göç', 'Sanayileşme', 'Nüfus artışı'],
      effects: ['Şehirleşme', 'Çevre sorunları', 'Kaynak tükenmesi'],
      chain: ['Sanayileşme → Şehirleşme → Nüfus yoğunluğu → Çevre sorunları'],
    },
    general: {
      causes: ['Sebep 1', 'Sebep 2', 'Sebep 3'],
      effects: ['Sonuç 1', 'Sonuç 2', 'Sonuç 3'],
      chain: ['Sebep 1 → Ara sonuç → Sonuç 1'],
    },
  };

  const t = templates[category] || templates.general;

  return {
    title: `${params.topic} — Sebep-Sonuç İlişkisi`,
    content: {
      questions: [
        ...t.causes.map((c) => ({
          question: `Sebep: ${c}`,
          questionType: 'open-ended' as const,
          difficulty: 'medium' as const,
        })),
        ...t.effects.map((e) => ({
          question: `Sonuç: ${e}`,
          questionType: 'open-ended' as const,
          difficulty: 'medium' as const,
        })),
      ],
    },
    pedagogicalNote: `Sebep-sonuç ilişkisi kurmak, "${params.topic}" konusunda öğrencinin nedensel düşünme becerisini geliştirir. Bu beceri, bilimsel düşünce ve problem çözme için temeldir. Disleksi desteğine ihtiyacı olan öğrenciler için ok işaretleri ve renk kodlu bağlantılar kullanılmalıdır.`,
    layoutHints: { orientation: 'horizontal', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Nedensel düşünme', 'İlişki kurma', 'Analiz'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const causeEffectSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'causeCount',
      type: 'number',
      label: 'Sebep Sayısı',
      defaultValue: 3,
      description: 'Kaç sebep gösterilsin?',
    },
    {
      name: 'showChain',
      type: 'boolean',
      label: 'Zincir Etkisi',
      defaultValue: true,
      description: 'Zincirleme etki gösterilsin mi?',
    },
  ],
};

export const INFOGRAPHIC_CAUSE_EFFECT: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CAUSE_EFFECT,
  aiGenerator: generateInfographic_CauseEffect_AI,
  offlineGenerator: generateInfographic_CauseEffect_Offline,
  customizationSchema: causeEffectSchema,
};

// ── 9. INFOGRAPHIC_FISHBONE (Balık Kılçığı) ─────────────────────────────────

async function generateInfographic_Fishbone_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BALIK KILÇIĞI (ISHIKAWA)',
    params,
    `
1. Ana sorun/etki balığın kafasında
2. 4-6 ana kategori (kemikler) belirle
3. Her kategoride 2-3 alt sebep
4. Pedagojik not: Balık kılçığı analizi öğrenmeye katkısı (min 100 kelime)
5. Lexend font, disleksi uyumlu
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      problem: { type: 'string' as const },
      categories: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            causes: { type: 'array' as const, items: { type: 'string' as const } },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    problem: string;
    categories: Array<{ name: string; causes: string[] }>;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Balık Kılçığı`,
    content: {
      hierarchy: {
        label: data.problem || params.topic,
        children: (data.categories || []).map((c) => ({
          label: c.name,
          children: (c.causes || []).map((cause) => ({ label: cause })),
        })),
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Balık kılçığı diyagramı, öğrencinin bir sorunun kök nedenlerini sistematik olarak analiz etmesini sağlar. Kategorize edilmiş düşünme yapısı, problem çözme becerisini güçlendirir.`,
    layoutHints: { orientation: 'horizontal', fontSize: 10, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Kök neden analizi', 'Sistematik düşünme', 'Problem çözme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_Fishbone_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const categories = [
    { name: 'Yöntem', causes: ['Yanlış strateji', 'Eksik planlama', 'Zaman yönetimi'] },
    { name: 'İnsan', causes: ['Dikkat eksikliği', 'Motivasyon düşüklüğü', 'Özgüven eksikliği'] },
    { name: 'Materyal', causes: ['Yetersiz kaynak', 'Uyumsuz araç', 'Eksik bilgi'] },
    { name: 'Çevre', causes: ['Gürültü', 'Düzensiz ortam', 'Dikkat dağıtıcılar'] },
  ];

  return {
    title: `${params.topic} — Balık Kılçığı`,
    content: {
      hierarchy: {
        label: params.topic,
        children: categories.map((c) => ({
          label: c.name,
          children: c.causes.map((cause) => ({ label: cause })),
        })),
      },
    },
    pedagogicalNote: `Balık kılçığı diyagramı, "${params.topic}" konusundaki sorunun kök nedenlerini sistematik olarak analiz etmeyi sağlar. Kategorize edilmiş düşünme yapısı, problem çözme becerisini güçlendirir. Disleksi desteğine ihtiyacı olan öğrenciler için her kategori farklı renkte gösterilmelidir.`,
    layoutHints: { orientation: 'horizontal', fontSize: 10, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Kök neden analizi', 'Sistematik düşünme', 'Problem çözme'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const fishboneSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'categoryCount',
      type: 'number',
      label: 'Kategori Sayısı',
      defaultValue: 4,
      description: 'Kaç ana kategori olsun?',
    },
    {
      name: 'causePerCategory',
      type: 'number',
      label: 'Sebep Sayısı (Kategori başına)',
      defaultValue: 3,
      description: 'Her kategoride kaç sebep?',
    },
    {
      name: 'categories',
      type: 'string',
      label: 'Kategoriler',
      defaultValue: 'Yöntem, İnsan, Materyal, Çevre',
      description: 'Kategorileri virgülle ayırarak yazın',
    },
  ],
};

export const INFOGRAPHIC_FISHBONE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_FISHBONE,
  aiGenerator: generateInfographic_Fishbone_AI,
  offlineGenerator: generateInfographic_Fishbone_Offline,
  customizationSchema: fishboneSchema,
};

// ── 10. INFOGRAPHIC_CLUSTER_MAP (Kümeleme Haritası) ─────────────────────────

async function generateInfographic_ClusterMap_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KÜMELEME HARİTASI',
    params,
    `
1. Merkez konu etrafında serbest çağrışım kümesi
2. En az 5-8 küme grubu
3. Her grupta 3-5 öğe
4. Pedagojik not: Kümelemenin öğrenmeye katkısı (min 100 kelime)
5. Lexend font, disleksi uyumlu
6. Serbest çağrışım modeli kullan
`
  );

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      center: { type: 'string' as const },
      clusters: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: { type: 'string' as const },
            items: { type: 'array' as const, items: { type: 'string' as const } },
          },
        },
      },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as {
    title: string;
    center: string;
    clusters: Array<{ name: string; items: string[] }>;
    pedagogicalNote: string;
  };

  return {
    title: data.title || `${params.topic} — Kümeleme Haritası`,
    content: {
      hierarchy: {
        label: data.center || params.topic,
        children: (data.clusters || []).map((c) => ({
          label: c.name,
          children: (c.items || []).map((item) => ({ label: item })),
        })),
      },
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Kümeleme haritası, öğrencinin serbest çağrışım yoluyla konuyu keşfetmesini sağlar. İlişkili fikirleri gruplama, organize düşünme becerisini geliştirir.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Serbest çağrışım', 'Gruplama', 'Organize düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

function generateInfographic_ClusterMap_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectTopicCategory(params.topic);

  const templates: Record<string, Array<{ name: string; items: string[] }>> = {
    science: [
      { name: 'Canlılar', items: ['İnsan', 'Hayvan', 'Bitki', 'Mikrop'] },
      { name: 'Cansız', items: ['Su', 'Hava', 'Toprak', 'Taş'] },
      { name: 'Doğal', items: ['Güneş', 'Ay', 'Yıldız', 'Bulut'] },
      { name: 'Yapay', items: ['Bina', 'Araba', 'Bilgisayar', 'Telefon'] },
    ],
    math: [
      { name: 'Sayılar', items: ['1', '2', '3', '4', '5'] },
      { name: 'Şekiller', items: ['Kare', 'Üçgen', 'Daire', 'Dikdörtgen'] },
      { name: 'İşlemler', items: ['+', '-', '×', '÷'] },
      { name: 'Ölçme', items: ['Metre', 'Litre', 'Kilogram', 'Saat'] },
    ],
    language: [
      { name: 'Harfler', items: ['A', 'B', 'C', 'Ç', 'D'] },
      { name: 'Hece', items: ['Açık', 'Kapalı', 'Birleşik'] },
      { name: 'Sözcük', items: ['Ad', 'Sıfat', 'Fiil', 'Zarf'] },
      { name: 'Cümle', items: ['Kurallı', 'Devrik', 'Eksiltili'] },
    ],
    social: [
      { name: 'Aile', items: ['Anne', 'Baba', 'Kardeş', 'Dede'] },
      { name: 'Okul', items: ['Öğretmen', 'Öğrenci', 'Sınıf', 'Ders'] },
      { name: 'Toplum', items: ['Komşu', 'Arkadaş', 'Öğretmen', 'Doktor'] },
      { name: 'Ülke', items: ['Şehir', 'Köy', 'İlçe', 'Mahalle'] },
    ],
    general: [
      { name: 'Grup 1', items: ['Öğe 1', 'Öğe 2', 'Öğe 3'] },
      { name: 'Grup 2', items: ['Öğe 4', 'Öğe 5', 'Öğe 6'] },
      { name: 'Grup 3', items: ['Öğe 7', 'Öğe 8', 'Öğe 9'] },
      { name: 'Grup 4', items: ['Öğe 10', 'Öğe 11', 'Öğe 12'] },
    ],
  };

  const clusters = templates[category] || templates.general;

  return {
    title: `${params.topic} — Kümeleme Haritası`,
    content: {
      hierarchy: {
        label: params.topic,
        children: clusters.map((c) => ({
          label: c.name,
          children: c.items.map((item) => ({ label: item })),
        })),
      },
    },
    pedagogicalNote: `Kümeleme haritası, "${params.topic}" konusunda öğrencinin serbest çağrışım yoluyla fikirleri keşfetmesini sağlar. İlişkili fikirleri gruplama, organize düşünme becerisini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için her küme farklı renkte ve görsel sembollerle desteklenmelidir.`,
    layoutHints: { orientation: 'radial', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: ['Serbest çağrışım', 'Gruplama', 'Organize düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

const clusterMapSchema: CustomizationSchema = {
  parameters: [
    {
      name: 'clusterCount',
      type: 'number',
      label: 'Küme Sayısı',
      defaultValue: 4,
      description: 'Kaç küme grubu oluşturulsun?',
    },
    {
      name: 'itemPerCluster',
      type: 'number',
      label: 'Küme Başına Öğe',
      defaultValue: 4,
      description: 'Her kümede kaç öğe olsun?',
    },
    {
      name: 'freeAssociation',
      type: 'boolean',
      label: 'Serbest Çağrışım',
      defaultValue: true,
      description: 'Serbest çağrışım modeli kullanılsın mı?',
    },
  ],
};

export const INFOGRAPHIC_CLUSTER_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CLUSTER_MAP,
  aiGenerator: generateInfographic_ClusterMap_AI,
  offlineGenerator: generateInfographic_ClusterMap_Offline,
  customizationSchema: clusterMapSchema,
};

// ── EXPORT ALL ───────────────────────────────────────────────────────────────

export const INFOGRAPHIC_ADAPTERS_FIRST_10: Record<string, InfographicGeneratorPair> = {
  [ActivityType.INFOGRAPHIC_CONCEPT_MAP]: INFOGRAPHIC_CONCEPT_MAP,
  [ActivityType.INFOGRAPHIC_COMPARE]: INFOGRAPHIC_COMPARE,
  [ActivityType.INFOGRAPHIC_VISUAL_LOGIC]: INFOGRAPHIC_VISUAL_LOGIC,
  [ActivityType.INFOGRAPHIC_VENN_DIAGRAM]: INFOGRAPHIC_VENN_DIAGRAM,
  [ActivityType.INFOGRAPHIC_MIND_MAP]: INFOGRAPHIC_MIND_MAP,
  [ActivityType.INFOGRAPHIC_FLOWCHART]: INFOGRAPHIC_FLOWCHART,
  [ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS]: INFOGRAPHIC_MATRIX_ANALYSIS,
  [ActivityType.INFOGRAPHIC_CAUSE_EFFECT]: INFOGRAPHIC_CAUSE_EFFECT,
  [ActivityType.INFOGRAPHIC_FISHBONE]: INFOGRAPHIC_FISHBONE,
  [ActivityType.INFOGRAPHIC_CLUSTER_MAP]: INFOGRAPHIC_CLUSTER_MAP,
};
