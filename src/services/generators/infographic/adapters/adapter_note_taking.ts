import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type NoteTakingAIResult = {
  title: string;
  sections: { heading: string; items: string[]; type: string }[];
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

export async function generateInfographic_NOTE_TAKING_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'NOT ALMA',
    params,
    '1. Cornell not alma formatında bölümler oluştur\n2. Her bölüm için anahtar kelimeler ve özet belirt'
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
            heading: { type: 'STRING' },
            items: { type: 'ARRAY', items: { type: 'STRING' } },
            type: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as NoteTakingAIResult;
  return {
    title: result.title || `${params.topic} - Not Alma`,
    content: {
      steps: (result.sections || []).flatMap((section, si) =>
        (section.items || []).map((item, ii) => ({
          stepNumber: si * 10 + ii + 1,
          label: `${section.heading}: ${item}`,
          description: item,
          isCheckpoint: ii === (section.items || []).length - 1,
          scaffoldHint: `Bölüm: ${section.type}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Cornell Not Alma',
        steps: (result.sections || []).map((s: unknown) => s.heading),
        useWhen: 'Ders sırasında veya okuma yaparken',
        benefits: ['Bilgiyi yapılandırma', 'Tekrar kolaylığı', 'Anahtar kavramları belirleme'],
      },
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Not alma',
      'Bilgi yapılandırma',
      'Anahtar kavram belirleme',
      'Tekrar stratejisi',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_NOTE_TAKING_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const sections = [
    {
      heading: 'Ana Kavramlar',
      items: ['Konunun ana fikri', 'Önemli terimler', 'Temel kavramlar'],
      type: 'notlar',
    },
    { heading: 'Detaylar', items: ['Açıklamalar', 'Örnekler', 'Karşılaştırmalar'], type: 'detay' },
    {
      heading: 'Özet',
      items: ['Kısa özet', 'Kendi cümlelerinle', 'Anahtar noktalar'],
      type: 'özet',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Not alma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri derslerinde yeni kavram ve süreçleri kaydetmede yapılandırılmış bir yaklaşım sunar. Deney sonuçlarını ve bilimsel terimleri organize şekilde not almak, disleksi desteğine ihtiyacı olan öğrencilerin fen bilgisini sistematik olarak öğrenmelerini sağlar. Görsel not alma teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel süreçleri şemalar ve diyagramlarla desteklemelerine olanak tanır.',
    math: 'Not alma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem çözme adımlarını kaydetmede kritik bir araçtır. Matematiksel işlemleri adım adım not almak, disleksi desteğine ihtiyacı olan öğrencilerin çözüm süreçlerini takip etmelerini ve tekrar etmelerini kolaylaştırır. Formül ve kural notlarını görsel olarak düzenlemek, disleksi desteğine ihtiyacı olan öğrencilerin matematiksel bilgiyi daha etkili şekilde depolamalarını sağlar.',
    language:
      'Not alma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve dinleme süreçlerinde önemli bilgileri yakalamada rehberlik eder. Metinlerden ana fikirleri ve destekleyici detayları not almak, disleksi desteğine ihtiyacı olan öğrencilerin okuduğunu anlama becerilerini geliştirir. Kelime dağarcığı notları, disleksi desteğine ihtiyacı olan öğrencilerin yeni kelimeleri öğrenme ve hatırlama süreçlerini destekler.',
    social:
      'Not alma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler derslerinde tarihî olayları ve coğrafi kavramları organize etmede yardımcı olur. Kronolojik not alma teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin zaman çizelgelerini görsel olarak takip etmelerini kolaylaştırır. Kavram haritaları ile not almak, disleksi desteğine ihtiyacı olan öğrencilerin toplumsal ilişkileri bütünsel olarak anlamalarını destekler.',
    general:
      'Not alma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bilgiyi yapılandırma ve tekrar etme süreçlerinde temel bir öğrenme stratejisi sunar. Disleksi desteğine ihtiyacı olan öğrenciler, işitsel bilgileri yazıya dökme konusunda zorluk yaşayabilirler ve bu nedenle yapılandırılmış not alma şablonları büyük önem taşır. Cornell not alma yöntemi gibi organize formatlar, disleksi desteğine ihtiyacı olan öğrencilerin bilgileri kategorilere ayırmalarını ve anahtar kavramları belirlemelerini kolaylaştırır. Görsel not alma teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin bilgiyi çoklu duyusal kanallarla işlemelerine olanak tanır ve bu durum öğrenmenin kalıcılığını artırır.',
  };

  return {
    title: `${params.topic} - Not Alma`,
    content: {
      steps: sections.flatMap((section, si) =>
        section.items.map((item, ii) => ({
          stepNumber: si * 10 + ii + 1,
          label: `${section.heading}: ${item}`,
          description: item,
          isCheckpoint: ii === section.items.length - 1,
          scaffoldHint: `Bölüm: ${section.type}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Cornell Not Alma',
        steps: sections.map((s: unknown) => s.heading),
        useWhen: 'Ders sırasında veya okuma yaparken',
        benefits: ['Bilgiyi yapılandırma', 'Tekrar kolaylığı', 'Anahtar kavramları belirleme'],
      },
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Not alma',
      'Bilgi yapılandırma',
      'Anahtar kavram belirleme',
      'Tekrar stratejisi',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_NOTE_TAKING: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_NOTE_TAKING,
  aiGenerator: generateInfographic_NOTE_TAKING_AI,
  offlineGenerator: generateInfographic_NOTE_TAKING_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'noteStyle',
        type: 'enum',
        label: 'Not Alma Stili',
        defaultValue: 'cornell',
        options: ['cornell', 'mindmap', 'outline'],
        description: 'Hangi not alma yöntemi kullanılsın?',
      },
      {
        name: 'showVisualCues',
        type: 'boolean',
        label: 'Görsel İpuçları',
        defaultValue: true,
        description: 'Görsel ipuçları ve semboller kullanılsın mı?',
      },
    ],
  },
};
