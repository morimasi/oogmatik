import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ThemeWebAIResult = {
  title: string;
  mainTheme: string;
  subThemes: { name: string; description: string }[];
};

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('fen') || lowerTopic.includes('bilim') || lowerTopic.includes('doğa'))
    return 'science';
  if (lowerTopic.includes('sayı') || lowerTopic.includes('matematik')) return 'math';
  if (lowerTopic.includes('hikaye') || lowerTopic.includes('şiir') || lowerTopic.includes('dil'))
    return 'language';
  if (lowerTopic.includes('tarih') || lowerTopic.includes('coğrafya')) return 'social';
  return 'general';
}

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.
KONU: ${params.topic}
ÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}
KURALLAR:
${rules}
JSON ÇIKTI:`;
}

export async function generateInfographic_ThemeWeb_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'TEMA AĞI',
    params,
    '1. Ana tema ve 3-4 alt tema belirle\n2. Her alt tema için kısa açıklama yaz\n3. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      mainTheme: { type: 'STRING' },
      subThemes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ThemeWebAIResult;
  return {
    title: result.title || `${params.topic} - Tema Ağı`,
    content: {
      hierarchy: {
        label: result.mainTheme || params.topic,
        description: 'Ana tema',
        children: (result.subThemes || []).map((st) => ({
          label: st.name,
          description: st.description,
        })),
      },
    },
    layoutHints: {
      orientation: 'radial',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tema analizi', 'İlişkilendirme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ThemeWeb_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const subThemesMap: Record<string, { name: string; description: string }[]> = {
    science: [
      { name: 'Doğa', description: 'Canlı ve cansız varlıkların dünyası' },
      { name: 'Çevre', description: 'Doğal yaşam alanları ve ekosistemler' },
      { name: 'Enerji', description: 'Doğadaki enerji dönüşümleri' },
      { name: 'Denge', description: 'Doğal dengenin korunması' },
    ],
    math: [
      { name: 'Sayılar', description: 'Doğal sayılar ve işlemler' },
      { name: 'Şekiller', description: 'Geometrik cisimler ve özellikleri' },
      { name: 'Ölçme', description: 'Uzunluk, ağırlık ve zaman ölçümü' },
      { name: 'Veri', description: 'Veri toplama ve yorumlama' },
    ],
    language: [
      { name: 'Sevgi', description: 'Duygular ve ilişkiler' },
      { name: 'Cesaret', description: 'Zorluklarla baş etme' },
      { name: 'Dostluk', description: 'Arkadaşlık ve dayanışma' },
      { name: 'Merak', description: 'Keşfetme ve öğrenme arzusu' },
    ],
    social: [
      { name: 'Toplum', description: 'Birlikte yaşama kültürü' },
      { name: 'Tarih', description: 'Geçmişten günümüze izler' },
      { name: 'Kültür', description: 'Gelenek ve görenekler' },
      { name: 'Sorumluluk', description: 'Bireysel ve toplumsal görevler' },
    ],
    general: [
      { name: 'Doğa', description: 'Çevremizdeki dünya' },
      { name: 'Sevgi', description: 'Duygusal bağlar' },
      { name: 'Cesaret', description: 'Güçlü olma hali' },
      { name: 'Dostluk', description: 'Arkadaşlık ilişkileri' },
    ],
  };
  const subThemes = subThemesMap[category] || subThemesMap.general;
  return {
    title: `${params.topic} - Tema Ağı`,
    content: {
      hierarchy: {
        label: params.topic,
        description: 'Ana tema',
        children: subThemes.map((st) => ({
          label: st.name,
          description: st.description,
        })),
      },
    },
    layoutHints: {
      orientation: 'radial',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tema analizi', 'İlişkilendirme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_THEME_WEB: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_THEME_WEB,
  aiGenerator: generateInfographic_ThemeWeb_AI,
  offlineGenerator: generateInfographic_ThemeWeb_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'subThemeCount',
        type: 'number',
        label: 'Alt Tema Sayısı',
        defaultValue: 4,
        description: 'Kaç alt tema gösterilsin?',
      },
      {
        name: 'showDescriptions',
        type: 'boolean',
        label: 'Açıklamaları Göster',
        defaultValue: true,
        description: 'Her alt tema için açıklama metni gösterilsin mi?',
      },
    ],
  },
};
