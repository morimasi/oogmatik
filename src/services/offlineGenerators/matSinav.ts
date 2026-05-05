import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

interface MatSinavQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
  explanation?: string;
}

interface MatSinavData {
  id: string;
  activityType: string;
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  questions: MatSinavQuestion[];
  time: number;
  totalPoints: number;
}

const mathQuestions = [
  {
    question: "23 + 47 işleminin sonucu kaçtır?",
    options: ["60", "70", "80", "90"],
    correctAnswer: 1,
    explanation: "23 + 47 = 70"
  },
  {
    question: "8 × 7 çarpımının sonucu kaçtır?",
    options: ["48", "56", "64", "72"],
    correctAnswer: 1,
    explanation: "8 × 7 = 56"
  },
  {
    question: "144 ÷ 12 bölümünün sonucu kaçtır?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    explanation: "144 ÷ 12 = 12"
  },
  {
    question: "5² (5'in karesi) kaçtır?",
    options: ["10", "15", "20", "25"],
    correctAnswer: 3,
    explanation: "5² = 5 × 5 = 25"
  },
  {
    question: "Bir üçgenin iç açıları toplamı kaç derecedir?",
    options: ["90°", "120°", "180°", "360°"],
    correctAnswer: 2,
    explanation: "Üçgenin iç açıları toplamı 180°"
  },
  {
    question: "2x - 4 = 8 denkleminin çözümü kaçtır?",
    options: ["4", "6", "8", "10"],
    correctAnswer: 1,
    explanation: "2x = 12, x = 6"
  },
  {
    question: "3/4 + 1/4 işleminin sonucu kaçtır?",
    options: ["1", "1/2", "3/8", "1/4"],
    correctAnswer: 0,
    explanation: "3/4 + 1/4 = 4/4 = 1"
  },
  {
    question: "Bir dairenin çevresini hesaplamak için kullanılan formül aşağıdakilerden hangisidir?",
    options: ["πr", "πr²", "2πr", "πd"],
    correctAnswer: 2,
    explanation: "Dairenin çevresi = 2πr"
  },
  {
    question: "15 sayısının %20'si kaçtır?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 1,
    explanation: "15 × 0.20 = 3"
  },
  {
    question: "Asal sayı aşağıdakilerden hangisidir?",
    options: ["9", "15", "17", "21"],
    correctAnswer: 2,
    explanation: "17 sadece 1 ve kendisine bölünür"
  }
];

export const generateOfflineMatSinav = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 10,
    ageGroup = '8-10',
    profile = 'general'
  } = options;

  const pages: MatSinavData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const questions: MatSinavQuestion[] = [];
    
    // Soruları rastgele seç ve karıştır
    const shuffled = [...mathQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(itemCount, mathQuestions.length));

    selectedQuestions.forEach((q, i) => {
      questions.push({
        id: `q${i + 1}`,
        question: q.question,
        options: [...q.options].sort(() => 0.5 - Math.random()),
        correctAnswer: q.correctAnswer,
        difficulty: difficulty === 'Başlangıç' ? 1 : difficulty === 'Zor' ? 3 : 2,
        explanation: q.explanation
      });
    });

    pages.push({
      id: `mat-sinav-${p}`,
      activityType: 'MAT_SINAV',
      title: 'Matematik Sınavı',
      instruction: 'Aşağıdaki matematik sorularını dikkatlice çözün ve en doğru cevabı işaretleyin.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup as string,
      profile: profile,
      questions: questions,
      time: questions.length * 3, // 3 dakika per soru
      totalPoints: questions.length * 5
    });
  }

  return pages as unknown as WorksheetData[];
};
