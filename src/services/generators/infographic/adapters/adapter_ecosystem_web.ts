import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type EcosystemWebAIResult = {
  title: string;
  organisms: { name: string; type: string; connections: string[] }[];
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
  const scienceTerms = ['ekosistem', 'canlı', 'habitat', 'tür'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  return 'general' as const;
}

export async function generateInfographic_ECOSYSTEM_WEB_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'EKOSİSTEM AĞI',
    params,
    '1. Ekosistemdeki canlıları listele\n2. Her canlının bağlantılarını göster\n3. Besin ilişkilerini haritala\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için ekosistem ağı öğrenme stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      organisms: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            type: { type: 'STRING' },
            connections: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as EcosystemWebAIResult;
  return {
    title: result.title || `${params.topic} - Ekosistem Ağı`,
    content: {
      scienceData: {
        topic: params.topic,
        components: (result.organisms || []).map((o) => o.name),
        relationships: (result.organisms || []).flatMap((o) =>
          o.connections.map((c) => ({ from: o.name, to: c, label: o.type }))
        ),
      },
      steps: (result.organisms || []).map((org, i) => ({
        stepNumber: i + 1,
        label: org.name,
        description: `Tür: ${org.type}. Bağlantılar: ${org.connections.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Tür: ${org.type}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Ekosistem ağı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için doğadaki yaşam ilişkilerini görsel ağ yapısıyla anlamalarını sağlayan önemli bir fen bilimleri aracıdır. Her canlının diğer canlılarla olan bağlantılarını görsel çizgilerle takip etmek, soyut ekolojik ilişkileri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlamalı ağ yapısı ile besin ilişkilerini ve ekosistem dengesini bütünsel olarak kavrarlar ve çevre bilinci geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ekosistem ilişkileri', 'Besin ağı anlama', 'Doğal denge kavrama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ECOSYSTEM_WEB_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const organisms = [
    { name: 'Çimen', type: 'Üretici', connections: ['Çekirge', 'Tavşan'] },
    { name: 'Çekirge', type: 'Birincil Tüketici', connections: ['Kurbağa', 'Kuş'] },
    { name: 'Tavşan', type: 'Birincil Tüketici', connections: ['Tilki', 'Kartal'] },
    { name: 'Kurbağa', type: 'İkincil Tüketici', connections: ['Yılan'] },
    { name: 'Yılan', type: 'Üçüncül Tüketici', connections: ['Kartal'] },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Ekosistem ağı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için doğadaki yaşam ilişkilerini görsel ağ yapısıyla anlamalarını sağlayan temel bir fen bilimleri aracıdır. Her canlının diğer canlılarla olan bağlantılarını görsel çizgilerle takip etmek, soyut ekolojik ilişkileri somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlamalı ağ yapısı ile besin ilişkilerini ve ekosistem dengesini bütünsel olarak kavrarlar.',
    math: 'Ekosistem ağında bağlantı sayılarını hesaplamak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi biyoloji ile bağdaştırır.',
    language:
      'Ekosistem ilişkilerini anlatmak, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel kelime dağarcığını ve nedensellik ifadelerini geliştirir.',
    social:
      'Ekosistem dengesi insan yaşamı ile doğrudan ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için çevre bilinci geliştirir.',
    general:
      'Ekosistem ağı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için doğal yaşam ilişkilerini anlamada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Ekosistem Ağı`,
    content: {
      scienceData: {
        topic: params.topic,
        components: organisms.map((o) => o.name),
        relationships: organisms.flatMap((o) =>
          o.connections.map((c) => ({ from: o.name, to: c, label: o.type }))
        ),
      },
      steps: organisms.map((org, i) => ({
        stepNumber: i + 1,
        label: org.name,
        description: `Tür: ${org.type}. Bağlantılar: ${org.connections.join(', ')}`,
        isCheckpoint: i === 0,
        scaffoldHint: `Tür: ${org.type}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Ekosistem ilişkileri', 'Besin ağı anlama', 'Doğal denge kavrama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ECOSYSTEM_WEB: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ECOSYSTEM_WEB,
  aiGenerator: generateInfographic_ECOSYSTEM_WEB_AI,
  offlineGenerator: generateInfographic_ECOSYSTEM_WEB_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'ecosystemType',
        type: 'string',
        label: 'Ekosistem Türü',
        defaultValue: 'Orman',
        description: 'Hangi ekosistem gösterilsin?',
      },
      {
        name: 'showConnections',
        type: 'boolean',
        label: 'Bağlantıları Göster',
        defaultValue: true,
        description: 'Canlılar arası bağlantılar gösterilsin mi?',
      },
    ],
  },
};
