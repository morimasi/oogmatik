import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type NumberLineAIResult = {
  title: string;
  range: string;
  points: { value: string; label: string }[];
  pedagogicalNote: string;
};

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

export async function generateInfographic_NumberLine_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SAYI DOĞRUSU',
    params,
    '1. Konuya uygun bir sayı aralığı belirle\n2. Bu aralıkta işaretlenecek sayıları ve etiketlerini yaz\n3. Pedagojik not: Sayı doğrusunun sayı algısına katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      range: { type: 'STRING' },
      points: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            value: { type: 'STRING' },
            label: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as NumberLineAIResult;
  return {
    title: result.title || `${params.topic} - Sayı Doğrusu`,
    content: {
      timeline: (result.points || []).map((p) => ({
        date: p.value,
        title: p.label,
        description: `Sayı: ${p.value}`,
        isKeyEvent: true,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Sayı doğrusu, disleksi desteğine ihtiyacı olan öğrenciler için sayıları görsel olarak konumlandırarak sayı algısını geliştirir. Sayıların büyüklük-küçüklük ilişkisini görmek, öğrencilerin sayısal düşünme becerilerini güçlendirir. Bu görsel araç, diskalkuli desteğine ihtiyacı olan öğrenciler için sayıları somutlaştırır ve matematiksel kavramları anlaşılır hale getirir.',
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sayı algısı', 'Görsel matematik'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_NumberLine_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const points = Array.from({ length: 21 }, (_, i) => ({
    date: String(i),
    title: String(i),
    description: `Sayı: ${i}`,
    isKeyEvent: i % 5 === 0,
  }));
  return {
    title: `${params.topic} - Sayı Doğrusu`,
    content: {
      timeline: points,
    },
    pedagogicalNote:
      "Sayı doğrusu, disleksi desteğine ihtiyacı olan öğrenciler için sayıları görsel olarak konumlandırarak sayı algısını geliştirir. Sayıların büyüklük-küçüklük ilişkisini görmek, öğrencilerin sayısal düşünme becerilerini güçlendirir. Bu görsel araç, diskalkuli desteğine ihtiyacı olan öğrenciler için sayıları somutlaştırır ve matematiksel kavramları anlaşılır hale getirir. 5'erli vurgular, sayı örüntülerini fark etmeyi kolaylaştırır.",
    layoutHints: {
      orientation: 'horizontal',
      fontSize: 12,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sayı algısı', 'Görsel matematik'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_NUMBER_LINE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_NUMBER_LINE,
  aiGenerator: generateInfographic_NumberLine_AI,
  offlineGenerator: generateInfographic_NumberLine_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'maxValue',
        type: 'number',
        label: 'Maksimum Değer',
        defaultValue: 20,
        description: 'Sayı doğrusu en fazla kaç olsun?',
      },
      {
        name: 'highlightMultiples',
        type: 'number',
        label: 'Vurgu Aralığı',
        defaultValue: 5,
        description: 'Kaçta bir sayı vurgulansın? (0 = vurgu yok)',
      },
    ],
  },
};
