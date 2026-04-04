import { ActivityType } from '../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../types/infographic';
import { generateWithSchema } from '../geminiClient';

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

export async function generateInfographic_StoryMap_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'HİKAYE HARİTASI',
    params,
    '1. Başlık, mekan, zaman, karakterler, problem, çözüm\n2. Her bölüm için net bilgiler yaz\n3. Pedagojik not: Hikaye haritasının metin analizine katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      setting: { type: 'STRING' },
      time: { type: 'STRING' },
      characters: { type: 'ARRAY', items: { type: 'STRING' } },
      problem: { type: 'STRING' },
      events: { type: 'ARRAY', items: { type: 'STRING' } },
      resolution: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result: any = await generateWithSchema(prompt, schema);
  return {
    title: result.title || `${params.topic} - Hikaye Haritası`,
    content: {
      storyElements: {
        title: result.title,
        setting: `${result.setting} - ${result.time}`,
        characters: result.characters,
        problem: result.problem,
        events: result.events,
        resolution: result.resolution,
      },
    },
    pedagogicalNote: result.pedagogicalNote || 'Hikaye haritası analitik becerileri artırır.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 1,
    },
    targetSkills: ['Metin analizi', 'Hikaye unsurları'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_StoryMap_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Hikaye Haritası`,
    content: {
      storyElements: {
        title: params.topic,
        setting: 'Yer - Zaman',
        characters: ['Karakter 1', 'Karakter 2'],
        problem: 'Hikayedeki sorun nedir?',
        events: ['Olay 1', 'Olay 2', 'Olay 3'],
        resolution: 'Sorun nasıl çözüldü?',
      },
    },
    pedagogicalNote:
      'Hikaye haritası analitik becerileri artırır ve öğrencinin hikayeyi bütüncül görmesini sağlar.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 1,
    },
    targetSkills: ['Metin analizi', 'Hikaye unsurları'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_STORY_MAP: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_STORY_MAP,
  aiGenerator: generateInfographic_StoryMap_AI,
  offlineGenerator: generateInfographic_StoryMap_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'detailLevel',
        type: 'enum',
        label: 'Detay Seviyesi',
        defaultValue: 'temel',
        options: ['temel', 'detayli'],
        description: 'Olay akışı ne kadar detaylı olsun?',
      },
    ],
  },
};
