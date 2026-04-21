import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type EventAnalysisAIResult = {
  title: string;
  factors: { type: string; items: string[] }[];
  outcomes: string[];
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
  const socialTerms = ['olay', 'savaş', 'devrim', 'anlaşma'];
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_EVENT_ANALYSIS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'OLAY ANALİZİ',
    params,
    '1. Olayın nedenlerini kategorize et\n2. Sonuçlarını listele\n3. Nedensellik ilişkilerini göster'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      factors: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING' },
            items: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      outcomes: { type: 'ARRAY', items: { type: 'STRING' } },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as EventAnalysisAIResult;
  return {
    title: result.title || `${params.topic} - Olay Analizi`,
    content: {
      steps: (result.factors || []).flatMap((factor, i) =>
        factor.items.map((item, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${factor.type}: ${item}`,
          description: `${factor.type} faktörü`,
          isCheckpoint: j === 0,
          scaffoldHint: `Kategori: ${factor.type}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Nedensellik analizi', 'Eleştirel düşünme', 'Olayları değerlendirme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_EVENT_ANALYSIS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const factors = [
    { type: 'Siyasi', items: ['Yönetim değişikliği', 'Dış baskılar'] },
    { type: 'Ekonomik', items: ['Kıtlık', 'Vergi artışı'] },
    { type: 'Sosyal', items: ['Halk huzursuzluğu', 'Eşitsizlik'] },
  ];
  const outcomes = ['Yeni yönetim kuruldu', 'Kanunlar değişti', 'Toplum yapısı dönüştü'];

  const categoryDescriptions: Record<string, string> = {
    social:
      'Olay analizi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için tarihsel ve güncel olayları neden-sonuç ilişkileri çerçevesinde anlamalarını sağlayan temel bir sosyal bilgiler aracıdır. Olayların siyasi, ekonomik ve sosyal faktörlerinin kategorize edilmesi, karmaşık tarihsel süreçleri yapılandırır. Disleksi desteğine ihtiyacı olan öğrenciler, görsel düzenleme ve renk kodlaması ile nedensellik ilişkilerini daha kolay kavrar ve eleştirel düşünme becerilerini geliştirirler.',
    math: 'Olayların istatistiksel verilerini analiz etmek, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi sosyal bilimler ile bağdaştırır.',
    language:
      'Olayları analiz edip anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için açıklayıcı yazma becerisini geliştirir.',
    science:
      'Bilimsel keşiflerin toplumsal etkilerini analiz etmek, disleksi desteğine ihtiyacı olan öğrenciler için bilim-toplum ilişkisini anlamada yardımcı olur.',
    general:
      'Olay analizi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için eleştirel düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Olay Analizi`,
    content: {
      steps: factors.flatMap((factor, i) =>
        factor.items.map((item, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${factor.type}: ${item}`,
          description: `${factor.type} faktörü`,
          isCheckpoint: j === 0,
          scaffoldHint: `Kategori: ${factor.type}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Nedensellik analizi', 'Eleştirel düşünme', 'Olayları değerlendirme'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_EVENT_ANALYSIS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_EVENT_ANALYSIS,
  aiGenerator: generateInfographic_EVENT_ANALYSIS_AI,
  offlineGenerator: generateInfographic_EVENT_ANALYSIS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'eventName',
        type: 'string',
        label: 'Olay Adı',
        defaultValue: 'Fransız İhtilali',
        description: 'Hangi olay analiz edilsin?',
      },
      {
        name: 'showOutcomes',
        type: 'boolean',
        label: 'Sonuçları Göster',
        defaultValue: true,
        description: 'Olayın sonuçları ayrı bölümde gösterilsin mi?',
      },
    ],
  },
};
