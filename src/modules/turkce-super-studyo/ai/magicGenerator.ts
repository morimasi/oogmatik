import { generateCreativeMultimodal } from '../../../../services/geminiClient';
import { Question, TextPassage } from '../types/schemas';

interface GenerateOptions {
  text: string;
  count?: number;
  difficulty?: 'KOLAY' | 'ORTA' | 'ZOR';
  skills?: string[];
  gradeLevel?: 1 | 2 | 3 | 4;
}

// In-memory cache: topic+grade → activity (FAZ E performans)
const activityCache = new Map<string, { passage: TextPassage; questions: Question[] }>();

// Mock fallback questions (tüm tipler dahil)
const getMockQuestions = (difficulty: 'KOLAY' | 'ORTA' | 'ZOR' = 'ORTA'): Question[] => [
  {
    id: `q-mcq-${Date.now()}`,
    textId: 'generated-text-id',
    type: 'MCQ',
    instruction: 'Metne göre aşağıdaki soruyu cevaplayınız.',
    difficulty,
    targetSkill: 'ANA_FIKIR',
    learningOutcomes: ['T.2.3.1'],
    feedback: {
      correct: 'Harika! Metnin ana fikrini çok iyi kavradın.',
      incorrect: 'Metnin genelinde ne anlatılmak istendiğine tekrar odaklan.',
    },
    options: [
      { id: 'opt-1', text: 'Doğa sevgisi her şeyden önemlidir.', isCorrect: true },
      { id: 'opt-2', text: 'Sadece teknoloji önemlidir.', isCorrect: false },
      { id: 'opt-3', text: 'Arkadaşlarımızla oynamalıyız.', isCorrect: false },
    ],
  },
  {
    id: `q-tf-${Date.now() + 1}`,
    textId: 'generated-text-id',
    type: 'TRUE_FALSE',
    instruction: 'Aşağıdaki cümle doğru mu, yanlış mı?',
    difficulty,
    targetSkill: 'ANA_FIKIR',
    learningOutcomes: ['T.2.3.2'],
    feedback: {
      correct: 'Tebrikler, doğru bildin!',
      incorrect: 'Metni tekrar oku ve dikkatli düşün.',
    },
    statement: 'Metinde anlatılan hikaye bir çocuk hakkındadır.',
    isTrue: true,
  },
  {
    id: `q-blank-${Date.now() + 2}`,
    textId: 'generated-text-id',
    type: 'FILL_BLANK',
    instruction: 'Aşağıdaki cümleyi uygun kelimeyle tamamla.',
    difficulty,
    targetSkill: 'SOZ_VARLIGI',
    learningOutcomes: ['T.2.4.1'],
    feedback: {
      correct: 'Kelimeyi yerine çok iyi yerleştirdin!',
      incorrect: 'İpucu: Kelime havuzunu kullanabilirsin.',
    },
    template: 'Doğayı korumak için {blank_1} dikkatli davranmalıyız.',
    blanks: [{ id: 'blank_1', correctValue: 'hepimiz', acceptedValues: ['Hepimiz', 'hepimiz'] }],
    wordBank: ['hepimiz', 'sadece sen', 'hiçbirimiz'],
  },
];

/**
 * Magic Generator — Few-Shot Prompting ile Gemini API Entegrasyonu
 * Tüm soru tiplerini (MCQ, TRUE_FALSE, FILL_BLANK, OPEN_ENDED) üretir.
 */
