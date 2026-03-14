import { Question, TextPassage } from '../types/schemas';

interface GenerateOptions {
  text: string;
  count?: number;
  difficulty?: 'KOLAY' | 'ORTA' | 'ZOR';
  skills?: string[];
}

/**
 * Magic Generator: Takes a text passage and uses AI to generate fully formatted questions.
 * In a real-world scenario with @google/genai, this would call your Next.js/Vite API endpoint
 * to securely use the API key and return structured JSON matching the Question schema.
 */
export const generateQuestionsFromText = async (options: GenerateOptions): Promise<Question[]> => {
  // Demo Implementation - Simulated AI Delay and mock data
  console.log(
    `[MagicGenerator] Soru üretiliyor: ${options.count || 5} soru, Zorluk: ${options.difficulty || 'ORTA'}`
  );

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: `q-mcq-${Date.now()}`,
          textId: 'generated-text-id',
          type: 'MCQ',
          instruction: 'Metne göre aşağıdaki soruyu cevaplayınız.',
          difficulty: options.difficulty || 'ORTA',
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
          id: `q-blank-${Date.now()}`,
          textId: 'generated-text-id',
          type: 'FILL_BLANK',
          instruction: 'Aşağıdaki cümleyi metne uygun şekilde tamamla.',
          difficulty: options.difficulty || 'ORTA',
          targetSkill: 'SOZ_VARLIGI',
          learningOutcomes: ['T.2.4.1'],
          feedback: {
            correct: 'Kelimeleri yerine çok iyi yerleştirdin!',
            incorrect: 'İpucu: Kelime havuzunu kullanabilirsin.',
          },
          template: 'Doğayı korumak için {blank_1} çok dikkatli davranmalıyız.',
          blanks: [
            { id: 'blank_1', correctValue: 'hepimiz', acceptedValues: ['Hepimiz', 'hepimiz'] },
          ],
          wordBank: ['hepimiz', 'sadece sen', 'hiçbirimiz'],
        },
      ]);
    }, 1500); // Simulate 1.5s AI network delay
  });
};

/**
 * Generates a full TextPassage and Questions from a given topic.
 */
export const generateFullStudioActivity = async (
  topic: string,
  gradeLevel: 1 | 2 | 3 | 4
): Promise<{ passage: TextPassage; questions: Question[] }> => {
  // Simulated AI API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        passage: {
          id: `text-${Date.now()}`,
          title: `${topic} Hakkında Bir Hikaye`,
          content: `${topic} çok ilginç bir konudur. Çocuklar parkta oynarken doğanın güzelliklerini fark ettiler. Güneş parlıyor, kuşlar cıvıldıyordu. Herkes çok mutluydu.`,
          metadata: {
            gradeLevel,
            difficulty: 'KOLAY',
            theme: 'HIKAYE',
            wordCount: 22,
            readabilityScore: 90, // Easy
            estimatedReadingTimeMs: 30000,
          },
          learningOutcomes: ['T.1.2.1'],
        },
        questions: [],
      });
    }, 2000);
  });
};
