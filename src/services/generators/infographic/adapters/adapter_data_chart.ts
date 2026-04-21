import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type DataChartAIResult = {
  title: string;
  data: { label: string; value: number }[];
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

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const scienceTerms = ['deney', 'bitki', 'hayvan', 'su', 'hava', 'toprak'];
  const mathTerms = ['grafik', 'sayı', 'istatistik', 'ortalama'];
  const socialTerms = ['nüfus', 'şehir', 'ülke', 'seçim'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_DATA_CHART_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'VERİ GRAFİĞİ',
    params,
    '1. Konuya uygun veri seti oluştur\n2. Grafik türünü belirle (çubuk, çizgi, pasta)\n3. Verileri görselleştir'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      data: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            label: { type: 'STRING' },
            value: { type: 'NUMBER' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as DataChartAIResult;
  return {
    title: result.title || `${params.topic} - Veri Grafiği`,
    content: {
      steps: (result.data || []).map((entry, i) => ({
        stepNumber: i + 1,
        label: entry.label,
        description: `Değer: ${entry.value}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Bu değer en ${entry.value === Math.max(...result.data.map((d) => d.value)) ? 'yüksek' : 'düşük'} olabilir`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Veri okuma', 'Grafik yorumlama', 'Sayısal karşılaştırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_DATA_CHART_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);

  const dataSets: Record<string, { label: string; value: number }[]> = {
    science: [
      { label: 'Su', value: 71 },
      { label: 'Kara', value: 29 },
      { label: 'Oksijen', value: 21 },
      { label: 'Azot', value: 78 },
    ],
    math: [
      { label: 'Toplam', value: 100 },
      { label: 'Ortalama', value: 25 },
      { label: 'En Büyük', value: 45 },
      { label: 'En Küçük', value: 5 },
    ],
    language: [
      { label: 'İsim', value: 40 },
      { label: 'Fiil', value: 30 },
      { label: 'Sıfat', value: 20 },
      { label: 'Zarf', value: 10 },
    ],
    social: [
      { label: 'Şehir', value: 75 },
      { label: 'Kasaba', value: 15 },
      { label: 'Köy', value: 10 },
    ],
    general: [
      { label: 'A', value: 30 },
      { label: 'B', value: 25 },
      { label: 'C', value: 20 },
      { label: 'D', value: 15 },
      { label: 'E', value: 10 },
    ],
  };

  const categoryDescriptions: Record<string, string> = {
    math: 'Veri grafiği okuma, disleksi desteğine ihtiyacı olan öğrenciler için sayısal okuryazarlık geliştiren temel bir matematik becerisidir. Görsel grafikler, soyut sayıları somutlaştırarak karşılaştırma yapmayı kolaylaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve düzenli grafik yapıları ile veri analizi becerilerini geliştirirler.',
    science:
      'Bilimsel verileri grafik üzerinde okumak, disleksi desteğine ihtiyacı olan öğrenciler için deney sonuçlarını anlamada kritik öneme sahiptir. Görsel veri sunumu, bilimsel kavramları somutlaştırır.',
    language:
      'Dil verilerini grafik üzerinde göstermek, disleksi desteğine ihtiyacı olan öğrenciler için kelime türlerini ve kullanım sıklığını görsel olarak anlamalarını sağlar.',
    social:
      'Sosyal verileri grafik ile okumak, disleksi desteğine ihtiyacı olan öğrenciler için toplumsal olayları sayısal olarak değerlendirmelerine yardımcı olur.',
    general:
      'Veri grafiği okuma, disleksi desteğine ihtiyacı olan öğrenciler için genel okuryazarlık geliştiren önemli bir beceridir. Görsel grafikler soyut verileri somutlaştırır.',
  };

  return {
    title: `${params.topic} - Veri Grafiği`,
    content: {
      steps: (dataSets[category] || dataSets.general).map((entry, i) => ({
        stepNumber: i + 1,
        label: entry.label,
        description: `Değer: ${entry.value}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Değer: ${entry.value}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Veri okuma', 'Grafik yorumlama', 'Sayısal karşılaştırma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_DATA_CHART: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_DATA_CHART,
  aiGenerator: generateInfographic_DATA_CHART_AI,
  offlineGenerator: generateInfographic_DATA_CHART_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'chartType',
        type: 'enum',
        label: 'Grafik Türü',
        defaultValue: 'bar',
        options: ['bar', 'line', 'pie'],
        description: 'Hangi tür grafik kullanılsın?',
      },
      {
        name: 'dataPoints',
        type: 'number',
        label: 'Veri Noktası Sayısı',
        defaultValue: 5,
        description: 'Grafikte kaç veri noktası gösterilsin?',
      },
    ],
  },
};