export const generateQuestionsFromText = async (options: GenerateOptions): Promise<Question[]> => {
  const count = options.count || 5;
  const difficulty = options.difficulty || 'ORTA';

  const prompt = `
Sen, Türkçe eğitim materyalleri üreten bir uzman öğretmensin.
Aşağıdaki metni analiz ederek disleksili ilkokul öğrencileri için ${count} adet soru üret.

**METİN:**
"""
${options.text}
"""

**KURAL VE KISITLAR:**
- Zorluk seviyesi: ${difficulty}
- Sınıf seviyesi: ${options.gradeLevel || 2}. sınıf
- Cümleler kısa, net ve basit olmalı (disleksi dostu)
- Her soruda "id" alanı benzersiz olmalı (örn: "q-001", "q-002")
- textId = "generated-text-id"
- Odaklanan beceriler: ${(options.skills || ['ANA_FIKIR', 'SOZ_VARLIGI']).join(', ')}
- En az 1 MCQ ve 1 TRUE_FALSE soru üret

**SORU TİPLERİ ve ÖRNEKLER:**

Tip 1 — MCQ (Çoktan Seçmeli):
{
  "id": "q-001",
  "textId": "generated-text-id",  
  "type": "MCQ",
  "instruction": "Metne göre güvercinin kanatları nasıldır?",
  "difficulty": "KOLAY",
  "targetSkill": "ANA_FIKIR",
  "learningOutcomes": ["T.2.3.1"],
  "feedback": { "correct": "Süper!", "incorrect": "Tekrar dene." },
  "options": [
    { "id": "o1", "text": "Altın renkli", "isCorrect": false },
    { "id": "o2", "text": "Gümüş renkli", "isCorrect": true },
    { "id": "o3", "text": "Siyah", "isCorrect": false }
  ]
}

Tip 2 — TRUE_FALSE (Doğru/Yanlış): MUTLAKA "statement" ve "isTrue" alanı ekle:
{
  "id": "q-002",
  "textId": "generated-text-id",
  "type": "TRUE_FALSE",
  "instruction": "Aşağıdaki cümle doğru mu?",
  "difficulty": "KOLAY",
  "targetSkill": "ANA_FIKIR",
  "learningOutcomes": ["T.2.3.2"],
  "feedback": { "correct": "Harika bildin!", "incorrect": "Metni tekrar oku." },
  "statement": "Güvercin çocuğun penceresine konmuştur.",
  "isTrue": true
}

Tip 3 — FILL_BLANK (Boşluk Doldurma): "template", "blanks", "wordBank" alanları gerekli:
{
  "id": "q-003",
  "textId": "generated-text-id",
  "type": "FILL_BLANK",
  "instruction": "Boşluğu uygun kelimeyle doldur.",
  "difficulty": "KOLAY",
  "targetSkill": "SOZ_VARLIGI",
  "learningOutcomes": ["T.2.4.1"],
  "feedback": { "correct": "Doğru!", "incorrect": "Kelime havuzuna bak." },
  "template": "Güvercinin kanatları {blank_1} gibi parlıyordu.",
  "blanks": [{ "id": "blank_1", "correctValue": "gümüş", "acceptedValues": ["gümüş", "Gümüş"] }],
  "wordBank": ["gümüş", "altın", "demir"]
}

Tip 4 — OPEN_ENDED (Açık Uçlu): "sampleAnswer" alanı gerekli:
{
  "id": "q-004",
  "textId": "generated-text-id",
  "type": "OPEN_ENDED",
  "instruction": "Güvercinin çocuğu ziyaret etmesinin sebebi ne olabilir? Kendi cümlelerinle yaz.",
  "difficulty": "ORTA",
  "targetSkill": "SEBEP_SONUC",
  "learningOutcomes": ["T.2.5.1"],
  "feedback": { "correct": "Harika fikir!", "incorrect": "Neden-sonuç ilişkisini düşün." },
  "sampleAnswer": "Güvercin çocuğun ilgisini çekmek ve onunla arkadaş olmak istemiştir.",
  "minWords": 5
}

Sadece JSON array döndür, başka açıklama ekleme.
`;

  try {
    console.log(`[MagicGenerator] Gemini'ye ${count} soru üretme isteği gönderiliyor...`);
    const result = await generateCreativeMultimodal({
      prompt,
      temperature: 0.35,
      thinkingBudget: 1500,
    });

    const questions: Question[] = Array.isArray(result) ? result : result?.questions || [];
    if (questions.length === 0) throw new Error('Boş soru listesi döndü');

    console.log(`[MagicGenerator] ${questions.length} soru başarıyla üretildi.`);
    return questions;
  } catch (error: any) {
    console.warn('[MagicGenerator] Gemini API hatası, mock veriye düşülüyor:', error?.message);
    return getMockQuestions(difficulty);
  }
};

/**
 * Konu ve sınıf seviyesine göre tam TextPassage + sorular üretir.
 * In-memory cache: aynı topic+grade için cache'den döner (FAZ E).
 */
