import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type RoutineBuilderAIResult = {
  title: string;
  routine: { time: string; activity: string; icon: string }[];
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

export async function generateInfographic_ROUTINE_BUILDER_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'RUTİN OLUŞTURUCU',
    params,
    '1. Günlük rutin akışı oluştur\n2. Her zaman dilimi için aktivite ve ikon belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      routine: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            time: { type: 'STRING' },
            activity: { type: 'STRING' },
            icon: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as RoutineBuilderAIResult;
  return {
    title: result.title || `${params.topic} - Rutin Oluşturucu`,
    content: {
      steps: (result.routine || []).map((r, i) => ({
        stepNumber: i + 1,
        label: `${r.icon || '⏰'} ${r.time}: ${r.activity}`,
        description: r.activity,
        isCheckpoint: i % 3 === 2,
        scaffoldHint: `Saat: ${r.time}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Rutin takibi', 'Zaman yönetimi', 'Bağımsızlık', 'Geçiş becerisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_ROUTINE_BUILDER_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const routine = [
    { time: '07:00', activity: 'Uyan ve hazırlan', icon: '🌅' },
    { time: '08:00', activity: 'Kahvaltı', icon: '🍳' },
    { time: '09:00', activity: 'Çalışma zamanı', icon: '📚' },
    { time: '10:30', activity: 'Mola ve hareket', icon: '🏃' },
    { time: '11:00', activity: 'Çalışma zamanı', icon: '📝' },
    { time: '12:00', activity: 'Öğle yemeği', icon: '🍽️' },
    { time: '13:00', activity: 'Dinlenme', icon: '😌' },
    { time: '14:00', activity: 'Çalışma zamanı', icon: '📖' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Rutin oluşturucu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri çalışma rutinlerini yapılandırmada yardımcı olur. Günlük fen gözlemi ve deney rutini oluşturmak, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel düşünce becerilerini düzenli olarak geliştirmelerini sağlar. Görsel rutin çizelgeleri, disleksi desteğine ihtiyacı olan öğrencilerin fen çalışma zamanlarını takip etmelerini kolaylaştırır.',
    math: 'Rutin oluşturucu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük matematik pratiği rutinlerini planlamada rehberlik eder. Her gün belirli bir saatte matematik çalışmak, disleksi desteğine ihtiyacı olan öğrencilerin sayısal becerilerini kademeli olarak geliştirmelerini sağlar. Tutarlı matematik rutini, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltır.',
    language:
      'Rutin oluşturucu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük okuma ve yazma rutinlerini yapılandırmada temel bir araçtır. Her gün düzenli okuma saati belirlemek, disleksi desteğine ihtiyacı olan öğrencilerin okuma akıcılığını kademeli olarak artırır. Görsel okuma rutini çizelgeleri, disleksi desteğine ihtiyacı olan öğrencilerin okuma alışkanlığı kazanmalarını destekler.',
    social:
      'Rutin oluşturucu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler çalışma rutinlerini organize etmede yapılandırılmış destek sunar. Günlük haber okuma veya tarih araştırma rutini oluşturmak, disleksi desteğine ihtiyacı olan öğrencilerin sosyal bilimler farkındalıklarını düzenli olarak geliştirmelerini sağlar.',
    general:
      'Rutin oluşturucu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük yaşam yapılarını görsel olarak planlamada kritik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, belirsizlik ve öngörülemezlik karşısında artan kaygı yaşarlar. Görsel rutin çizelgeleri, disleksi desteğine ihtiyacı olan öğrencilerin gün içinde ne olacağını önceden görmelerini ve buna hazırlanmalarını sağlar. Tutarlı rutinler, disleksi desteğine ihtiyacı olan öğrencilerin yürütücü işlev becerilerini destekler ve bağımsızlık kazanmalarını kolaylaştırır. Her rutin geçişinin görsel olarak işaretlenmesi, disleksi desteğine ihtiyacı olan öğrencilerin zaman yönetimi becerilerini geliştirir.',
  };

  return {
    title: `${params.topic} - Rutin Oluşturucu`,
    content: {
      steps: routine.map((r, i) => ({
        stepNumber: i + 1,
        label: `${r.icon} ${r.time}: ${r.activity}`,
        description: r.activity,
        isCheckpoint: i % 3 === 2,
        scaffoldHint: `Saat: ${r.time}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Rutin takibi', 'Zaman yönetimi', 'Bağımsızlık', 'Geçiş becerisi'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_ROUTINE_BUILDER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_ROUTINE_BUILDER,
  aiGenerator: generateInfographic_ROUTINE_BUILDER_AI,
  offlineGenerator: generateInfographic_ROUTINE_BUILDER_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'routineType',
        type: 'enum',
        label: 'Rutin Türü',
        defaultValue: 'gunluk',
        options: ['gunluk', 'haftalik', 'sabah', 'aksam'],
        description: 'Hangi tür rutin oluşturulsun?',
      },
      {
        name: 'showIcons',
        type: 'boolean',
        label: 'İkonları Göster',
        defaultValue: true,
        description: 'Her aktivite için ikon gösterilsin mi?',
      },
    ],
  },
};
