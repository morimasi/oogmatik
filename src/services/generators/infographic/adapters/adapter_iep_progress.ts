import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type IepProgressAIResult = {
  title: string;
  progress: { domain: string; current: number; target: number; status: string }[];
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

export async function generateInfographic_IEP_PROGRESS_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'BEP İLERLEME',
    params,
    '1. BEP ilerleme verilerini oluştur\n2. Her alan için mevcut seviye, hedef seviye ve durum belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için BEP ilerleme takip stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      progress: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            domain: { type: 'STRING' },
            current: { type: 'NUMBER' },
            target: { type: 'NUMBER' },
            status: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as IepProgressAIResult;
  return {
    title: result.title || `${params.topic} - BEP İlerleme`,
    content: {
      radarData: (result.progress || []).map((p) => ({
        skill: p.domain,
        currentLevel: Math.min(10, Math.max(1, p.current)),
        targetLevel: Math.min(10, Math.max(1, p.target)),
        color: p.current >= p.target ? '#4CAF50' : '#FFC107',
      })),
      steps: (result.progress || []).map((p, i) => ({
        stepNumber: i + 1,
        label: `${p.domain}: ${p.current}/${p.target}`,
        description: `Durum: ${p.status}`,
        isCheckpoint: p.current >= p.target,
        scaffoldHint: `Hedef: ${p.target}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bireyselleştirilmiş eğitim planı hedeflerine ulaşma düzeylerini görsel olarak izleme ve raporlama aracıdır. Disleksi desteğine ihtiyacı olan öğrencilerin öğrenme süreçlerinde katedilen mesafe, geleneksel değerlendirme araçlarıyla tam olarak yansıtılamayabilir. Radar grafikleri ve ilerleme çubukları, disleksi desteğine ihtiyacı olan öğrencilerin her alandaki gelişimini somut ve görsel olarak gösterir. Düzenli ilerleme raporları, disleksi desteğine ihtiyacı olan öğrencilerin eğitim planında gerekli düzenlemelerin zamanında yapılmasını sağlar ve veli-öğretmen iş birliğini güçlendirir.',
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['İlerleme takibi', 'Veri analizi', 'BEP değerlendirme', 'Raporlama'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_IEP_PROGRESS_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const progress = [
    { domain: 'Okuma', current: 4, target: 8, status: 'Devam ediyor' },
    { domain: 'Yazma', current: 3, target: 7, status: 'Devam ediyor' },
    { domain: 'Matematik', current: 5, target: 8, status: 'İyi ilerliyor' },
    { domain: 'Sosyal Beceri', current: 6, target: 8, status: 'Hedefe yakın' },
    { domain: 'Dikkat', current: 3, target: 7, status: 'Destek gerekli' },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri öğrenme hedeflerine ulaşma düzeylerini görsel olarak izlemede yardımcı olur. Fen bilimleri BEP ilerleme verileri, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel kavramları anlama düzeylerini takip etmelerini sağlar.',
    math: 'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme hedeflerine ulaşma düzeylerini görsel olarak izlemede rehberlik eder. Matematik BEP ilerleme verileri, disleksi desteğine ihtiyacı olan öğrencilerin sayısal becerilerdeki gelişimini somut olarak gösterir.',
    language:
      'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma hedeflerine ulaşma düzeylerini görsel olarak izlemede temel bir araçtır. Dil becerileri BEP ilerleme verileri, disleksi desteğine ihtiyacı olan öğrencilerin okuma akıcılığı ve yazma becerilerindeki gelişimini takip etmelerini sağlar.',
    social:
      'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal beceri hedeflerine ulaşma düzeylerini görsel olarak izlemede destek sağlar. Sosyal BEP ilerleme verileri, disleksi desteğine ihtiyacı olan öğrencilerin sosyal etkileşim ve iletişim becerilerindeki gelişimini gösterir.',
    general:
      'BEP ilerleme infografiği, disleksi desteğine ihtiyacı olan öğrenciler için bireyselleştirilmiş eğitim planı hedeflerine ulaşma düzeylerini görsel olarak izleme ve raporlama aracıdır. Disleksi desteğine ihtiyacı olan öğrencilerin öğrenme süreçlerinde katedilen mesafe, geleneksel değerlendirme araçlarıyla tam olarak yansıtılamayabilir. Radar grafikleri ve ilerleme çubukları, disleksi desteğine ihtiyacı olan öğrencilerin her alandaki gelişimini somut ve görsel olarak gösterir. Düzenli ilerleme raporları, disleksi desteğine ihtiyacı olan öğrencilerin eğitim planında gerekli düzenlemelerin zamanında yapılmasını sağlar ve veli-öğretmen iş birliğini güçlendirir.',
  };

  return {
    title: `${params.topic} - BEP İlerleme`,
    content: {
      radarData: progress.map((p) => ({
        skill: p.domain,
        currentLevel: p.current,
        targetLevel: p.target,
        color: p.current >= p.target ? '#4CAF50' : '#FFC107',
      })),
      steps: progress.map((p, i) => ({
        stepNumber: i + 1,
        label: `${p.domain}: ${p.current}/${p.target}`,
        description: `Durum: ${p.status}`,
        isCheckpoint: p.current >= p.target,
        scaffoldHint: `Hedef: ${p.target}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'landscape',
      fontSize: 13,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['İlerleme takibi', 'Veri analizi', 'BEP değerlendirme', 'Raporlama'],
    estimatedDuration: 25,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_IEP_PROGRESS: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_IEP_PROGRESS,
  aiGenerator: generateInfographic_IEP_PROGRESS_AI,
  offlineGenerator: generateInfographic_IEP_PROGRESS_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'reviewDate',
        type: 'string',
        label: 'Gözden Geçirme Tarihi',
        defaultValue: '2026-06-01',
        description: 'Bir sonraki BEP gözden geçirme tarihi',
      },
      {
        name: 'showRadar',
        type: 'boolean',
        label: 'Radar Grafik Göster',
        defaultValue: true,
        description: 'Radar grafik görünümü gösterilsin mi?',
      },
    ],
  },
};
