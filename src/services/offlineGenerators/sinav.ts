import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

interface SinavQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
}

interface SinavData {
  id: string;
  activityType: string;
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  questions: SinavQuestion[];
  time: number;
  totalPoints: number;
}

const turkceQuestions = [
  {
    question: "Aşağıdaki cümlelerin hangisinde 'neden-sonuç' ilişkisi vardır?",
    options: [
      "Ali okula gitti, çünkü ders vardı.",
      "Ayşe elma yedi, armut da yedi.",
      "Mehmet koşuyor, Ahmet yürüyor.",
      "Zeynep şarkı söylüyor, neşeli."
    ],
    correctAnswer: 0
  },
  {
    question: "'Güneş battı' cümlesinin eş anlamlısı aşağıdakilerden hangisidir?",
    options: [
      "Güneş doğdu.",
      "Güneş doğuya indi.",
      "Güneş batıya indi.",
      "Güneş parladı."
    ],
    correctAnswer: 2
  },
  {
    question: "Aşağıdaki kelimelerin hangisinde yazım yanlışı vardır?",
    options: [
      "Çocuk",
      "Okul",
      "Öğretmen",
      "Arkadaşş"
    ],
    correctAnswer: 3
  },
  {
    question: "'Kitap' kelimesinin eş anlamlısı aşağıdakilerden hangisidir?",
    options: [
      "Defter",
      "Kitaplık",
      "Eser",
      "Kalem"
    ],
    correctAnswer: 2
  },
  {
    question: "Aşağıdaki cümlelerin hangisinde ünlü harf uyumu vardır?",
    options: [
      "Kitaplar masada duruyor.",
      "Bilgisayar çalışmıyor.",
      "Pencereler açık.",
      "Kapılar kapalı."
    ],
    correctAnswer: 0
  }
];

export const generateOfflineSinav = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 10,
    ageGroup = '8-10',
    profile = 'general'
  } = options;

  const pages: SinavData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const questions: SinavQuestion[] = [];
    
    // Soruları rastgele seç ve karıştır
    const shuffled = [...turkceQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(itemCount, turkceQuestions.length));

    selectedQuestions.forEach((q, i) => {
      questions.push({
        id: `q${i + 1}`,
        question: q.question,
        options: [...q.options].sort(() => 0.5 - Math.random()),
        correctAnswer: q.correctAnswer,
        difficulty: difficulty === 'Başlangıç' ? 1 : difficulty === 'Zor' ? 3 : 2
      });
    });

    pages.push({
      id: `sinav-${p}`,
      activityType: 'SINAV',
      title: 'Türkçe Sınavı',
      instruction: 'Aşağıdaki soruları dikkatlice okuyun ve en doğru cevabı işaretleyin.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup as string,
      profile: profile,
      questions: questions,
      time: questions.length * 2, // 2 dakika per soru
      totalPoints: questions.length * 5
    });
  }

  return pages as unknown as WorksheetData[];
};
