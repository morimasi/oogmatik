import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type CognitiveProfileAIResult = {
  title: string;
  domains: { name: string; score: number; strength: string; support: string }[];
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

export async function generateInfographic_COGNITIVE_PROFILE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BİLİŞSEL PROFİL',
    params,
    '1. Bilişsel profil alanlarını ve skorlarını oluştur\n2. Her alan için güçlü yön ve destek ihtiyacı belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      domains: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            score: { type: 'NUMBER' },
            strength: { type: 'STRING' },
            support: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as CognitiveProfileAIResult;
  return {
    title: result.title || `${params.topic} - Bilişsel Profil`,
    content: {
      radarData: (result.domains || []).map((d) => ({
        skill: d.name,
        currentLevel: Math.min(10, Math.max(1, d.score)),
        targetLevel: 8,
        color: d.score >= 6 ? '#4CAF50' : d.score >= 4 ? '#FFC107' : '#F44336',
      })),
      steps: (result.domains || []).map((d, i) => ({
        stepNumber: i + 1,
        label: d.name,
        description: `Güçlü yön: ${d.strength}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Skor: ${d.score}/10 | Destek: ${d.support}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Bilişsel farkındalık',
      'Güçlü alan kullanımı',
      'Destek ihtiyacı belirleme',
      'Öz farkındalık',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_COGNITIVE_PROFILE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const domains = [
    {
      name: 'İşitsel İşlemleme',
      score: 4,
      strength: 'Müzikal zeka',
      support: 'Sesli tekrar desteği',
    },
    {
      name: 'Görsel-uzamsal',
      score: 7,
      strength: 'Şekil tanıma',
      support: 'Görsel materyal kullanımı',
    },
    {
      name: 'Çalışma Belleği',
      score: 3,
      strength: 'Kısa süreli hatırlama',
      support: 'Bilgiyi parçalara bölme',
    },
    { name: 'İşlem Hızı', score: 4, strength: 'Dikkatli çalışma', support: 'Ek süre sağlama' },
    {
      name: 'Sözel Anlama',
      score: 6,
      strength: 'Sözel ifade',
      support: 'Kelime dağarcığı çalışması',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Bilişsel profil infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri öğrenme süreçlerindeki bilişsel güçlü ve zorlu alanları belirlemede yardımcı olur. Görsel-uzamsal becerileri güçlü olan disleksi desteğine ihtiyacı olan öğrenciler, fen diyagramlarını ve modelleri anlamada başarılı olabilirler.',
    math: 'Bilişsel profil infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme süreçlerindeki bilişsel profillerini haritalamada rehberlik eder. Çalışma belleği ve işlem hızı alanlarındaki skorlar, disleksi desteğine ihtiyacı olan öğrencilerin matematik öğrenme stratejilerini belirlemede kritik bilgi sağlar.',
    language:
      'Bilişsel profil infografiği, disleksi desteğine ihtiyacı olan öğrenciler için dil ve okuma öğrenme süreçlerindeki bilişsel profillerini analiz etmede temel bir araçtır. İşitsel işlemleme ve sözel anlama alanlarındaki skorlar, disleksi desteğine ihtiyacı olan öğrencilerin okuma ve yazma müdahale stratejilerini belirlemede doğrudan kullanılabilir.',
    social:
      'Bilişsel profil infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler öğrenme süreçlerindeki bilişsel profillerini değerlendirmede destek sağlar. Sözel anlama ve görsel-uzamsal beceriler, disleksi desteğine ihtiyacı olan öğrencilerin sosyal kavramları öğrenme biçimlerini etkiler.',
    general:
      'Bilişsel profil infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bilişsel güçlü ve zorlu alanları görsel olarak haritalamada kapsamlı bir değerlendirme aracı sunar. Disleksi desteğine ihtiyacı olan öğrenciler genellikle işitsel işlemleme, görsel-uzamsal beceriler ve çalışma belleği alanlarında farklı bilişsel profiller sergilerler. Bilişsel profil haritası, disleksi desteğine ihtiyacı olan öğrencilerin güçlü alanlarını tespit ederek bu alanları öğrenme süreçlerinde kullanmalarını sağlar. Aynı zamanda destek ihtiyacı olan alanları belirlemek, disleksi desteğine ihtiyacı olan öğrencilere yönelik müdahale stratejilerinin hedeflenmesine yardımcı olur.',
  };

  return {
    title: `${params.topic} - Bilişsel Profil`,
    content: {
      radarData: domains.map((d) => ({
        skill: d.name,
        currentLevel: d.score,
        targetLevel: 8,
        color: d.score >= 6 ? '#4CAF50' : d.score >= 4 ? '#FFC107' : '#F44336',
      })),
      steps: domains.map((d, i) => ({
        stepNumber: i + 1,
        label: d.name,
        description: `Güçlü yön: ${d.strength}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Skor: ${d.score}/10 | Destek: ${d.support}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Bilişsel farkındalık',
      'Güçlü alan kullanımı',
      'Destek ihtiyacı belirleme',
      'Öz farkındalık',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_COGNITIVE_PROFILE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_COGNITIVE_PROFILE,
  aiGenerator: generateInfographic_COGNITIVE_PROFILE_AI,
  offlineGenerator: generateInfographic_COGNITIVE_PROFILE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'assessmentType',
        type: 'enum',
        label: 'Değerlendirme Türü',
        defaultValue: 'genel',
        options: ['genel', 'isitsel', 'gorsel', 'bellek'],
        description: 'Hangi bilişsel alan değerlendirilsin?',
      },
      {
        name: 'showRadar',
        type: 'boolean',
        label: 'Radar Grafik Göster',
        defaultValue: true,
        description: 'Bilişsel profil radar grafiği gösterilsin mi?',
      },
    ],
  },
};
