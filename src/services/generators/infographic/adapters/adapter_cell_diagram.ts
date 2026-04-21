import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type CellDiagramAIResult = {
  title: string;
  components: { name: string; function: string; location: string }[];
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

function detectCategory(_topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  return 'science' as const;
}

export async function generateInfographic_CELL_DIAGRAM_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'HÜCRE DİYAGRAMI',
    params,
    '1. Hücre bileşenlerini listele\n2. Her bileşenin işlevini açıkla\n3. Görsel konum bilgisi ekle'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      components: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            function: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as CellDiagramAIResult;
  return {
    title: result.title || `${params.topic} - Hücre Diyagramı`,
    content: {
      scienceData: {
        topic: params.topic,
        components: (result.components || []).map((c) => c.name),
        properties: Object.fromEntries((result.components || []).map((c) => [c.name, c.function])),
      },
      steps: (result.components || []).map((comp, i) => ({
        stepNumber: i + 1,
        label: comp.name,
        description: comp.function,
        isCheckpoint: i === 0,
        scaffoldHint: `Konum: ${comp.location}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hücre yapısı tanıma', 'Organellerin işlevleri', 'Biyolojik sistemleri anlama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_CELL_DIAGRAM_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const components = [
    {
      name: 'Hücre Zarı',
      function: 'Hücreyi korur ve madde alışverişini düzenler.',
      location: 'En dış katman',
    },
    { name: 'Çekirdek', function: 'Hücrenin yönetim merkezi, DNA içerir.', location: 'Merkez' },
    { name: 'Mitokondri', function: 'Enerji üretir (hücrenin santrali).', location: 'Sitoplazma' },
    { name: 'Sitoplazma', function: 'Hücre içi sıvı, organelleri taşır.', location: 'Hücre içi' },
    { name: 'Ribozom', function: 'Protein sentezler.', location: 'Sitoplazma ve ER üzerinde' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Hücre diyagramı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için mikroskobik biyolojik yapıları görsel ve etiketli olarak anlamalarını sağlayan temel bir fen bilimleri aracıdır. Her organelin ismi, işlevi ve konumu görsel olarak eşleştirildiğinde, soyut hücresel kavramlar somutlaşır. Disleksi desteğine ihtiyacı olan öğrenciler, renkli etiketleme ve görsel düzenleme ile hücre bileşenlerini daha kolay öğrenirler.',
    math: 'Hücre bileşenlerinin boyutlarını karşılaştırmak, disleksi desteğine ihtiyacı olan öğrenciler için matematiksel düşünceyi biyoloji ile bağdaştırır.',
    language:
      'Hücre bileşenlerinin isimlerini öğrenmek, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel kelime dağarcığını geliştirir.',
    social:
      'Hücre yapısı insan sağlığı ile ilişkilidir. Disleksi desteğine ihtiyacı olan öğrenciler için hücresel süreçleri anlamak, sağlık okuryazarlığını destekler.',
    general:
      'Hücre diyagramı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için biyolojik yapıları anlamada önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Hücre Diyagramı`,
    content: {
      scienceData: {
        topic: params.topic,
        components: components.map((c) => c.name),
        properties: Object.fromEntries(components.map((c) => [c.name, c.function])),
      },
      steps: components.map((comp, i) => ({
        stepNumber: i + 1,
        label: comp.name,
        description: comp.function,
        isCheckpoint: i === 0,
        scaffoldHint: `Konum: ${comp.location}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Hücre yapısı tanıma', 'Organellerin işlevleri', 'Biyolojik sistemleri anlama'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_CELL_DIAGRAM: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_CELL_DIAGRAM,
  aiGenerator: generateInfographic_CELL_DIAGRAM_AI,
  offlineGenerator: generateInfographic_CELL_DIAGRAM_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'cellType',
        type: 'enum',
        label: 'Hücre Türü',
        defaultValue: 'hayvan',
        options: ['hayvan', 'bitki'],
        description: 'Hayvan hücresi mi yoksa bitki hücresi mi?',
      },
      {
        name: 'showLabels',
        type: 'boolean',
        label: 'Etiketleri Göster',
        defaultValue: true,
        description: 'Her organel için etiket gösterilsin mi?',
      },
    ],
  },
};
