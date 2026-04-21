import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type ParentGuideAIResult = {
  title: string;
  sections: { topic: string; tips: string[]; resource: string }[];
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

export async function generateInfographic_PARENT_GUIDE_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'AİLE REHBERİ',
    params,
    '1. Aileler için rehber bölümlerini oluştur\n2. Her bölüm için ipuçları ve kaynak belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      sections: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            topic: { type: 'STRING' },
            tips: { type: 'ARRAY', items: { type: 'STRING' } },
            resource: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as ParentGuideAIResult;
  return {
    title: result.title || `${params.topic} - Aile Rehberi`,
    content: {
      steps: (result.sections || []).flatMap((section, si) =>
        (section.tips || []).map((tip, ti) => ({
          stepNumber: si * 10 + ti + 1,
          label: `${section.topic}: ${tip}`,
          description: tip,
          isCheckpoint: ti === (section.tips || []).length - 1,
          scaffoldHint: `Kaynak: ${section.resource}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Aile desteği', 'Evde öğrenme', 'İletişim', 'Kaynak kullanımı'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_PARENT_GUIDE_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const sections = [
    {
      topic: 'Disleksiyi Anlama',
      tips: [
        'Disleksi zeka ile ilgili değildir',
        'Her çocuğun öğrenme hızı farklıdır',
        'Sabırlı ve destekleyici olun',
      ],
      resource: 'MEB Özel Eğitim Rehberi',
    },
    {
      topic: 'Evde Okuma Desteği',
      tips: [
        'Birlikte sesli okuma yapın',
        'Kısa ve sık okuma seansları',
        'İlgi duyduğu konulardan başlayın',
      ],
      resource: 'Çocuk kitapları listesi',
    },
    {
      topic: 'Ödev Desteği',
      tips: [
        'Sessiz bir çalışma alanı oluşturun',
        'Görevleri küçük parçalara bölün',
        'Her tamamlanan görev için övgü',
      ],
      resource: 'Ödev planlama şablonu',
    },
    {
      topic: 'Duygusal Destek',
      tips: ['Çocuğunuzun duygularını dinleyin', 'Başarılarını kutlayın', 'Kıyaslamadan kaçının'],
      resource: 'Aile destek grubu',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Aile rehberi infografiği, disleksi desteğine ihtiyacı olan öğrencilerin velileri için evde fen bilimleri destek aktiviteleri sunar. Evde basit deneyler yapma ve doğa gözlemleri gerçekleştirme, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel meraklarını aile desteğiyle geliştirmelerini sağlar.',
    math: 'Aile rehberi infografiği, disleksi desteğine ihtiyacı olan öğrencilerin velileri için evde matematik destek stratejileri sunar. Günlük yaşamda matematik kullanma (alışveriş, yemek tarifi) aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin matematik becerilerini aile desteğiyle geliştirmelerini sağlar.',
    language:
      'Aile rehberi infografiği, disleksi desteğine ihtiyacı olan öğrencilerin velileri için evde okuma ve yazma destek stratejileri sunar. Birlikte okuma seansları ve yazma aktiviteleri, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini aile desteğiyle geliştirmelerini sağlar.',
    social:
      'Aile rehberi infografiği, disleksi desteğine ihtiyacı olan öğrencilerin velileri için evde sosyal bilgiler destek aktiviteleri sunar. Müze ziyaretleri ve tarihî yerleri keşfetme, disleksi desteğine ihtiyacı olan öğrencilerin sosyal bilimler öğrenimini aile desteğiyle zenginleştirmelerini sağlar.',
    general:
      'Aile rehberi infografiği, disleksi desteğine ihtiyacı olan öğrencilerin velileri için evde destek stratejileri ve kaynaklar sunan kapsamlı bir rehberdir. Disleksi desteğine ihtiyacı olan öğrencilerin öğrenme süreçlerinde aile desteği kritik öneme sahiptir. Velilerin disleksi hakkında bilgi sahibi olmaları, disleksi desteğine ihtiyacı olan öğrencilerin evde uygun destek almalarını sağlar. Yapılandırılmış aile rehberi, velilere evde uygulanabilir stratejiler, kaynak önerileri ve iletişim ipuçları sunarak disleksi desteğine ihtiyacı olan öğrencilerin öğrenme deneyimini okul ve ev arasında tutarlı hale getirir. Aile-okul iş birliği, disleksi desteğine ihtiyacı olan öğrencilerin akademik ve duygusal gelişimini önemli ölçüde destekler.',
  };

  return {
    title: `${params.topic} - Aile Rehberi`,
    content: {
      steps: sections.flatMap((section, si) =>
        section.tips.map((tip, ti) => ({
          stepNumber: si * 10 + ti + 1,
          label: `${section.topic}: ${tip}`,
          description: tip,
          isCheckpoint: ti === section.tips.length - 1,
          scaffoldHint: `Kaynak: ${section.resource}`,
        }))
      ),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Aile desteği', 'Evde öğrenme', 'İletişim', 'Kaynak kullanımı'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_PARENT_GUIDE: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_PARENT_GUIDE,
  aiGenerator: generateInfographic_PARENT_GUIDE_AI,
  offlineGenerator: generateInfographic_PARENT_GUIDE_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'guideTopic',
        type: 'enum',
        label: 'Rehber Konusu',
        defaultValue: 'genel',
        options: ['genel', 'okuma', 'matematik', 'davranis'],
        description: 'Aile rehberi hangi konuya odaklansın?',
      },
      {
        name: 'showResources',
        type: 'boolean',
        label: 'Kaynakları Göster',
        defaultValue: true,
        description: 'Her bölüm için kaynak önerileri gösterilsin mi?',
      },
    ],
  },
};
