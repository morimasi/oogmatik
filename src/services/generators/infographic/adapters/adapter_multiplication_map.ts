import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type MultiplicationMapAIResult = {
  title: string;
  table: { row: number; col: number; value: number }[];
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

function detectCategory(_topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  return 'math' as const;
}

export async function generateInfographic_MULTIPLICATION_MAP_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÇARPIM TABLOSU GÖRSELİ',
    params,
    '1. Çarpım tablosunu görsel olarak düzenle\n2. Her hücrede çarpım sonucunu göster\n3. Renk kodlaması ile grupları belirt\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için çarpım tablosu öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      table: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            row: { type: 'NUMBER' },
            col: { type: 'NUMBER' },
            value: { type: 'NUMBER' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as MultiplicationMapAIResult;
  return {
    title: result.title || `${params.topic} - Çarpım Tablosu`,
    content: {
      steps: (result.table || []).slice(0, 12).map((entry, i) => ({
        stepNumber: i + 1,
        label: `${entry.row} × ${entry.col}`,
        description: `${entry.row} çarpı ${entry.col} eşittir ${entry.value}`,
        isCheckpoint: entry.row === entry.col,
        scaffoldHint: `Sonuç: ${entry.value}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Çarpım tablosu görsel haritası, disleksi desteğine ihtiyacı olan öğrenciler için çarpma işlemini somutlaştırarak ezberleme sürecini kolaylaştırır. Renk kodlaması ve görsel düzenleme, sayısal ilişkileri anlamlandırmada kritik rol oynar. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzen içindeki tekrarları fark ederek kalıcı öğrenme sağlar. Bu yapı, aynı zamanda diskalkuli desteğine ihtiyacı olan öğrenciler için de sayısal farkındalık geliştirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Çarpma işlemi', 'Sayısal ilişki kurma', 'Görsel düzen algısı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MULTIPLICATION_MAP_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const tableEntries = [];
  const maxNum = params.difficulty === 'Kolay' ? 5 : params.difficulty === 'Orta' ? 7 : 10;
  for (let r = 1; r <= maxNum; r++) {
    for (let c = 1; c <= maxNum; c++) {
      tableEntries.push({ row: r, col: c, value: r * c });
    }
  }

  const categoryDescriptions: Record<string, string> = {
    math: 'Çarpım tablosu, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel temelleri güçlendiren önemli bir araçtır. Görsel düzenleme ve renk kodlaması ile sayısal ilişkiler somutlaştırılır. Disleksi desteğine ihtiyacı olan öğrenciler, tablodaki desenleri ve tekrarları fark ederek çarpma işlemini daha kolay öğrenirler. Bu yaklaşım, sayısal bellek gelişimini destekler.',
    science:
      'Bilimsel hesaplamalarda çarpım tablosu temel bir beceridir. Disleksi desteğine ihtiyacı olan öğrenciler için görsel düzenleme ile sayısal ilişkiler somutlaştırılır.',
    language:
      'Dil öğreniminde sayısal kavramlar da önemlidir. Disleksi desteğine ihtiyacı olan öğrenciler için çarpım tablosu görsel haritası, sayısal okuryazarlık geliştirir.',
    social:
      'Sosyal yaşamda temel matematik becerileri gereklidir. Disleksi desteğine ihtiyacı olan öğrenciler için çarpım tablosu görsel olarak düzenlenerek öğrenme kolaylaştırılır.',
    general:
      'Çarpım tablosu görsel haritası, disleksi desteğine ihtiyacı olan öğrenciler için temel matematik becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Çarpım Tablosu`,
    content: {
      steps: tableEntries.slice(0, 20).map((entry, i) => ({
        stepNumber: i + 1,
        label: `${entry.row} × ${entry.col}`,
        description: `${entry.row} çarpı ${entry.col} eşittir ${entry.value}`,
        isCheckpoint: entry.row === entry.col,
        scaffoldHint: `Sonuç: ${entry.value}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Çarpma işlemi', 'Sayısal ilişki kurma', 'Görsel düzen algısı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MULTIPLICATION_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MULTIPLICATION_MAP,
  aiGenerator: generateInfographic_MULTIPLICATION_MAP_AI,
  offlineGenerator: generateInfographic_MULTIPLICATION_MAP_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'maxNumber',
        type: 'number',
        label: 'Maksimum Sayı',
        defaultValue: 10,
        description: 'Çarpım tablosunda kaç sayıya kadar gösterilsin?',
      },
      {
        name: 'colorCoded',
        type: 'boolean',
        label: 'Renk Kodlaması',
        defaultValue: true,
        description: 'Çarpım sonuçları renk kodlaması ile gösterilsin mi?',
      },
    ],
  },
};
