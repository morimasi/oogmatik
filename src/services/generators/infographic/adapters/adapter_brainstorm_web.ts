import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type BrainstormWebAIResult = {
  title: string;
  centralIdea: string;
  branches: { name: string; subIdeas: string[] }[];
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
  const scienceTerms = ['deney', 'keşif', 'doğa'];
  const mathTerms = ['problem', 'çözüm', 'strateji'];
  if (scienceTerms.some((term) => topic.toLowerCase().includes(term))) return 'science' as const;
  if (mathTerms.some((term) => topic.toLowerCase().includes(term))) return 'math' as const;
  return 'general' as const;
}

export async function generateInfographic_BRAINSTORM_WEB_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BEYIN FIRTINASI AĞI',
    params,
    '1. Ana fikri belirle\n2. Fikir dallarını ve alt fikirleri oluştur\n3. İlişkileri görselleştir\n4. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için beyin fırtınası stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      centralIdea: { type: 'STRING' },
      branches: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            subIdeas: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as BrainstormWebAIResult;
  return {
    title: result.title || `${params.topic} - Beyin Fırtınası Ağı`,
    content: {
      hierarchy: {
        label: result.centralIdea || params.topic,
        children: (result.branches || []).map((branch) => ({
          label: branch.name,
          children: branch.subIdeas.map((idea) => ({ label: idea })),
        })),
      },
      steps: (result.branches || []).flatMap((branch, i) =>
        branch.subIdeas.map((idea, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${branch.name}: ${idea}`,
          description: `Alt fikir: ${idea}`,
          isCheckpoint: j === 0,
          scaffoldHint: `Dal: ${branch.name}`,
        }))
      ),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Beyin fırtınası ağı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı düşünme ve fikir üretme becerilerini görsel ağ yapısıyla destekleyen önemli bir öğrenme aracıdır. Ana fikirden dallanan alt fikirlerin görsel olarak düzenlenmesi, soyut düşünce süreçlerini somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel hiyerarşi ile fikirler arasındaki ilişkileri daha kolay kavrar ve yaratıcı düşünme güvenlerini geliştirirler.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı düşünme', 'Fikir üretme', 'İlişki kurma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_BRAINSTORM_WEB_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const branches = [
    { name: 'Nedenler', subIdeas: ['Merak', 'İhtiyaç', 'Problem'] },
    { name: 'Çözümler', subIdeas: ['Araştırma', 'Deneme', 'İşbirliği'] },
    { name: 'Sonuçlar', subIdeas: ['Yeni fikir', 'Gelişim', 'Öğrenme'] },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Beyin fırtınası ağı, disleksi desteğine ihtiyacı olan öğrenciler için bilimsel keşif ve hipotez üretme becerilerini görsel olarak destekleyen önemli bir fen bilimleri aracıdır. Ana fikirden dallanan alt fikirlerin görsel olarak düzenlenmesi, soyut bilimsel düşünce süreçlerini somutlaştırır. Disleksi desteğine ihtiyacı olan öğrenciler, renk kodlaması ve görsel hiyerarşi ile bilimsel fikirler arasındaki ilişkileri daha kolay kavrarlar.',
    math: 'Matematiksel problem çözmede beyin fırtınası, disleksi desteğine ihtiyacı olan öğrenciler için farklı çözüm yollarını keşfetmelerini sağlar.',
    language:
      'Yazılı anlatımda beyin fırtınası, disleksi desteğine ihtiyacı olan öğrenciler için fikirlerini organize etmelerine yardımcı olur.',
    social:
      'Toplumsal sorunlara beyin fırtınası ile çözüm üretmek, disleksi desteğine ihtiyacı olan öğrenciler için vatandaşlık bilincini destekler.',
    general:
      'Beyin fırtınası ağı infografiği, disleksi desteğine ihtiyacı olan öğrenciler için yaratıcı düşünme becerilerini geliştiren önemli bir öğrenme aracıdır.',
  };

  return {
    title: `${params.topic} - Beyin Fırtınası Ağı`,
    content: {
      hierarchy: {
        label: params.topic,
        children: branches.map((branch) => ({
          label: branch.name,
          children: branch.subIdeas.map((idea) => ({ label: idea })),
        })),
      },
      steps: branches.flatMap((branch, i) =>
        branch.subIdeas.map((idea, j) => ({
          stepNumber: i * 10 + j + 1,
          label: `${branch.name}: ${idea}`,
          description: `Alt fikir: ${idea}`,
          isCheckpoint: j === 0,
          scaffoldHint: `Dal: ${branch.name}`,
        }))
      ),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Yaratıcı düşünme', 'Fikir üretme', 'İlişki kurma'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_BRAINSTORM_WEB: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_BRAINSTORM_WEB,
  aiGenerator: generateInfographic_BRAINSTORM_WEB_AI,
  offlineGenerator: generateInfographic_BRAINSTORM_WEB_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'branchCount',
        type: 'number',
        label: 'Dal Sayısı',
        defaultValue: 3,
        description: 'Kaç fikir dalı oluşturulsun?',
      },
      {
        name: 'showSubIdeas',
        type: 'boolean',
        label: 'Alt Fikirleri Göster',
        defaultValue: true,
        description: 'Her dalın alt fikirleri gösterilsin mi?',
      },
    ],
  },
};
