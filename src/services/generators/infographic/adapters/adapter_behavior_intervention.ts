import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type BehaviorInterventionAIResult = {
  title: string;
  interventions: {
    behavior: string;
    antecedent: string;
    intervention: string;
    reinforcement: string;
  }[];
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

export async function generateInfographic_BEHAVIOR_INTERVENTION_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'DAVRANIŞ MÜDAHALE',
    params,
    '1. Davranış müdahale planını oluştur\n2. Her davranış için öncül, müdahale ve pekiştireç belirt'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      interventions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            behavior: { type: 'STRING' },
            antecedent: { type: 'STRING' },
            intervention: { type: 'STRING' },
            reinforcement: { type: 'STRING' },
          },
        },
      },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as BehaviorInterventionAIResult;
  return {
    title: result.title || `${params.topic} - Davranış Müdahale`,
    content: {
      steps: (result.interventions || []).map((item, i) => ({
        stepNumber: i + 1,
        label: item.behavior,
        description: `Öncül: ${item.antecedent}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Müdahale: ${item.intervention} | Pekiştireç: ${item.reinforcement}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Davranış analizi', 'Müdahale planlama', 'Pekiştirme', 'Önleyici strateji'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_BEHAVIOR_INTERVENTION_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const interventions = [
    {
      behavior: 'Görevden kaçma',
      antecedent: 'Zor ödev verildiğinde',
      intervention: 'Görevi parçalara böl',
      reinforcement: 'Her parça sonrası övgü',
    },
    {
      behavior: 'Sınıfı dağıtma',
      antecedent: 'Uzun süre oturduğunda',
      intervention: 'Hareket molası ver',
      reinforcement: 'Mola sonrası katılım',
    },
    {
      behavior: 'İçe kapanma',
      antecedent: 'Sesli okuma istendiğinde',
      intervention: 'Önce sessiz okuma',
      reinforcement: 'Küçük grupta okuma',
    },
    {
      behavior: 'Dürtüsellik',
      antecedent: 'Soru sorulduğunda',
      intervention: 'Dur-düşün-cevap stratejisi',
      reinforcement: 'Doğru yanıt sonrası onay',
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Davranış müdahale infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri dersinde deney güvenliği ve laboratuvar kurallarına uyma davranışlarını desteklemede yardımcı olur. Deney sırasında dikkat dağıtıcı davranışları önleyici stratejilerle yönetmek, disleksi desteğine ihtiyacı olan öğrencilerin fen öğrenme süreçlerini güvenli ve verimli hale getirir.',
    math: 'Davranış müdahale infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik dersinde görevden kaçma ve matematik kaygısı kaynaklı davranışları yönetmede rehberlik eder. Matematik zorluğu yaşayan disleksi desteğine ihtiyacı olan öğrenciler için olumlu davranış desteği stratejileri, matematik öğrenme deneyimini iyileştirir.',
    language:
      'Davranış müdahale infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma görevlerinde yaşanan kaçınma ve içe kapanma davranışlarını yönetmede kritik bir araçtır. Sesli okuma kaygısı yaşayan disleksi desteğine ihtiyacı olan öğrenciler için kademeli maruz bırakma ve olumlu pekiştirme stratejileri, okuma davranışlarını olumlu yönde değiştirir.',
    social:
      'Davranış müdahale infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal etkileşim sırasında ortaya çıkan davranışları yönetmede yapılandırılmış destek sunar. Grup çalışmalarında dürtüsel veya içe dönük davranışları önleyici stratejilerle ele almak, disleksi desteğine ihtiyacı olan öğrencilerin sosyal katılımını artırır.',
    general:
      'Davranış müdahale infografiği, disleksi desteğine ihtiyacı olan öğrenciler için zorlayıcı davranışları azaltma ve olumlu davranışları artırma stratejilerini yapılandırılmış şekilde sunan klinik bir araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, akademik başarısızlık deneyimleri nedeniyle kaçınma, içe kapanma veya dikkat dağıtıcı davranışlar sergileyebilirler. ABC modeli ile yapılandırılmış müdahale planları, disleksi desteğine ihtiyacı olan öğrencilerin davranış işlevlerini anlamaya ve uygun müdahale stratejileri geliştirmeye yardımcı olur. Olumlu davranış desteği yaklaşımı, disleksi desteğine ihtiyacı olan öğrencilerin öz düzenleme becerilerini güçlendirir.',
  };

  return {
    title: `${params.topic} - Davranış Müdahale`,
    content: {
      steps: interventions.map((item, i) => ({
        stepNumber: i + 1,
        label: item.behavior,
        description: `Öncül: ${item.antecedent}`,
        isCheckpoint: i % 2 === 1,
        scaffoldHint: `Müdahale: ${item.intervention} | Pekiştireç: ${item.reinforcement}`,
      })),
    },
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Davranış analizi', 'Müdahale planlama', 'Pekiştirme', 'Önleyici strateji'],
    estimatedDuration: 30,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_BEHAVIOR_INTERVENTION: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_BEHAVIOR_INTERVENTION,
  aiGenerator: generateInfographic_BEHAVIOR_INTERVENTION_AI,
  offlineGenerator: generateInfographic_BEHAVIOR_INTERVENTION_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'interventionModel',
        type: 'enum',
        label: 'Müdahale Modeli',
        defaultValue: 'abc',
        options: ['abc', 'pbis', 'cbt'],
        description: 'Hangi müdahale modeli kullanılsın?',
      },
      {
        name: 'showAntecedents',
        type: 'boolean',
        label: 'Öncülleri Göster',
        defaultValue: true,
        description: 'Davranış öncülleri (tetikleyiciler) gösterilsin mi?',
      },
    ],
  },
};
