import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type BehaviorTrackerAIResult = {
  title: string;
  behaviors: { name: string; frequency: string; trigger: string; strategy: string }[];
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
  const scienceTerms = ['deney', 'gözlem', 'doğa', 'bitki', 'hayvan', 'fen'];
  const mathTerms = ['matematik', 'hesap', 'sayı', 'işlem', 'problem'];
  const languageTerms = ['okuma', 'yazma', 'hikaye', 'kelime', 'dil'];
  const socialTerms = ['toplum', 'tarih', 'coğrafya', 'kültür'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  if (languageTerms.some((term) => topic.toLowerCase().includes(term))) return 'language' as const;
  if (socialTerms.some((term) => topic.toLowerCase().includes(term))) return 'social' as const;
  return 'general' as const;
}

export async function generateInfographic_BEHAVIOR_TRACKER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DAVRANIŞ TAKİP',
    params,
    '1. Hedef davranışları ve takip kriterlerini listele\n2. Her davranış için sıklık, tetikleyici ve strateji belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      behaviors: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            frequency: { type: 'STRING' },
            trigger: { type: 'STRING' },
            strategy: { type: 'STRING' },
        },
      },
    },
  },
};
  const result = (await generateWithSchema(prompt, schema)) as BehaviorTrackerAIResult;
  return {
    title: result.title || `${params.topic} - Davranış Takip`,
    content: {
      steps: (result.behaviors || []).map((b, i) => ({
        stepNumber: i + 1,
        label: b.name,
        description: `Tetikleyici: ${b.trigger}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Sıklık: ${b.frequency} | Strateji: ${b.strategy}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Davranış farkındalığı',
      'Öz düzenleme',
      'Olumlu pekiştirme',
      'Tetikleyici tanıma',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_BEHAVIOR_TRACKER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const behaviors = [
    {
      name: 'Görev Tamamlama',
      frequency: 'Günlük',
      trigger: 'Ödev verildiğinde',
      strategy: 'Adım adım ilerle',
    },
    {
      name: 'Sıra Bekleme',
      frequency: 'Her ders',
      trigger: 'Grup etkinliğinde',
      strategy: 'Derin nefes al, sıranı bekle',
    },
    {
      name: 'El Kaldırma',
      frequency: 'Her ders',
      trigger: 'Söz alma isteği',
      strategy: 'El kaldır, öğretmen çağırsın',
    },
    {
      name: 'Odaklanma',
      frequency: 'Çalışma süresince',
      trigger: 'Dikkat dağıldığında',
      strategy: 'Görevine geri dön',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Davranış takip infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri derslerinde laboratuvar güvenliği ve deney kurallarına uyma davranışlarını izlemde yardımcı olur. Deney sırasında dikkatli olma ve sırayı bekleme gibi davranışları takip etmek, disleksi desteğine ihtiyacı olan öğrencilerin fen öğrenme süreçlerinde güvenli ve düzenli kalmalarını sağlar.',
    math: 'Davranış takip infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik dersinde görev tamamlama ve odaklanma davranışlarını izlemede rehberlik eder. Matematik problemlerini sonuna kadar çözme ve yardım isteme davranışlarını takip etmek, disleksi desteğine ihtiyacı olan öğrencilerin matematik öğrenme alışkanlıklarını olumlu yönde etkiler.',
    language:
      'Davranış takip infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma görevlerinde görev tamamlama ve çaba gösterme davranışlarını izlemede destek sağlar. Okuma süresince odaklanma ve yazma görevlerini tamamlama davranışlarını takip etmek, disleksi desteğine ihtiyacı olan öğrencilerin dil becerileri gelişimini destekler.',
    social:
      'Davranış takip infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler dersinde grup çalışması ve sınıf katılımı davranışlarını izlemede yapılandırılmış bir araç sunar. Aktif dinleme ve saygılı iletişim davranışlarını takip etmek, disleksi desteğine ihtiyacı olan öğrencilerin sosyal öğrenme deneyimlerini iyileştirir.',
    general:
      'Davranış takip infografiği, disleksi desteğine ihtiyacı olan öğrenciler için hedef davranışları izleme ve olumlu davranış değişikliklerini desteklemede yapılandırılmış bir araç sunar. Disleksi desteğine ihtiyacı olan öğrenciler, akademik zorluklar nedeniyle davranışsal zorluklar yaşayabilirler. Görsel davranış takip çizelgeleri, disleksi desteğine ihtiyacı olan öğrencilerin kendi davranışlarını fark etmelerini ve olumlu değişiklikleri görmelerini sağlar. Olumlu pekiştirme sistemleri, disleksi desteğine ihtiyacı olan öğrencilerin istenen davranışları tekrarlamalarını teşvik eder. Davranış tetikleyicilerini anlamak, disleksi desteğine ihtiyacı olan öğrencilerin önleyici stratejiler geliştirmelerine yardımcı olur.',
  };

  return {
    title: `${params.topic} - Davranış Takip`,
    content: {
      steps: behaviors.map((b, i) => ({
        stepNumber: i + 1,
        label: b.name,
        description: `Tetikleyici: ${b.trigger}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Sıklık: ${b.frequency} | Strateji: ${b.strategy}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Davranış farkındalığı',
      'Öz düzenleme',
      'Olumlu pekiştirme',
      'Tetikleyici tanıma',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_BEHAVIOR_TRACKER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_BEHAVIOR_TRACKER,
  aiGenerator: generateInfographic_BEHAVIOR_TRACKER_AI,
  offlineGenerator: generateInfographic_BEHAVIOR_TRACKER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'trackingPeriod',
        type: 'enum',
        label: 'Takip Dönemi',
        defaultValue: 'haftalik',
        options: ['gunluk', 'haftalik', 'aylik'],
        description: 'Davranışlar ne sıklıkla takip edilsin?',
      },
      {
        name: 'rewardSystem',
        type: 'boolean',
        label: 'Ödül Sistemi',
        defaultValue: true,
        description: 'Olumlu davranışlar için ödül sistemi kullanılsın mı?',
      },
    ],
  },
};
