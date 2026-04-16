import { AgeGroup } from './creativeStudio';

export type KelimeCumleActivityType = 
    | 'bosluk_doldurma' 
    | 'test' 
    | 'kelime_tamamlama' 
    | 'karisik_cumle' 
    | 'zit_anlam';

export type KelimeCumleDifficulty = 'Başlangıç' | 'Orta' | 'İleri' | 'Uzman';

export interface KelimeCumleConfig {
    id: string;
    type: KelimeCumleActivityType;
    ageGroup: AgeGroup;
    difficulty: KelimeCumleDifficulty;
    title: string;
    itemCount: number;
    itemsPerPage?: number | 'auto';
    showAnswers?: boolean;
    customInstructions?: string;
    topics: string[];
}

export interface BoslukDoldurmaItem {
    sentence: string; // "Atatürk 1881 yılında ……… doğdu."
    answer: string;   // "Selanik'te"
}

export interface TestItem {
    question: string;
    options: string[];
    answer: string;
}

export interface KelimeTamamlamaItem {
    word: string; // "Si...gi"
    fullWord: string; // "Silgi"
    clue: string; // "Silmeye yarayan ders aracı"
}

export interface KarisikCumleItem {
    words: string[]; // ["Kemal", "sabah", "saat", "7.00’de", "uyandı"]
    correctSentence: string;
}

export interface ZitAnlamItem {
    word: string;
    antonym: string;
}

export interface KelimeCumleGeneratedContent {
    title: string;
    instructions: string;
    pedagogicalNote: string;
    items: any[]; // Modüle göre tipi değişir
    activityType: KelimeCumleActivityType;
    difficulty?: KelimeCumleDifficulty;
}
