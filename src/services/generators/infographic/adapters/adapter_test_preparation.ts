import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type TestPreparationAIResult = {
  title: string;
  phases: { name: string; activities: string[]; duration: string; tips: string[] }[];
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

export async function generateInfographic_TEST_PREPARATION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'SINAV HAZIRLIĞI',
    params,
    '1. Sınav hazırlık aşamalarını oluştur\n2. Her aşama için aktiviteler, süre ve ipuçları belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için sınav hazırlık stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      phases: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            activities: { type: 'ARRAY', items: { type: 'STRING' } },
            duration: { type: 'STRING' },
            tips: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as TestPreparationAIResult;
  return {
    title: result.title || `${params.topic} - Sınav Hazırlığı`,
    content: {
      steps: (result.phases || []).flatMap((phase, pi) =>
        (phase.activities || []).map((activity, ai) => ({
          stepNumber: pi * 10 + ai + 1,
          label: `${phase.name}: ${activity}`,
          description: activity,
          isCheckpoint: ai === (phase.activities || []).length - 1,
          scaffoldHint: `Süre: ${phase.duration}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Sınav Hazırlık Planı',
        steps: (result.phases || []).map((p) => p.name),
        useWhen: 'Sınav öncesi çalışma döneminde',
        benefits: (result.phases || []).map((p) => `${p.name}: ${p.duration}`),
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sınav kaygısını yönetme ve etkili çalışma stratejileri geliştirmede hayati bir rehberdir. Disleksi desteğine ihtiyacı olan öğrenciler, sınav ortamlarında okuma hızları ve yazma becerileri nedeniyle ek zorluklarla karşılaşırlar. Yapılandırılmış sınav hazırlık planları, disleksi desteğine ihtiyacı olan öğrencilerin konuları sistematik olarak gözden geçirmelerini sağlar. Görsel hazırlık takvimleri, disleksi desteğine ihtiyacı olan öğrencilerin sınav tarihine kadar olan süreci somut olarak görmelerini ve her gün ne çalışacaklarını bilmelerini sağlar. Bu belirsizliği azaltan yapı, sınav kaygısını önemli ölçüde düşürür.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sınav stratejisi', 'Zaman yönetimi', 'Kaygı yönetimi', 'Teknik planlama'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_TEST_PREPARATION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const phases = [
    {
      name: 'Konu Tekrarı',
      activities: ['Notları gözden geçir', 'Ana kavramları belirle', 'Eksik konuları tespit et'],
      duration: '1 hafta',
      tips: ['Renkli kalemler kullan', 'Kavram haritası oluştur'],
    },
    {
      name: 'Alıştırma Çözme',
      activities: ['Örnek sorular çöz', 'Zamanlı deneme yap', 'Yanlışları analiz et'],
      duration: '3 gün',
      tips: ['Zaman tutarak çöz', 'Hatalarını not al'],
    },
    {
      name: 'Son Tekrar',
      activities: ['Zayıf alanları tekrar et', 'Kısa özetler oku', 'Rahatla ve uyu'],
      duration: '1 gün',
      tips: ['Sınavdan önce iyi uyu', 'Kahvaltını yap'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri sınavlarına hazırlanmada yapılandırılmış bir rehber sunar. Deney sonuçlarını ve bilimsel kavramları tekrar etmek, disleksi desteğine ihtiyacı olan öğrencilerin fen bilgisi sınavlarında başarılı olmalarını sağlar. Görsel şemalar ve diyagramlarla desteklenen sınav hazırlığı, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel bilgileri daha etkili hatırlamalarına yardımcı olur.',
    math: 'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik sınavlarına hazırlanmada adım adım bir plan sunar. Matematik formüllerini ve problem çözme stratejilerini düzenli tekrar etmek, disleksi desteğine ihtiyacı olan öğrencilerin sınav performansını artırır. Zamanlı matematik alıştırmaları, disleksi desteğine ihtiyacı olan öğrencilerin sınav süresini yönetme becerilerini geliştirir.',
    language:
      'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için dil ve okuma sınavlarına hazırlanmada stratejik bir yaklaşım sunar. Okuma parçalarını analiz etme ve yazma görevlerini planlama becerilerini geliştirmek, disleksi desteğine ihtiyacı olan öğrencilerin dil sınavlarında daha güvenli olmalarını sağlar. Kelime çalışması ve dil bilgisi tekrarı, disleksi desteğine ihtiyacı olan öğrenclerin sınav başarısını doğrudan etkiler.',
    social:
      'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler sınavlarına hazırlanmada organize bir çerçeve sunar. Tarihî olayları ve coğrafi kavramları tekrar etmek, disleksi desteğine ihtiyacı olan öğrenclerin sosyal bilgiler sınavlarında daha iyi performans göstermelerini sağlar. Kavram haritaları ile çalışma, disleksi desteğine ihtiyacı olan öğrencilerin toplumsal ilişkileri görsel olarak hatırlamalarına yardımcı olur.',
    general:
      'Sınav hazırlığı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sınav kaygısını yönetme ve etkili çalışma stratejileri geliştirmede hayati bir rehberdir. Disleksi desteğine ihtiyacı olan öğrenciler, sınav ortamlarında okuma hızları ve yazma becerileri nedeniyle ek zorluklarla karşılaşırlar. Yapılandırılmış sınav hazırlık planları, disleksi desteğine ihtiyacı olan öğrencilerin konuları sistematik olarak gözden geçirmelerini sağlar. Görsel hazırlık takvimleri, disleksi desteğine ihtiyacı olan öğrencilerin sınav tarihine kadar olan süreci somut olarak görmelerini ve her gün ne çalışacaklarını bilmelerini sağlar. Bu belirsizliği azaltan yapı, sınav kaygısını önemli ölçüde düşürür.',
  };

  return {
    title: `${params.topic} - Sınav Hazırlığı`,
    content: {
      steps: phases.flatMap((phase, pi) =>
        phase.activities.map((activity, ai) => ({
          stepNumber: pi * 10 + ai + 1,
          label: `${phase.name}: ${activity}`,
          description: activity,
          isCheckpoint: ai === phase.activities.length - 1,
          scaffoldHint: `Süre: ${phase.duration}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Sınav Hazırlık Planı',
        steps: phases.map((p) => p.name),
        useWhen: 'Sınav öncesi çalışma döneminde',
        benefits: phases.map((p) => `${p.name}: ${p.duration}`),
      },
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Sınav stratejisi', 'Zaman yönetimi', 'Kaygı yönetimi', 'Teknik planlama'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_TEST_PREPARATION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_TEST_PREPARATION,
  aiGenerator: generateInfographic_TEST_PREPARATION_AI,
  offlineGenerator: generateInfographic_TEST_PREPARATION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'examType',
        type: 'enum',
        label: 'Sınav Türü',
        defaultValue: 'genel',
        options: ['genel', 'okuma', 'matematik', 'fen'],
        description: 'Hangi tür sınav için hazırlık?',
      },
      {
        name: 'prepDays',
        type: 'number',
        label: 'Hazırlık Süresi (gün)',
        defaultValue: 14,
        description: 'Sınava kaç gün var?',
      },
    ],
  },
};
