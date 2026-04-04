import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

function buildAIPrompt(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): string {
  return `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.\nKONU: ${params.topic}\nÖZEL PARAMETRELER: ${JSON.stringify(params.activityParams, null, 2)}\nKURALLAR:\n${rules}\nJSON ÇIKTI:`;
}

export async function generateInfographic_MotorSkills_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'MOTOR BECERİLER',
    params,
    '1. İnce ve kaba motor becerileri kategorize et\n2. Her beceri için etkinlik öner\n3. Pedagojik not: Motor becerilerin akademik başarıya etkisi (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      fineMotor: { type: 'array' as const, items: { type: 'string' as const } },
      grossMotor: { type: 'array' as const, items: { type: 'string' as const } },
      activities: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as {
    title: string;
    fineMotor: string[];
    grossMotor: string[];
    activities: string[];
    pedagogicalNote: string;
  };
  return {
    title: result.title || `${params.topic} - Motor Beceriler`,
    content: {
      hierarchy: {
        label: 'Motor Beceriler',
        children: [
          { label: 'İnce Motor', children: (result.fineMotor || []).map((m) => ({ label: m })) },
          { label: 'Kaba Motor', children: (result.grossMotor || []).map((m) => ({ label: m })) },
        ],
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Motor beceri gelişimi, öğrencinin akademik başarısını doğrudan etkiler. Disleksi desteğine ihtiyacı olan öğrenciler için çok duyulu motor aktiviteler önerilmelidir.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Motor koordinasyon', 'El-göz koordinasyonu'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MotorSkills_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  return {
    title: `${params.topic} - Motor Beceriler`,
    content: {
      hierarchy: {
        label: 'Motor Beceriler',
        children: [
          {
            label: 'İnce Motor',
            children: [
              { label: 'Kalem tutma' },
              { label: 'Makas kullanma' },
              { label: 'Boncuk dizme' },
            ],
          },
          {
            label: 'Kaba Motor',
            children: [{ label: 'Top atma' }, { label: 'Denge yürüyüşü' }, { label: 'Zıplama' }],
          },
        ],
      },
    },
    pedagogicalNote:
      'Motor beceri gelişimi, öğrencinin akademik başarısını doğrudan etkiler. Özellikle yazma becerisi ince motor gelişimine bağlıdır. Disleksi desteğine ihtiyacı olan öğrenciler için çok duyulu motor aktiviteler ve büyük kas hareketleri önerilmelidir.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
      columnCount: 2,
    },
    targetSkills: ['Motor koordinasyon', 'El-göz koordinasyonu'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MOTOR_SKILLS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MOTOR_SKILLS,
  aiGenerator: generateInfographic_MotorSkills_AI,
  offlineGenerator: generateInfographic_MotorSkills_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'skillType',
        type: 'enum',
        label: 'Beceri Tipi',
        defaultValue: 'both',
        options: ['fine', 'gross', 'both'],
        description: 'Hangi motor beceriler odaklanılsın?',
      },
      {
        name: 'activityCount',
        type: 'number',
        label: 'Etkinlik Sayısı',
        defaultValue: 5,
        description: 'Kaç motor aktivite önerilsin?',
      },
    ],
  },
};
