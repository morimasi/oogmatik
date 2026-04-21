import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.\nKONU: ${params.topic}\nÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}\nKURALLAR:\n${rules}\nJSON ÇIKTI:`;
}

function detectCategory(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('canlı') || t.includes('hayvan') || t.includes('fen')) return 'science';
  if (t.includes('sayı') || t.includes('matematik')) return 'math';
  if (t.includes('tarih') || t.includes('coğrafya')) return 'social';
  return 'language';
}

export async function generateInfographic_CharacterAnalysis_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KARAKTER ANALİZİ',
    params,
    '1. Karakterin özelliklerini, motivasyonlarını ve gelişimini analiz et\n2. Her bölüm için net bilgiler yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      character: { type: 'string' as const },
      traits: { type: 'array' as const, items: { type: 'string' as const } },
      motivations: { type: 'array' as const, items: { type: 'string' as const } },
      development: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    character: string;
    traits: string[];
    motivations: string[];
    development: string;
  };
  return {
    title: result.title || `${params.topic} - Karakter Analizi`,
    content: {
      storyElements: {
        title: result.title,
        setting: result.character,
        characters: result.traits,
        problem: result.motivations?.join(', ') || '',
        events: result.motivations,
        resolution: result.development,
      },
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Karakter analizi', 'Empati', 'Metin yorumlama'],
    estimatedDuration: 18,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_CharacterAnalysis_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const templates: Record<
    string,
    { character: string; traits: string[]; motivations: string[]; development: string }
  > = {
    science: {
      character: 'Bilim İnsanı',
      traits: ['Meraklı', 'Sabırlı', 'Gözlemci', 'Detaycı'],
      motivations: ['Doğayı anlamak', 'Yeni keşifler yapmak', 'Sorunlara çözüm bulmak'],
      development:
        'Başlangıçta sadece gözlem yapan, sonunda deney tasarlayan bir bilim insanına dönüşür.',
    },
    math: {
      character: 'Matematikçi',
      traits: ['Mantıklı', 'Analitik', 'Sistematik', 'Yaratıcı'],
      motivations: ['Desenleri keşfetmek', 'Problemleri çözmek', 'Formül geliştirmek'],
      development: 'Basit işlemlerden karmaşık teoremlere giden bir yolculuk izler.',
    },
    language: {
      character: 'Hikaye Kahramanı',
      traits: ['Cesur', 'Merhametli', 'Kararlı', 'Zeki'],
      motivations: ['Haksızlığı düzeltmek', 'Sevdiklerini korumak', 'Kendini kanıtlamak'],
      development: 'Zayıf noktalarını kabul edip güçlü yönlerini keşfederek olgunlaşır.',
    },
    social: {
      character: 'Tarihi Kişilik',
      traits: ['Lider', 'Vatansever', 'İleri görüşlü', 'Cesur'],
      motivations: ['Toplumu kalkındırmak', 'Özgürlük mücadelesi', 'Eğitimi yaygınlaştırmak'],
      development: 'Zorluklar karşısında yılmadan mücadele ederek toplumunu dönüştürür.',
    },
    general: {
      character: `${params.topic} Karakteri`,
      traits: ['Özellik 1', 'Özellik 2', 'Özellik 3', 'Özellik 4'],
      motivations: ['Motivasyon 1', 'Motivasyon 2', 'Motivasyon 3'],
      development: 'Karakter hikaye boyunca gelişim gösterir.',
    },
  };
  const t = templates[category] || templates.general;
  return {
    title: `${params.topic} - Karakter Analizi`,
    content: {
      storyElements: {
        title: `${params.topic} - Karakter Analizi`,
        setting: t.character,
        characters: t.traits,
        problem: t.motivations.join(', '),
        events: t.motivations,
        resolution: t.development,
      },
    },
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Karakter analizi', 'Empati', 'Metin yorumlama'],
    estimatedDuration: 18,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_CHARACTER_ANALYSIS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CHARACTER_ANALYSIS,
  aiGenerator: generateInfographic_CharacterAnalysis_AI,
  offlineGenerator: generateInfographic_CharacterAnalysis_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'traitCount',
        type: 'number',
        label: 'Özellik Sayısı',
        defaultValue: 4,
        description: 'Kaç karakter özelliği analiz edilsin?',
      },
      {
        name: 'includeQuotes',
        type: 'boolean',
        label: 'Alıntı Ekle',
        defaultValue: true,
        description: 'Karakterden alıntılar gösterilsin mi?',
      },
    ],
  },
};
