import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type DysgraphiaWritingAIResult = {
  title: string;
  strategies: { name: string; description: string; tool: string }[];
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

export async function generateInfographic_DYSGRAPHIA_WRITING_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DİSGRAFİ YAZMA DESTEĞİ',
    params,
    '1. Disgrafi için yazma destek stratejilerini listele\n2. Her strateji için açıklama ve araç belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      strategies: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            tool: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as DysgraphiaWritingAIResult;
  return {
    title: result.title || `${params.topic} - Disgrafi Yazma Desteği`,
    content: {
      steps: (result.strategies || []).map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Araç: ${s.tool}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Yazma organizasyonu',
      'El yazısı desteği',
      'Yazılı ifade',
      'Grafik düzenleyici kullanımı',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyslexia',
  };
}

export function generateInfographic_DYSGRAPHIA_WRITING_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const strategies = [
    {
      name: 'Grafik Düzenleyici',
      description: 'Yazma öncesi fikirleri organize etme',
      tool: 'Zihin haritası şablonu',
    },
    {
      name: 'Yazım İskeleti',
      description: 'Cümle başlangıçları ve yapılar sağlama',
      tool: 'Dolgu cümle şablonu',
    },
    {
      name: 'Klavye Kullanımı',
      description: 'El yazısı yerine klavye ile yazma',
      tool: 'Büyük tuşlu klavye',
    },
    {
      name: 'Sesli Yazma',
      description: 'Ses tanıma ile yazıya dökme',
      tool: 'Ses tanıma yazılımı',
    },
    {
      name: 'Çizgili Kağıt',
      description: 'Geniş aralıklı çizgili kağıt kullanımı',
      tool: 'Özel çizgili defter',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Disgrafi yazma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri raporları ve deney notlarını yazmada rehberlik eder. Bilimsel terimleri yazma zorluğu çeken disleksi desteğine ihtiyacı olan öğrenciler, grafik düzenleyiciler ve yazım iskeletleri ile fen bilgisi içeriklerini daha etkili şekilde üretebilirler. Görsel destekli yazma şablonları, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel düşünce süreçlerini yazıya dökmelerini kolaylaştırır.',
    math: 'Disgrafi yazma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem çözme süreçlerini yazılı olarak ifade etmede destek sağlar. Matematiksel işlemleri ve açıklamaları yazma zorluğu yaşayan disleksi desteğine ihtiyacı olan öğrenciler, yapılandırılmış matematik yazma şablonları ile çözüm adımlarını daha düzenli şekilde sunabilirler.',
    language:
      'Disgrafi yazma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yazılı anlatım becerilerini geliştirmede temel bir rehberdir. Kompozisyon ve yaratıcı yazma görevlerinde disleksi desteğine ihtiyacı olan öğrenciler, grafik düzenleyiciler ve yazım iskeletleri ile düşüncelerini daha organize şekilde yazıya dökebilirler. Sesli yazma teknolojileri, disleksi desteğine ihtiyacı olan öğrencilerin yaratıcı ifadelerini fiziksel yazma zorluklarından bağımsız olarak ortaya koymalarını sağlar.',
    social:
      'Disgrafi yazma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler yazma görevlerinde yapılandırılmış destek sunar. Tarihî olayları veya coğrafi kavramları yazılı olarak ifade etme zorluğu çeken disleksi desteğine ihtiyacı olan öğrenciler, grafik düzenleyiciler ile fikirlerini organize edebilir ve yazım iskeletleri ile içeriklerini daha etkili şekilde üretebilirler.',
    general:
      'Disgrafi yazma desteği infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yazma güçlüğüyle başa çıkma stratejilerini görsel olarak sunan önemli bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla el yazısı, harf formasyonu ve yazılı ifade alanlarında zorluk yaşarlar. Yapılandırılmış yazma şablonları ve grafik düzenleyiciler, disleksi desteğine ihtiyacı olan öğrencilerin düşüncelerini organize etmelerini ve yazıya dökmelerini kolaylaştırır. Klavye kullanımı ve sesli yazma teknolojileri, disleksi desteğine ihtiyacı olan öğrencilerin yazılı ifade becerilerini fiziksel yazma zorluklarından bağımsız olarak geliştirmelerini sağlar. Bu araçlar, öğrencilerin içerik üretimine odaklanmalarını sağlar.',
  };

  return {
    title: `${params.topic} - Disgrafi Yazma Desteği`,
    content: {
      steps: strategies.map((s, i) => ({
        stepNumber: i + 1,
        label: s.name,
        description: s.description,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Araç: ${s.tool}`,
      })),
    },
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: [
      'Yazma organizasyonu',
      'El yazısı desteği',
      'Yazılı ifade',
      'Grafik düzenleyici kullanımı',
    ],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: 'dyslexia',
  };
}

export const INFOGRAPHIC_DYSGRAPHIA_WRITING: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_DYSGRAPHIA_WRITING,
  aiGenerator: generateInfographic_DYSGRAPHIA_WRITING_AI,
  offlineGenerator: generateInfographic_DYSGRAPHIA_WRITING_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'writingSupport',
        type: 'enum',
        label: 'Yazma Destek Türü',
        defaultValue: 'grafik_duzenleyici',
        options: ['grafik_duzenleyici', 'yazim_iskeleti', 'sesli_yazma'],
        description: 'Hangi yazma desteği kullanılsın?',
      },
      {
        name: 'showTemplates',
        type: 'boolean',
        label: 'Şablonları Göster',
        defaultValue: true,
        description: 'Yazma şablonları gösterilsin mi?',
      },
    ],
  },
};