export const generateFullStudioActivity = async (
  topic: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<{ passage: TextPassage; questions: Question[] }> => {
  // Cache kontrolü (FAZ E — E3)
  const cacheKey = `${topic}-${gradeLevel}`;
  if (activityCache.has(cacheKey)) {
    console.log(`[MagicGenerator] Cache hit: ${cacheKey}`);
    return activityCache.get(cacheKey)!;
  }

  const prompt = `
Sen, Türkçe ilkokul eğitim materyalleri üretme konusunda uzman bir yapay zekasın.
"${topic}" konusunda ${gradeLevel}. sınıf disleksili öğrenciler için:
1. Kısa, basit cümleli bir okuma metni (50-80 kelime, disleksi dostu)
2. 3 adet anlama sorusu (1 MCQ, 1 TRUE_FALSE, 1 FILL_BLANK)

JSON formatında şu yapıyı döndür:
{
  "passage": {
    "id": "text-001",
    "title": "Metin başlığı",
    "content": "Metin içeriği...",
    "metadata": {
      "gradeLevel": ${gradeLevel},
      "difficulty": "KOLAY",
      "theme": "HIKAYE",
      "wordCount": 60,
      "readabilityScore": 85,
      "estimatedReadingTimeMs": 45000
    },
    "learningOutcomes": ["T.${gradeLevel}.2.1"]
  },
  "questions": [
    {
      "id": "q-001", "textId": "text-001", "type": "MCQ",
      "instruction": "...", "difficulty": "KOLAY", "targetSkill": "ANA_FIKIR",
      "learningOutcomes": ["T.${gradeLevel}.3.1"],
      "feedback": { "correct": "...", "incorrect": "..." },
      "options": [
        { "id": "o1", "text": "...", "isCorrect": true },
        { "id": "o2", "text": "...", "isCorrect": false },
        { "id": "o3", "text": "...", "isCorrect": false }
      ]
    },
    {
      "id": "q-002", "textId": "text-001", "type": "TRUE_FALSE",
      "instruction": "Aşağıdaki cümle doğru mu?",
      "difficulty": "KOLAY", "targetSkill": "ANA_FIKIR",
      "learningOutcomes": ["T.${gradeLevel}.3.2"],
      "feedback": { "correct": "...", "incorrect": "..." },
      "statement": "...",
      "isTrue": true
    },
    {
      "id": "q-003", "textId": "text-001", "type": "FILL_BLANK",
      "instruction": "Boşluğu doldur.", "difficulty": "KOLAY", "targetSkill": "SOZ_VARLIGI",
      "learningOutcomes": ["T.${gradeLevel}.4.1"],
      "feedback": { "correct": "...", "incorrect": "..." },
      "template": "... {blank_1} ...",
      "blanks": [{ "id": "blank_1", "correctValue": "...", "acceptedValues": ["..."] }],
      "wordBank": ["...", "...", "..."]
    }
  ]
}
`;

  try {
    const result = await generateCreativeMultimodal({ prompt, temperature: 0.4 });
    const passage = result?.passage;
    if (!passage?.title) throw new Error('Geçersiz passage yapısı');

    const questions: Question[] = Array.isArray(result?.questions)
      ? result.questions
      : await generateQuestionsFromText({ text: passage.content, count: 3, difficulty: 'KOLAY', gradeLevel });

    const activity = { passage, questions };
    activityCache.set(cacheKey, activity);
    return activity;
  } catch (error: any) {
    console.warn('[MagicGenerator] Gemini API hatası, fallback veriye düşülüyor:', error?.message);
    return {
      passage: {
        id: `text-${Date.now()}`,
        title: `${topic} Hakkında Bir Hikaye`,
        content: `${topic} çok ilginç bir konudur. Çocuklar parkta oynarken doğanın güzelliklerini fark ettiler. Güneş parlıyor, kuşlar cıvıldıyordu. Herkes çok mutluydu.`,
        metadata: {
          gradeLevel,
          difficulty: 'KOLAY',
          theme: 'HIKAYE',
          wordCount: 22,
          readabilityScore: 90,
          estimatedReadingTimeMs: 30000,
        },
        learningOutcomes: ['T.1.2.1'],
      },
      questions: getMockQuestions('KOLAY'),
    };
  }
};
