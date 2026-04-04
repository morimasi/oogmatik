import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type TimeManagementAIResult = {
  title: string;
  timeBlocks: { name: string; duration: string; priority: string; tasks: string[] }[];
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

export async function generateInfographic_TIME_MANAGEMENT_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'ZAMAN YÖNETİMİ',
    params,
    '1. Zaman bloklarını öncelik sırasına göre düzenle\n2. Her blok için süre, öncelik ve görevleri belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için zaman yönetimi stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      timeBlocks: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            duration: { type: 'STRING' },
            priority: { type: 'STRING' },
            tasks: { type: 'ARRAY', items: { type: 'STRING' } },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as TimeManagementAIResult;
  return {
    title: result.title || `${params.topic} - Zaman Yönetimi`,
    content: {
      steps: (result.timeBlocks || []).flatMap((block, bi) =>
        (block.tasks || []).map((task, ti) => ({
          stepNumber: bi * 10 + ti + 1,
          label: `${block.name}: ${task}`,
          description: task,
          isCheckpoint: ti === (block.tasks || []).length - 1,
          scaffoldHint: `Süre: ${block.duration} | Öncelik: ${block.priority}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Zaman Bloklama',
        steps: (result.timeBlocks || []).map((b) => b.name),
        useWhen: 'Çalışma planı oluştururken',
        benefits: (result.timeBlocks || []).map((b) => `${b.name}: ${b.duration}`),
      },
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük rutinlerini yapılandırmada hayati öneme sahiptir. Disleksi desteğine ihtiyacı olan öğrenciler genellikle zaman algılama güçlüğü yaşarlar ve görsel zaman blokları, soyut zaman kavramını somutlaştırır. Pomodoro tekniği gibi yapılandırılmış zaman dilimleri, disleksi desteğine ihtiyacı olan öğrencilerin dikkat sürelerini optimize etmelerine yardımcı olur. Renk kodlu zaman blokları, öncelikleri görsel olarak ayırt etmeyi kolaylaştırır ve disleksi desteğine ihtiyacı olan öğrencilerin görevleri zaman içinde planlama becerilerini geliştirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Zaman planlama', 'Öncelik belirleme', 'Görev yönetimi', 'Odaklanma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_TIME_MANAGEMENT_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const timeBlocks = [
    {
      name: 'Sabah Çalışması',
      duration: '30 dakika',
      priority: 'Yüksek',
      tasks: ['Günün planını yap', 'En zor göreve başla', 'Kısa mola ver'],
    },
    {
      name: 'Öğle Tekrarı',
      duration: '20 dakika',
      priority: 'Orta',
      tasks: ['Sabah konusunu tekrar et', 'Notları gözden geçir', 'Soruları işaretle'],
    },
    {
      name: 'Akış Uygulaması',
      duration: '25 dakika',
      priority: 'Yüksek',
      tasks: ['Yeni konuya geç', 'Alıştırma yap', 'Sonuçları kontrol et'],
    },
    {
      name: 'Gün Sonu Değerlendirme',
      duration: '15 dakika',
      priority: 'Düşük',
      tasks: ['Günü değerlendir', 'Yarının planını yap', 'Başarıları not et'],
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri deney ve gözlem süreçlerini planlamada kritik bir araçtır. Deney aşamalarını zaman bloklarına bölmek, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel süreçleri takip etmelerini kolaylaştırır. Görsel zaman çizelgeleri, disleksi desteğine ihtiyacı olan öğrencilerin deney sürelerini doğru yönetmelerine ve gözlem sonuçlarını zaman içinde kaydetmelerine yardımcı olur.',
    math: 'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik problem çözme süreçlerini yapılandırmada etkilidir. Matematik çalışmalarını zaman bloklarına ayırmak, disleksi desteğine ihtiyacı olan öğrencilerin dikkatlerini korumalarını ve her blokta belirli bir beceriye odaklanmalarını sağlar. Zaman sınırlı alıştırmalar, disleksi desteğine ihtiyacı olan öğrencilerin işlem hızını kademeli olarak artırır.',
    language:
      'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma çalışmalarını planlamada yapılandırılmış bir yaklaşım sunar. Okuma seanslarını kısa zaman bloklarına bölmek, disleksi desteğine ihtiyacı olan öğrencilerin okuma dayanıklılığını artırır ve yazma görevlerini yönetilebilir parçalara ayırır.',
    social:
      'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler araştırma ve proje süreçlerini organize etmede rehberlik eder. Araştırma adımlarını zaman bloklarına dağıtmak, disleksi desteğine ihtiyacı olan öğrencilerin büyük projeleri yönetilebilir parçalara bölme becerilerini geliştirir.',
    general:
      'Zaman yönetimi infografiği, disleksi desteğine ihtiyacı olan öğrenciler için günlük rutinlerini yapılandırmada hayati öneme sahiptir. Disleksi desteğine ihtiyacı olan öğrenciler genellikle zaman algılama güçlüğü yaşarlar ve görsel zaman blokları, soyut zaman kavramını somutlaştırır. Pomodoro tekniği gibi yapılandırılmış zaman dilimleri, disleksi desteğine ihtiyacı olan öğrencilerin dikkat sürelerini optimize etmelerine yardımcı olur. Renk kodlu zaman blokları, öncelikleri görsel olarak ayırt etmeyi kolaylaştırır ve disleksi desteğine ihtiyacı olan öğrencilerin görevleri zaman içinde planlama becerilerini geliştirir.',
  };

  return {
    title: `${params.topic} - Zaman Yönetimi`,
    content: {
      steps: timeBlocks.flatMap((block, bi) =>
        block.tasks.map((task, ti) => ({
          stepNumber: bi * 10 + ti + 1,
          label: `${block.name}: ${task}`,
          description: task,
          isCheckpoint: ti === block.tasks.length - 1,
          scaffoldHint: `Süre: ${block.duration} | Öncelik: ${block.priority}`,
        }))
      ),
      strategicContent: {
        strategyName: 'Zaman Bloklama',
        steps: timeBlocks.map((b) => b.name),
        useWhen: 'Çalışma planı oluştururken',
        benefits: timeBlocks.map((b) => `${b.name}: ${b.duration}`),
      },
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Zaman planlama', 'Öncelik belirleme', 'Görev yönetimi', 'Odaklanma'],
    estimatedDuration: 20,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_TIME_MANAGEMENT: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_TIME_MANAGEMENT,
  aiGenerator: generateInfographic_TIME_MANAGEMENT_AI,
  offlineGenerator: generateInfographic_TIME_MANAGEMENT_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'blockCount',
        type: 'number',
        label: 'Zaman Blok Sayısı',
        defaultValue: 4,
        description: 'Günde kaç zaman bloku olsun?',
      },
      {
        name: 'breakDuration',
        type: 'number',
        label: 'Mola Süresi (dakika)',
        defaultValue: 5,
        description: 'Her blok arasındaki mola süresi',
      },
    ],
  },
};
