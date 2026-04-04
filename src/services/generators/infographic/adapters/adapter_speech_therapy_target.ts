import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type SpeechTherapyTargetAIResult = {
  title: string;
  targets: { skill: string; objective: string; activity: string; criteria: string }[];
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

export async function generateInfographic_SPEECH_THERAPY_TARGET_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DİL KONUŞMA HEDEFİ',
    params,
    '1. Dil ve konuşma terapi hedeflerini oluştur\n2. Her hedef için beceri, amaç, aktivite ve kriter belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için dil konuşma hedef stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      targets: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            skill: { type: 'STRING' },
            objective: { type: 'STRING' },
            activity: { type: 'STRING' },
            criteria: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as SpeechTherapyTargetAIResult;
  return {
    title: result.title || `${params.topic} - Dil Konuşma Hedefi`,
    content: {
      steps: (result.targets || []).map((t, i) => ({
        stepNumber: i + 1,
        label: `${t.skill}: ${t.objective}`,
        description: t.objective,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Aktivite: ${t.activity} | Kriter: ${t.criteria}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fonolojik farkındalık, dil bilgisi, anlatım becerileri ve akıcılık gibi dil ve konuşma alanlarında hedeflenen becerileri yapılandırılmış şekilde planlama aracıdır. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla fonolojik işlemleme zorlukları yaşarlar ve bu durum okuma öğrenmelerini doğrudan etkiler. Dil konuşma terapisti ile iş birliği içinde belirlenen hedefler, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini sistematik olarak geliştirmelerini sağlar. Her hedef için belirlenen aktiviteler ve ölçülebilir kriterler, disleksi desteğine ihtiyacı olan öğrencilerin ilerlemelerini takip etmeyi ve terapi sürecini veriye dayalı olarak yönlendirmeyi kolaylaştırır.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Fonolojik farkındalık', 'Dil bilgisi', 'Anlatım', 'Akıcılık'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_SPEECH_THERAPY_TARGET_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const targets = [
    {
      skill: 'Fonolojik Farkındalık',
      objective: 'Heceleme becerisi geliştirir',
      activity: 'Hece bölme oyunu',
      criteria: "10 kelimeden 8'ini doğru böler",
    },
    {
      skill: 'Ses Farkındalığı',
      objective: 'Başlangıç seslerini tanır',
      activity: 'Ses eşleştirme kartları',
      criteria: "10 sesten 7'sini doğru eşleştirir",
    },
    {
      skill: 'Kelime Dağarcığı',
      objective: 'Yeni kelimeleri öğrenir ve kullanır',
      activity: 'Kelime kutusu etkinliği',
      criteria: 'Haftada 5 yeni kelime kullanır',
    },
    {
      skill: 'Cümle Kurma',
      objective: 'Basit cümleler kurar',
      activity: 'Resimden cümle oluşturma',
      criteria: "5 cümleden 4'ü gramer olarak doğru",
    },
    {
      skill: 'Anlatım',
      objective: 'Bir olayı sıralı anlatır',
      activity: 'Resimli hikaye anlatımı',
      criteria: '3 olayı doğru sırayla anlatır',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri terimlerini anlama ve kullanma becerilerini geliştirmede yardımcı olur. Bilimsel kelime dağarcığı ve fen kavramlarını ifade etme becerileri, disleksi desteğine ihtiyacı olan öğrencilerin fen öğrenme süreçlerini destekler.',
    math: 'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik dilini anlama ve kullanma becerilerini geliştirmede rehberlik eder. Matematik terimlerini anlama ve problem çözme süreçlerini sözel olarak ifade etme, disleksi desteğine ihtiyacı olan öğrencilerin matematik öğrenme deneyimini iyileştirir.',
    language:
      'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma becerilerinin temelini oluşturan dil becerilerini geliştirmede kritik bir araçtır. Fonolojik farkındalık, ses farkındalığı ve kelime dağarcığı hedefleri, disleksi desteğine ihtiyacı olan öğrencilerin okuma öğrenme süreçlerini doğrudan destekler.',
    social:
      'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal iletişim ve anlatım becerilerini geliştirmede destek sağlar. Grup tartışmalarına katılma ve fikirlerini ifade etme becerileri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal öğrenme deneyimlerini zenginleştirir.',
    general:
      'Dil konuşma hedefi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fonolojik farkındalık, dil bilgisi, anlatım becerileri ve akıcılık gibi dil ve konuşma alanlarında hedeflenen becerileri yapılandırılmış şekilde planlama aracıdır. Disleksi desteğine ihtiyacı olan öğrenciler sıklıkla fonolojik işlemleme zorlukları yaşarlar ve bu durum okuma öğrenmelerini doğrudan etkiler. Dil konuşma terapisti ile iş birliği içinde belirlenen hedefler, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini sistematik olarak geliştirmelerini sağlar. Her hedef için belirlenen aktiviteler ve ölçülebilir kriterler, disleksi desteğine ihtiyacı olan öğrencilerin ilerlemelerini takip etmeyi ve terapi sürecini veriye dayalı olarak yönlendirmeyi kolaylaştırır.',
  };

  return {
    title: `${params.topic} - Dil Konuşma Hedefi`,
    content: {
      steps: targets.map((t, i) => ({
        stepNumber: i + 1,
        label: `${t.skill}: ${t.objective}`,
        description: t.objective,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Aktivite: ${t.activity} | Kriter: ${t.criteria}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Fonolojik farkındalık', 'Dil bilgisi', 'Anlatım', 'Akıcılık'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_SPEECH_THERAPY_TARGET: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SPEECH_THERAPY_TARGET,
  aiGenerator: generateInfographic_SPEECH_THERAPY_TARGET_AI,
  offlineGenerator: generateInfographic_SPEECH_THERAPY_TARGET_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'therapyFocus',
        type: 'enum',
        label: 'Terapi Odak Alanı',
        defaultValue: 'fonolojik',
        options: ['fonolojik', 'kelime', 'cumle', 'anlatim'],
        description: 'Hangi dil becerisine odaklanılsın?',
      },
      {
        name: 'showCriteria',
        type: 'boolean',
        label: 'Ölçütleri Göster',
        defaultValue: true,
        description: 'Her hedef için ölçülebilir kriterler gösterilsin mi?',
      },
    ],
  },
};
