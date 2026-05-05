import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

interface ShortAnswerQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: number;
}

interface InfographicShortAnswerData {
  id: string;
  activityType: string;
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  questions: ShortAnswerQuestion[];
  colorMode: string;
  lineCount: number;
}

const generalQuestions = [
  {
    question: "Güneş sistemindeki en büyük gezegen hangisidir?",
    answer: "Jüpiter"
  },
  {
    question: "Türkiye'nin başkenti neresidir?",
    answer: "Ankara"
  },
  {
    question: "İnsan vücudunda kaç kemik bulunur?",
    answer: "206"
  },
  {
    question: "Dünyanın en uzun nehri hangisidir?",
    answer: "Nil"
  },
  {
    question: "Bir yılda kaç ay vardır?",
    answer: "12"
  },
  {
    question: "Su kimyasal formülü nedir?",
    answer: "H2O"
  },
  {
    question: "En hızlı hayvan hangisidir?",
    answer: "Çita"
  },
  {
    question: "Türkiye'nin en büyük gölü hangisidir?",
    answer: "Van Gölü"
  },
  {
    question: "Photosentez için gerekli olan üç şey nedir?",
    answer: "Işık, su, karbondioksit"
  },
  {
    question: "Matematikte π sayısı yaklaşık kaçtır?",
    answer: "3.14"
  }
];

const scienceQuestions = [
  {
    question: "Yerçekimi kim tarafından keşfedilmiştir?",
    answer: "Isaac Newton"
  },
  {
    question: "Atomun temel bileşenleri nelerdir?",
    answer: "Proton, nötron, elektron"
  },
  {
    question: "Işık hızı saniyede kaç kilometredir?",
    answer: "300.000"
  },
  {
    question: "DNA'nın açılımı nedir?",
    answer: "Deoksiribonükleik asit"
  },
  {
    question: "Periyodik tabloda kaç element vardır?",
    answer: "118"
  }
];

const historyQuestions = [
  {
    question: "İstanbul'un fethi kaç yılında yapılmıştır?",
    answer: "1453"
  },
  {
    question: "Türkiye Cumhuriyeti'nin kurucusu kimdir?",
    answer: "Mustafa Kemal Atatürk"
  },
  {
    question: "Osmanlı İmparatorluğu kaç yıl sürmüştür?",
    answer: "623"
  },
  {
    question: " ilk çağda yazı ilk nerede icat edilmiştir?",
    answer: "Mezopotamya"
  },
  {
    question: "Rönesans hareketi nerede başlamıştır?",
    answer: "İtalya"
  }
];

export const generateOfflineInfographicShortAnswer = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 15,
    ageGroup = '8-10',
    profile = 'general',
    topic = 'Genel Bilgi'
  } = options;

  const pages: InfographicShortAnswerData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    let questions: any[] = [];
    
    // Konuya göre soru seçimi
    let selectedQuestions = [...generalQuestions];
    
    if (topic?.toLowerCase().includes('bilim') || topic?.toLowerCase().includes('fen')) {
      selectedQuestions = [...scienceQuestions, ...generalQuestions];
    } else if (topic?.toLowerCase().includes('tarih')) {
      selectedQuestions = [...historyQuestions, ...generalQuestions];
    }

    // Rastgele soru seçimi
    const shuffled = selectedQuestions.sort(() => 0.5 - Math.random());
    questions = shuffled.slice(0, Math.min(itemCount, selectedQuestions.length));

    // Zorluk seviyesine göre ID ve difficulty ekle
    questions = questions.map((q, i) => ({
      ...q,
      id: `q${i + 1}`,
      difficulty: difficulty === 'Başlangıç' ? 1 : difficulty === 'Zor' ? 3 : 2
    }));

    pages.push({
      id: `infographic-short-answer-${p}`,
      activityType: 'INFOGRAPHIC_SHORT_ANSWER',
      title: 'Kısa Cevaplı Sorular',
      instruction: 'Soruları oku ve kısa cevaplarını yaz.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup as string,
      profile: profile,
      questions: questions,
      colorMode: (options.params?.colorMode as string) || 'Karma Renkli',
      lineCount: parseInt((options.params?.lineCount as string) || '2')
    });
  }

  return pages as unknown as WorksheetData[];
};
