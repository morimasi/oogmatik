import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SensoryIntegrationAIResult = {
  title: string;
  activities: { name: string; type: string; description: string; duration: string }[];
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

export async function generateInfographic_SENSORY_INTEGRATION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DUYUSAL BÜTÜNLEME',
    params,
    '1. Duyusal bütünleme aktivitelerini listele\n2. Her aktivite için tür, açıklama ve süre belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için duyusal bütünleme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      activities: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            type: { type: 'STRING' },
            description: { type: 'STRING' },
            duration: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SensoryIntegrationAIResult;
  return {
    title: result.title || `${params.topic} - Duyusal Bütünleme`,
    content: {
      steps: (result.activities || []).map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: a.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.type} | Süre: ${a.duration}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için duyusal işlemleme zorluklarını yönetme ve öğrenme ortamlarına uyum sağlamada kritik bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla duyusal hassasiyetler veya duyusal arama davranışları sergilerler. Yapılandırılmış duyusal aktiviteler, disleksi desteğine ihtiyacı olan öğrencilerin sinir sistemlerini düzenlemelerine ve öğrenmeye hazır hale gelmelerine yardımcı olur. Dokunsal, vestibüler ve proprioseptif duyusal girdiler, disleksi desteğine ihtiyacı olan öğrencilerin dikkat ve odaklanma becerilerini olumlu yönde etkiler. Bu stratejiler, sınıf içi öğrenme deneyimini iyileştirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Duyusal düzenleme',
      'Dokunsal farkındalık',
      'Vestibüler işleme',
      'Propriosepsiyon',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SENSORY_INTEGRATION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const activities = [
    {
      name: 'Hamur Etkinliği',
      type: 'Dokunsal',
      description: 'Hamur yoğurma ve şekil verme',
      duration: '10 dk',
    },
    {
      name: 'Salıncak',
      type: 'Vestibüler',
      description: 'İleri-geri salınma hareketi',
      duration: '5 dk',
    },
    {
      name: 'Ağırlık Taşıma',
      type: 'Proprioseptif',
      description: 'Hafif ağırlık taşıma aktivitesi',
      duration: '5 dk',
    },
    {
      name: 'Kum Oynama',
      type: 'Dokunsal',
      description: 'Kumda şekil çizme ve yazma',
      duration: '10 dk',
    },
    {
      name: 'Zıplama',
      type: 'Vestibüler',
      description: 'Yerinde zıplama ve ritmik hareket',
      duration: '3 dk',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri deneylerinde duyusal deneyimleri zenginleştirmede yardımcı olur. Dokunsal ve görsel duyusal girdiler, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel kavramları somut olarak deneyimlemelerini sağlar. Duyusal bütünleme aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin fen öğrenme süreçlerinde daha fazla katılım göstermelerine yardımcı olur.',
    math: 'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme süreçlerinde duyusal destek sağlar. Somut materyallerle matematik çalışmak, disleksi desteğine ihtiyacı olan öğrencilerin dokunsal ve proprioseptif duyusal kanalları kullanarak sayısal kavramları daha etkili öğrenmelerini sağlar.',
    language:
      'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma süreçlerinde duyusal düzenleme stratejileri sunar. Kumda harf yazma veya hamurla harf şekillendirme gibi dokunsal aktiviteler, disleksi desteğine ihtiyacı olan öğrencilerin harf tanıma becerilerini çoklu duyusal kanallarla geliştirmelerini sağlar.',
    social:
      'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler öğrenme süreçlerinde duyusal destek sağlar. Grup duyusal aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal etkileşim becerilerini geliştirirken aynı zamanda duyusal düzenleme ihtiyaçlarını karşılamalarına yardımcı olur.',
    general:
      'Duyusal bütünleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için duyusal işlemleme zorluklarını yönetme ve öğrenme ortamlarına uyum sağlamada kritik bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla duyusal hassasiyetler veya duyusal arama davranışları sergilerler. Yapılandırılmış duyusal aktiviteler, disleksi desteğine ihtiyacı olan öğrencilerin sinir sistemlerini düzenlemelerine ve öğrenmeye hazır hale gelmelerine yardımcı olur. Dokunsal, vestibüler ve proprioseptif duyusal girdiler, disleksi desteğine ihtiyacı olan öğrencilerin dikkat ve odaklanma becerilerini olumlu yönde etkiler. Bu stratejiler, sınıf içi öğrenme deneyimini iyileştirir.',
  };

  return {
    title: `${params.topic} - Duyusal Bütünleme`,
    content: {
      steps: activities.map((a, i) => ({
        stepNumber: i + 1,
        label: a.name,
        description: a.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Tür: ${a.type} | Süre: ${a.duration}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Duyusal düzenleme',
      'Dokunsal farkındalık',
      'Vestibüler işleme',
      'Propriosepsiyon',
    ],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SENSORY_INTEGRATION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SENSORY_INTEGRATION,
  aiGenerator: generateInfographic_SENSORY_INTEGRATION_AI,
  offlineGenerator: generateInfographic_SENSORY_INTEGRATION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'sensoryType',
        type: 'enum',
        label: 'Duyusal Tür',
        defaultValue: 'dokunsal',
        options: ['dokunsal', 'vestibuler', 'proprioseptif'],
        description: 'Hangi duyusal sisteme odaklanılsın?',
      },
      {
        name: 'activityDuration',
        type: 'number',
        label: 'Aktivite Süresi (dakika)',
        defaultValue: 10,
        description: 'Her duyusal aktivite kaç dakika sürsün?',
      },
    ],
  },
};
