import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type AnxietyReliefAIResult = {
  title: string;
  techniques: { name: string; description: string; steps: string[] }[];
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

export async function generateInfographic_ANXIETY_RELIEF_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'KAYGI AZALTMA',
    params,
    '1. Kaygı azaltma tekniklerini listele\n2. Her teknik için açıklama ve adımlar belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için kaygı yönetimi stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      techniques: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as AnxietyReliefAIResult;
  return {
    title: result.title || `${params.topic} - Kaygı Azaltma`,
    content: {
      steps: (result.techniques || []).flatMap((t, ti) =>
        (t.steps || []).map((step, si) => ({
          stepNumber: ti * 10 + si + 1,
          label: `${t.name}: ${step}`,
          description: step,
          isCheckpoint: si === (t.steps || []).length - 1,
          scaffoldHint: t.description,
        }))
      ),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için akademik ve sosyal kaygıyı yönetmede yapılandırılmış bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, okuma güçlüğü ve akademik zorluklar nedeniyle artan kaygı düzeyleri yaşarlar. Nefes egzersizleri, kas gevşetme teknikleri ve olumlu öz konuşma stratejileri, disleksi desteğine ihtiyacı olan öğrencilerin kaygı belirtilerini tanımalarını ve yönetmelerini sağlar. Görsel kaygı ölçekleri, disleksi desteğine ihtiyacı olan öğrencilerin duygusal durumlarını ifade etmelerini kolaylaştırır ve uygun baş etme stratejilerini seçmelerine yardımcı olur. Bu müdahaleler, öğrenme ortamında güven ve güvenlik duygusunu pekiştirir.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'calm',
    },
    targetSkills: ['Kaygı yönetimi', 'Nefes egzersizi', 'Kas gevşetme', 'Olumlu öz konuşma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ANXIETY_RELIEF_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const techniques = [
    {
      name: 'Derin Nefes',
      description: '4-7-8 nefes tekniği',
      steps: ['4 saniye nefes al', '7 saniye tut', '8 saniye ver', '3 kez tekrarla'],
    },
    {
      name: 'Kas Gevşetme',
      description: 'Aşamalı kas gevşetme',
      steps: ['Ellerini sık', '5 saniye tut', 'Bırak ve gevşe', 'Farkı hisset'],
    },
    {
      name: '5 Duyu',
      description: '5-4-3-2-1 duyu tekniği',
      steps: ['5 şey gör', '4 şey dokun', '3 şey duy', '2 şey kokla', '1 şey tat'],
    },
    {
      name: 'Güvenli Yer',
      description: 'Zihinde güvenli yer canlandırma',
      steps: ['Gözlerini kapat', 'Güvenli yeri hayal et', 'Detayları hisset', 'Rahatla'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri deney ve sınav kaygısını yönetmede yardımcı olur. Deney sonuçları beklendiği gibi olmadığında disleksi desteğine ihtiyacı olan öğrenciler kaygı yaşayabilir. Nefes egzersizleri ve kas gevşetme teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin fen öğrenme süreçlerinde sakin kalmalarını sağlar.',
    math: 'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik kaygısını yönetmede kritik bir araçtır. Matematik problemleriyle karşılaştığında disleksi desteğine ihtiyacı olan öğrenciler sıklıkla kaygı ve panik yaşar. 5 duyu tekniği ve derin nefes egzersizleri, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını anında azaltmalarına yardımcı olur.',
    language:
      'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma kaygısını yönetmede destekleyici bir araç sunar. Sesli okuma görevleri disleksi desteğine ihtiyacı olan öğrenciler için yüksek kaygı yaratabilir. Güvenli yer imajinasyonu ve kas gevşetme teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin okuma öncesi kaygılarını azaltır.',
    social:
      'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal etkileşim kaygısını yönetmede rehberlik eder. Grup çalışmaları ve sunumlar disleksi desteğine ihtiyacı olan öğrenciler için kaygı verici olabilir. Derin nefes ve 5 duyu teknikleri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal durumlarda sakin kalmalarını sağlar.',
    general:
      'Kaygı azaltma infografiği, disleksi desteğine ihtiyacı olan öğrenciler için akademik ve sosyal kaygıyı yönetmede yapılandırılmış bir rehber sunar. Disleksi desteğine ihtiyacı olan öğrenciler, okuma güçlüğü ve akademik zorluklar nedeniyle artan kaygı düzeyleri yaşarlar. Nefes egzersizleri, kas gevşetme teknikleri ve olumlu öz konuşma stratejileri, disleksi desteğine ihtiyacı olan öğrencilerin kaygı belirtilerini tanımalarını ve yönetmelerini sağlar. Görsel kaygı ölçekleri, disleksi desteğine ihtiyacı olan öğrencilerin duygusal durumlarını ifade etmelerini kolaylaştırır ve uygun baş etme stratejilerini seçmelerine yardımcı olur. Bu müdahaleler, öğrenme ortamında güven ve güvenlik duygusunu pekiştirir.',
  };

  return {
    title: `${params.topic} - Kaygı Azaltma`,
    content: {
      steps: techniques.flatMap((t, ti) =>
        t.steps.map((step, si) => ({
          stepNumber: ti * 10 + si + 1,
          label: `${t.name}: ${step}`,
          description: step,
          isCheckpoint: si === t.steps.length - 1,
          scaffoldHint: t.description,
        }))
      ),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'calm',
    },
    targetSkills: ['Kaygı yönetimi', 'Nefes egzersizi', 'Kas gevşetme', 'Olumlu öz konuşma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ANXIETY_RELIEF: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ANXIETY_RELIEF,
  aiGenerator: generateInfographic_ANXIETY_RELIEF_AI,
  offlineGenerator: generateInfographic_ANXIETY_RELIEF_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'anxietyLevel',
        type: 'enum',
        label: 'Kaygı Seviyesi',
        defaultValue: 'dusuk',
        options: ['dusuk', 'orta', 'yuksek'],
        description: 'Öğrencinin mevcut kaygı seviyesi',
      },
      {
        name: 'showBreathing',
        type: 'boolean',
        label: 'Nefes Egzersizi Göster',
        defaultValue: true,
        description: 'Nefes egzersizi animasyonu gösterilsin mi?',
      },
    ],
  },
};
