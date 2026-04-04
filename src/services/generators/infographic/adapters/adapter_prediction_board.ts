import { ActivityType } from '../../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
} from '../../../../types/infographic';
import { generateWithSchema } from '../../../geminiClient';

type PredictionBoardAIResult = {
  title: string;
  predictions: { clue: string; prediction: string; reasoning: string }[];
  pedagogicalNote: string;
};

function detectCategory(topic: string): 'science' | 'math' | 'language' | 'social' | 'general' {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('fen') || lowerTopic.includes('bilim') || lowerTopic.includes('doğa'))
    return 'science';
  if (lowerTopic.includes('sayı') || lowerTopic.includes('matematik')) return 'math';
  if (lowerTopic.includes('hikaye') || lowerTopic.includes('şiir') || lowerTopic.includes('dil'))
    return 'language';
  if (lowerTopic.includes('tarih') || lowerTopic.includes('coğrafya')) return 'social';
  return 'general';
}

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

export async function generateInfographic_PredictionBoard_AI(
  params: UltraCustomizationParams
): Promise<InfographicGeneratorResult> {
  const prompt = buildAIPrompt(
    'TAHMİN PANOSU',
    params,
    '1. Konuya uygun 4 tahmin senaryosu oluştur\n2. Her senaryo için ipucu, tahmin ve gerekçe yaz\n3. Pedagojik not: Tahmin becerisinin okuma öncesi hazırlığa katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu'
  );
  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      predictions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            clue: { type: 'STRING' },
            prediction: { type: 'STRING' },
            reasoning: { type: 'STRING' },
          },
        },
      },
      pedagogicalNote: { type: 'STRING' },
    },
  };
  const result = (await generateWithSchema(prompt, schema)) as PredictionBoardAIResult;
  return {
    title: result.title || `${params.topic} - Tahmin Panosu`,
    content: {
      steps: (result.predictions || []).map((p, i) => ({
        stepNumber: i + 1,
        label: `İpucu: ${p.clue}`,
        description: `Tahmin: ${p.prediction} — Gerekçe: ${p.reasoning}`,
        isCheckpoint: false,
      })),
    },
    pedagogicalNote:
      result.pedagogicalNote ||
      'Tahmin panosu, disleksi desteğine ihtiyacı olan öğrenciler için okuma öncesi tahmin yapma becerisini geliştirir. İpuçlarından yola çıkarak metin hakkında öngörüde bulunmak, ön bilgileri aktive eder ve okuma motivasyonunu artırır. Bu strateji, öğrencilerin metne aktif katılımını sağlar ve anlama derinliğini güçlendirir.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tahmin becerisi', 'Ön bilgi aktivasyonu'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export function generateInfographic_PredictionBoard_Offline(
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const category = detectCategory(params.topic);
  const predictionsMap: Record<string, { clue: string; prediction: string; reasoning: string }[]> =
    {
      science: [
        {
          clue: 'Gökyüzü kararlıyor, rüzgar esiyor',
          prediction: 'Yağmur yağacak',
          reasoning: 'Bulutlar biriktiğinde yağmur yağar',
        },
        {
          clue: 'Buzdolabından çıkarılan su damlıyor',
          prediction: 'Buz eriyor',
          reasoning: 'Sıcak ortamda buz erir',
        },
        {
          clue: 'Tohum toprağa ekildi, su verildi',
          prediction: 'Bitki büyüyecek',
          reasoning: 'Tohum uygun koşullarda filizlenir',
        },
        {
          clue: 'Güneş doğudan doğuyor',
          prediction: 'Gündüz olacak',
          reasoning: 'Güneş doğunca aydınlık olur',
        },
      ],
      math: [
        {
          clue: '5 elma var, 3 elma daha eklendi',
          prediction: '8 elma olacak',
          reasoning: '5 + 3 = 8',
        },
        {
          clue: '10 şeker var, 4 tanesi yendi',
          prediction: '6 şeker kaldı',
          reasoning: '10 - 4 = 6',
        },
        {
          clue: 'Her kutuda 3 kalem, 4 kutu var',
          prediction: '12 kalem var',
          reasoning: '3 × 4 = 12',
        },
        {
          clue: '20 bilye 4 kişiye eşit paylaşılacak',
          prediction: 'Herkes 5 bilye alır',
          reasoning: '20 ÷ 4 = 5',
        },
      ],
      language: [
        {
          clue: 'Bir varmış bir yokmuş...',
          prediction: 'Masal başlayacak',
          reasoning: 'Bu ifade masalların başlangıç cümlesidir',
        },
        {
          clue: 'Kapakta ejderha resmi var',
          prediction: 'Fantastik hikaye',
          reasoning: 'Ejderha resmi hayal ürünü bir konuyu işaret eder',
        },
        {
          clue: 'Başlık: "Ormanda Kaybolan Çocuk"',
          prediction: 'Macera hikayesi',
          reasoning: 'Başlık macera ve gerilim içeriyor',
        },
        {
          clue: 'İlk sayfada "Bir gün..." yazıyor',
          prediction: 'Geçmiş zamanda anlatım',
          reasoning: 'Bu ifade geçmiş zaman hikayelerinde kullanılır',
        },
      ],
      social: [
        {
          clue: 'Haritada denize yakın bir yer işaretli',
          prediction: 'Balıkçılık yapılır',
          reasoning: 'Deniz kenarında balıkçılık yaygındır',
        },
        {
          clue: 'Fotoğrafta insanlar bayrak taşıyor',
          prediction: 'Milli bayram kutlaması',
          reasoning: 'Bayrak taşımak milli duyguları ifade eder',
        },
        {
          clue: 'Eski bir harita gösteriliyor',
          prediction: 'Tarihi yer keşfi',
          reasoning: 'Eski haritalar tarihi mekanları gösterir',
        },
        {
          clue: 'İnsanlar birlikte çalışıyor',
          prediction: 'Dayanışma örneği',
          reasoning: 'Birlikte çalışma toplumsal dayanışmadır',
        },
      ],
      general: [
        {
          clue: 'Bir varmış bir yokmuş...',
          prediction: 'Masal başlayacak',
          reasoning: 'Bu ifade masalların başlangıç cümlesidir',
        },
        {
          clue: 'Kapakta ejderha resmi var',
          prediction: 'Fantastik hikaye',
          reasoning: 'Ejderha resmi hayal ürünü bir konuyu işaret eder',
        },
        {
          clue: 'Başlık: "Ormanda Kaybolan Çocuk"',
          prediction: 'Macera hikayesi',
          reasoning: 'Başlık macera ve gerilim içeriyor',
        },
        {
          clue: 'İlk sayfada "Bir gün..." yazıyor',
          prediction: 'Geçmiş zamanda anlatım',
          reasoning: 'Bu ifade geçmiş zaman hikayelerinde kullanılır',
        },
      ],
    };
  const predictions = predictionsMap[category] || predictionsMap.general;
  return {
    title: `${params.topic} - Tahmin Panosu`,
    content: {
      steps: predictions.map((p, i) => ({
        stepNumber: i + 1,
        label: `İpucu: ${p.clue}`,
        description: `Tahmin: ${p.prediction} — Gerekçe: ${p.reasoning}`,
        isCheckpoint: false,
      })),
    },
    pedagogicalNote:
      'Tahmin panosu, disleksi desteğine ihtiyacı olan öğrenciler için okuma öncesi tahmin yapma becerisini geliştirir. İpuçlarından yola çıkarak metin hakkında öngörüde bulunmak, ön bilgileri aktive eder ve okuma motivasyonunu artırır. Bu strateji, öğrencilerin metne aktif katılımını sağlar ve anlama derinliğini güçlendirir. Tahmin stratejisi, DEHB profili olan öğrenciler için özellikle faydalıdır çünkü dikkatlerini metne odaklar.',
    layoutHints: {
      orientation: 'grid',
      fontSize: 11,
      colorScheme: 'dyslexia-friendly',
    },
    targetSkills: ['Tahmin becerisi', 'Ön bilgi aktivasyonu'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

export const INFOGRAPHIC_PREDICTION_BOARD: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_PREDICTION_BOARD,
  aiGenerator: generateInfographic_PredictionBoard_AI,
  offlineGenerator: generateInfographic_PredictionBoard_Offline,
  customizationSchema: {
    parameters: [
      {
        name: 'predictionCount',
        type: 'number',
        label: 'Tahmin Sayısı',
        defaultValue: 4,
        description: 'Kaç tahmin senaryosu gösterilsin?',
      },
      {
        name: 'showReasoning',
        type: 'boolean',
        label: 'Gerekçe Göster',
        defaultValue: true,
        description: 'Her tahminin gerekçesi gösterilsin mi?',
      },
    ],
  },
};
