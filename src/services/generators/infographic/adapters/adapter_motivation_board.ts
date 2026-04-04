import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type MotivationBoardAIResult = {
  title: string;
  achievements: { name: string; description: string; icon: string; level: number }[];
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

export async function generateInfographic_MOTIVATION_BOARD_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'MOTİVASYON PANOSU',
    params,
    '1. Başarı rozetleri ve motivasyon öğeleri oluştur\n2. Her öğe için seviye ve açıklama belirt\n3. Pedagojik not: Disleksi desteğine ihtiyacı olan öğrenciler için motivasyon stratejileri (min 100 kelime)'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      achievements: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            description: { type: 'STRING' },
            icon: { type: 'STRING' },
            level: { type: 'NUMBER' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as MotivationBoardAIResult;
  return {
    title: result.title || `${params.topic} - Motivasyon Panosu`,
    content: {
      steps: (result.achievements || []).map((a, i) => ({
        stepNumber: i + 1,
        label: `${a.icon || '⭐'} ${a.name}`,
        description: a.description,
        isCheckpoint: a.level >= 3,
        scaffoldHint: `Seviye: ${a.level}`,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için içsel motivasyonu beslemede güçlü bir görsel araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, geleneksel değerlendirme sistemlerinde sıklıkla başarısızlık deneyimi yaşarlar ve bu durum motivasyonlarını olumsuz etkiler. Görsel başarı rozetleri ve kademeli ödül sistemi, disleksi desteğine ihtiyacı olan öğrencilerin küçük ilerlemelerini bile görünür kılar. Her başarı rozeti, disleksi desteğine ihtiyacı olan öğrencilerin öz yeterlik algısını güçlendirir ve öğrenmeye devam etme isteklerini artırır. Bu yaklaşım, dışsal motivasyondan içsel motivasyona geçişi destekler.',
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Motivasyon', 'Hedef takibi', 'Öz yeterlik', 'Başarı farkındalığı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_MOTIVATION_BOARD_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const achievements = [
    { name: 'İlk Adım', description: 'Konuya ilk kez başladın', icon: '🌟', level: 1 },
    { name: 'İlerleme Ustası', description: 'Konunun yarısını tamamladın', icon: '📈', level: 2 },
    { name: 'Bilgi Kaşifi', description: 'Yeni bir kavram öğrendin', icon: '🔍', level: 3 },
    { name: 'Tamamlayıcı', description: 'Konuyu başarıyla bitirdin', icon: '🏆', level: 4 },
    { name: 'Öğretmen', description: 'Başkasına anlatabilirsin', icon: '👑', level: 5 },
  ];

  const categoryDescriptions: Record<string, string> = {
    science:
      'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için fen bilimleri keşif sürecinde motivasyonu yüksek tutmada etkili bir araçtır. Bilimsel keşif aşamalarını rozetlerle ödüllendirmek, disleksi desteğine ihtiyacı olan öğrencilerin merak duygusunu besler. Her yeni deney veya gözlem başarı rozeti, disleksi desteğine ihtiyacı olan öğrencilerin bilimsel düşünce becerilerini geliştirmeye devam etme motivasyonunu artırır.',
    math: 'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için matematik öğrenme sürecinde başarı deneyimlerini görünür kılar. Matematik problemlerini çözme aşamalarını rozetlerle işaretlemek, disleksi desteğine ihtiyacı olan öğrencilerin matematik özgüvenini kademeli olarak artırır. Her başarılı matematik adımı, disleksi desteğine ihtiyacı olan öğrencilerin matematik kaygısını azaltmaya yardımcı olur.',
    language:
      'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için okuma ve yazma gelişim aşamalarını kutlamada görsel bir araç sunar. Her okunan kitap veya yazılan metin için başarı rozeti kazanmak, disleksi desteğine ihtiyacı olan öğrencilerin dil becerilerini geliştirmeye olan isteklerini artırır. Bu görsel ödül sistemi, disleksi desteğine ihtiyacı olan öğrencilerin okuma motivasyonunu sürdürmelerine yardımcı olur.',
    social:
      'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için sosyal bilgiler öğrenme sürecinde katılım ve başarıyı ödüllendirmede kullanılır. Toplumsal projelerde alınan sorumlulukları rozetlerle işaretlemek, disleksi desteğine ihtiyacı olan öğrencilerin vatandaşlık bilincini ve sosyal sorumluluk duygusunu geliştirir.',
    general:
      'Motivasyon panosu infografiği, disleksi desteğine ihtiyacı olan öğrenciler için içsel motivasyonu beslemede güçlü bir görsel araçtır. Disleksi desteğine ihtiyacı olan öğrenciler, geleneksel değerlendirme sistemlerinde sıklıkla başarısızlık deneyimi yaşarlar ve bu durum motivasyonlarını olumsuz etkiler. Görsel başarı rozetleri ve kademeli ödül sistemi, disleksi desteğine ihtiyacı olan öğrencilerin küçük ilerlemelerini bile görünür kılar. Her başarı rozeti, disleksi desteğine ihtiyacı olan öğrencilerin öz yeterlik algısını güçlendirir ve öğrenmeye devam etme isteklerini artırır. Bu yaklaşım, dışsal motivasyondan içsel motivasyona geçişi destekler.',
  };

  return {
    title: `${params.topic} - Motivasyon Panosu`,
    content: {
      steps: achievements.map((a, i) => ({
        stepNumber: i + 1,
        label: `${a.icon} ${a.name}`,
        description: a.description,
        isCheckpoint: a.level >= 3,
        scaffoldHint: `Seviye: ${a.level}`,
      })),
    },
    pedagogicalNote: categoryDescriptions[category],
    layoutHints: {
      orientation: 'portrait',
      fontSize: 14,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Motivasyon', 'Hedef takibi', 'Öz yeterlik', 'Başarı farkındalığı'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_MOTIVATION_BOARD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_MOTIVATION_BOARD,
  aiGenerator: generateInfographic_MOTIVATION_BOARD_AI,
  offlineGenerator: generateInfographic_MOTIVATION_BOARD_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'badgeCount',
        type: 'number',
        label: 'Rozet Sayısı',
        defaultValue: 5,
        description: 'Kaç başarı rozeti gösterilsin?',
      },
      {
        name: 'showIcons',
        type: 'boolean',
        label: 'İkonları Göster',
        defaultValue: true,
        description: 'Her rozet için ikon gösterilsin mi?',
      },
    ],
  },
};
