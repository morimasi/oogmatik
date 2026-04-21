import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SelfReflectionAIResult = {
  title: string;
  reflections: { question: string; category: string; prompt: string }[];
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

export async function generateInfographic_SELF_REFLECTION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ÖZ YANSITMA',
    params,
    '1. Öz yansıma soruları oluştur\n2. Her soru için kategori ve yönlendirme belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      reflections: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            category: { type: 'STRING' },
            prompt: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SelfReflectionAIResult;
  return {
    title: result.title || `${params.topic} - Öz Yansıma`,
    content: {
      questions: (result.reflections || []).map((r) => ({
        question: r.question,
        questionType: 'open-ended' as const,
        answer: '',
        visualCue: r.prompt,
        difficulty: 'medium' as const,
        colorCode: '#E3F2FD',
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Öz farkındalık', 'Eleştirel düşünme', 'Öz değerlendirme', 'Meta biliş'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SELF_REFLECTION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const reflections = [
    { question: 'Bugün ne öğrendim?', category: 'Öğrenme', prompt: 'En az 3 şey yaz' },
    {
      question: 'Hangi konuda zorlandım?',
      category: 'Gelişim',
      prompt: 'Zorluğu ve nedenini düşün',
    },
    { question: 'Ne iyi gitti?', category: 'Başarı', prompt: 'Başarılı olduğun anları hatırla' },
    {
      question: 'Yarın ne yapacağım?',
      category: 'Planlama',
      prompt: 'Bir sonraki adımını belirle',
    },
    {
      question: 'Kime teşekkür etmek isterim?',
      category: 'Sosyal',
      prompt: 'Destek olan kişileri düşün',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Öz yansıma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri öğrenme süreçlerini değerlendirmede önemli bir araçtır. Deney ve gözlem sonuçlarını yansıtmak, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel düşünce becerilerini derinleştirir. Disleksi desteğine ihtiyacı olan öğrenciler, öz yansıma yoluyla hangi bilimsel yöntemleri daha iyi anladıklarını keşfeder ve öğrenme stratejilerini buna göre ayarlayabilirler.',
    math: 'Öz yansıma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme süreçlerini analiz etmelerinde rehberlik eder. Hangi matematiksel kavramları anladıklarını ve hangilerinde zorlandıklarını fark etmek, disleksi desteğine ihtiyacı olan öğrencilerin matematik çalışmalarını daha etkili planlamalarını sağlar. Öz yansıma, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltmaya yardımcı olur.',
    language:
      'Öz yansıma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma gelişimlerini takip etmelerinde yapılandırılmış bir çerçeve sunar. Okuma deneyimlerini yansıtmak, disleksi desteğine ihtiyacı olan öğrencilerin metin anlama stratejilerini bilinçli olarak geliştirmelerini sağlar. Yazma süreçlerini değerlendirmek ise disleksi desteğine ihtiyacı olan öğrencilerin ifade becerilerini güçlendirir.',
    social:
      'Öz yansıma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler öğrenme deneyimlerini anlamlandırmada destekleyici bir araçtır. Toplumsal konuları kişisel deneyimlerle ilişkilendirmek, disleksi desteğine ihtiyacı olan öğrencilerin empati ve vatandaşlık bilincini geliştirir. Öz yansıma, disleksi desteğine ihtiyacı olan öğrencilerin sosyal sorumluluk duygusunu pekiştirir.',
    general:
      'Öz yansıma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için kendi öğrenme süreçlerini değerlendirme becerilerini geliştirmede kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler genellikle kendi öğrenme stillerini ve güçlü yönlerini fark etmekte zorlanırlar. Yapılandırılmış öz yansıma soruları, disleksi desteğine ihtiyacı olan öğrencilerin başarılarını görmelerini ve gelişim alanlarını belirlemelerini sağlar. Düzenli öz yansıma alıştırmaları, disleksi desteğine ihtiyacı olan öğrencilerin öz farkındalıklarını artırır ve öğrenmeye karşı aktif bir tutum geliştirmelerine yardımcı olur. Bu süreç, akademik özgüvenin inşasında temel bir adımdır.',
  };

  return {
    title: `${params.topic} - Öz Yansıma`,
    content: {
      questions: reflections.map((r) => ({
        question: r.question,
        questionType: 'open-ended' as const,
        answer: '',
        visualCue: r.prompt,
        difficulty: 'medium' as const,
        colorCode: '#E3F2FD',
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Öz farkındalık', 'Eleştirel düşünme', 'Öz değerlendirme', 'Meta biliş'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SELF_REFLECTION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SELF_REFLECTION,
  aiGenerator: generateInfographic_SELF_REFLECTION_AI,
  offlineGenerator: generateInfographic_SELF_REFLECTION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'reflectionDepth',
        type: 'enum',
        label: 'Yansıma Derinliği',
        defaultValue: 'temel',
        options: ['temel', 'derinlemesine'],
        description: 'Yansıma soruları ne kadar derin olsun?',
      },
      {
        name: 'showPrompts',
        type: 'boolean',
        label: 'Yönlendirme Göster',
        defaultValue: true,
        description: 'Her soru için yönlendirme ipuçları gösterilsin mi?',
      },
    ],
  },
};
