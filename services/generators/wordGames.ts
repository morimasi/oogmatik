
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData, ResfebeClue
} from '../../types';

// Helper to define what "Difficulty" means for AI precisely with the new 5x scaling logic
const getDifficultyPrompt = (diff: string) => {
    switch(diff) {
        case 'Başlangıç': 
            return `SEVİYE: BAŞLANGIÇ (Çok Kolay).
            - Kelimeler: 2-4 harfli, 1-2 heceli, somut (örn: at, ev, top).
            - Cümleler: Maksimum 4 kelime. Basit yapı (Özne-Yüklem).
            - İçerik: Karmaşıklık yok, çeldirici yok. Net ve anlaşılır.`;
        case 'Orta': 
            return `SEVİYE: ORTA (Standart).
            - Kelimeler: 5-7 harfli, 2-3 heceli, günlük kullanım (örn: kalem, okul, koşmak).
            - Cümleler: 5-8 kelime. Bağlaç içerebilir.
            - İçerik: Basit çeldiriciler olabilir.`;
        case 'Zor': 
            return `SEVİYE: ZOR (Gelişmiş).
            - Kelimeler: 8-10 harfli, 3-4 heceli, soyut kavramlar (örn: özgürlük, düşünce).
            - Cümleler: 10-15 kelime. Yan cümleçikler, deyimler.
            - İçerik: Mantıksal çıkarım gerektirir.`;
        case 'Uzman': 
            return `SEVİYE: UZMAN (Akademik/Zorlu).
            - Kelimeler: 12+ harfli, 4+ heceli, teknik/akademik terimler (örn: biyoçeşitlilik, sürdürülebilirlik).
            - Cümleler: 15+ kelime. Devrik cümleler, karmaşık gramer, metaforlar.
            - İçerik: Üst düzey bilişsel beceri gerektirir.`;
        default: return "";
    }
};

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: kelime dağarcığı, fonolojik farkındalık, sözel akıl yürütme) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Iconic Vector Style", "Educational", "Clear & Simple".
    - **Detay:** "Mavi renkli, açık duran bir kitap vektörü, üzerinde harfler uçuşuyor" gibi.
6.  **İçerik:**
    - Kelime seçimleri yaş grubuna uygun olmalı.
    - Bulmacalar çözülebilir olmalı.
`;

export const generateWordSearchFromAI = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const diffPrompt = getDifficultyPrompt(difficulty);
  const prompt = `
    Konu: ${topic}.
    Etkinlik: Kelime Bulmaca.
    ${diffPrompt}
    
    IZGARA KURALLARI:
    - Başlangıç: 6x6 ızgara, 5 basit kelime.
    - Orta: 10x10 ızgara, 8 standart kelime.
    - Zor: 15x15 ızgara, 12 uzun kelime.
    - Uzman: 20x20 ızgara, 15 çok uzun ve karmaşık kelime.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      hiddenMessage: { type: Type.STRING },
      followUpQuestion: { type: Type.STRING },
      writingPrompt: { type: Type.STRING }
    },
    required: ['title', 'instruction', 'grid', 'words', 'hiddenMessage', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateCrosswordFromAI = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `Konu: ${topic}. Etkinlik: Çapraz Bulmaca. ${diffPrompt} ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, clues: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, direction: {type: Type.STRING}, text: {type: Type.STRING}, start: {type: Type.OBJECT, properties: {row: {type: Type.INTEGER}, col: {type: Type.INTEGER}}, required: ['row','col']}, word: {type: Type.STRING}}, required: ['id','direction','text','start','word']}}, passwordCells: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {row: {type: Type.INTEGER}, col: {type: Type.INTEGER}}, required: ['row','col']}}, passwordLength: {type: Type.INTEGER}, passwordPrompt: {type: Type.STRING} }, required: ['title', 'grid', 'clues', 'passwordPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData[]>;
}

export const generateSpiralPuzzleFromAI = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `Etkinlik: Sarmal Bulmaca. ${diffPrompt} ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordStarts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['id', 'row', 'col'] } },
            passwordPrompt: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'clues', 'wordStarts', 'passwordPrompt', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData[]>;
};

export const generateJumbledWordStoryFromAI = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { theme, worksheetCount, difficulty } = options;
    const diffPrompt = getDifficultyPrompt(difficulty);
    const prompt = `
    '${theme}' temalı Karışık Kelime Hikayesi.
    ${diffPrompt}
    **İngilizce** 'imagePrompt' ana görsel için.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {jumbled: {type: Type.ARRAY, items: {type: Type.STRING}}, word: {type: Type.STRING}}, required: ['jumbled', 'word']}},
                storyPrompt: {type: Type.STRING},
                imagePrompt: {type: Type.STRING}
            }, required: ['title', 'puzzles', 'storyPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData[]>;
};

export const generateWordGridPuzzleFromAI = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Kelime Ağı Bulmacası. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, wordList: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, unusedWordPrompt: {type: Type.STRING} }, required: ['title', 'wordList', 'grid', 'unusedWordPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData[]>;
};

export const generateAntonymFlowerPuzzleFromAI = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Zıt Anlam Çiçeği. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {centerWord: {type: Type.STRING}, antonym: {type: Type.STRING}, petalLetters: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['centerWord', 'antonym', 'petalLetters']}}, passwordLength: {type: Type.INTEGER} }, required: ['title', 'puzzles', 'passwordLength', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData[]>;
};

export const generateSynonymMatchingPatternFromAI = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Eş Anlam Eşleştirme. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, pairs: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, synonym: {type: Type.STRING}}, required: ['word', 'synonym']}} }, required: ['title', 'pairs', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<SynonymMatchingPatternData[]>;
};

export const generateMissingPartsFromAI = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
     const { worksheetCount, difficulty } = options;
     const prompt = `Eksik Parçalar (Kelime). ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, leftParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}}, rightParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}}, givenParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, parts: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['word', 'parts']}} }, required: ['title', 'leftParts', 'rightParts', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData[]>;
};

export const generateWordWebFromAI = async (options: GeneratorOptions): Promise<WordWebData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Kelime Ağı. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, wordsToFind: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, keyWordPrompt: {type: Type.STRING} }, required: ['title', 'wordsToFind', 'grid', 'keyWordPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<WordWebData[]>;
};

export const generateWordWebWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Şifreli Kelime Ağı. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, words: { type: Type.ARRAY, items: { type: Type.STRING } }, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, passwordColumnIndex: { type: Type.INTEGER } }, required: ['title', 'prompt', 'words', 'grid', 'passwordColumnIndex', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData[]>;
};

export const generateHomonymSentenceWritingFromAI = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Eş Sesli Kelime Cümle Yazma.
    ${getDifficultyPrompt(difficulty)}
    Her anlam için **İngilizce** 'imagePrompt' ve bir tane de ana 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning1: { type: Type.STRING }, imagePrompt_1: { type: Type.STRING }, meaning2: { type: Type.STRING }, imagePrompt_2: { type: Type.STRING } }, required: ["word", "meaning1", "imagePrompt_1", "meaning2", "imagePrompt_2"] } } }, required: ["title", "prompt", "items", "instruction", "pedagogicalNote", "imagePrompt"] } };
    return generateWithSchema(prompt, schema) as Promise<HomonymSentenceData[]>;
};

export const generateHomonymImageMatchFromAI = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Eş Sesli Resim Eşleme.
    ${getDifficultyPrompt(difficulty)}
    Görseller için **İngilizce** 'imagePrompt'. Ana 'imagePrompt' ekle.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, leftImages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"] } }, rightImages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"] } }, wordScramble: { type: Type.OBJECT, properties: { letters: { type: Type.ARRAY, items: { type: Type.STRING } }, word: { type: Type.STRING } }, required: ["letters", "word"] } }, required: ["title", "prompt", "leftImages", "rightImages", "wordScramble", "instruction", "pedagogicalNote", "imagePrompt"] } };
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData[]>;
};

export const generateImageAnagramSortFromAI = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Resimli Anagram Sıralama.
    ${getDifficultyPrompt(difficulty)}
    **İngilizce** 'imagePrompt' ve ana 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, cards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, scrambledWord: { type: Type.STRING }, correctWord: { type: Type.STRING } }, required: ["imageDescription", "imagePrompt", "scrambledWord", "correctWord"] } } }, required: ["title", "prompt", "cards", "instruction", "pedagogicalNote", "imagePrompt"] } };
    return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData[]>;
};

export const generateAnagramImageMatchFromAI = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Anagram Resim Eşleme.
    ${getDifficultyPrompt(difficulty)}
    **İngilizce** 'imagePrompt' ve ana 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, wordBank: { type: Type.ARRAY, items: { type: Type.STRING } }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, partialAnswer: { type: Type.STRING }, correctWord: { type: Type.STRING } }, required: ["imageDescription", "imagePrompt", "partialAnswer", "correctWord"] } } }, required: ["title", "prompt", "wordBank", "puzzles", "instruction", "pedagogicalNote", "imagePrompt"] } };
    return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData[]>;
};

export const generateSyllableWordSearchFromAI = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
     const { worksheetCount, difficulty } = options;
     const prompt = `Hece ve Kelime Avı. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, syllablesToCombine: {type: Type.ARRAY, items: {type: Type.STRING}}, wordsToCreate: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {syllable1: {type: Type.STRING}, syllable2: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['syllable1','syllable2','answer']}}, wordsToFindInSearch: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, passwordPrompt: {type: Type.STRING} }, required: ['title', 'syllablesToCombine', 'wordsToCreate', 'grid', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData[]>;
}

export const generateWordSearchWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Şifreli Kelime Avı. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, words: { type: Type.ARRAY, items: { type: Type.STRING } }, passwordCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] } } }, required: ['title', 'prompt', 'grid', 'words', 'passwordCells', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData[]>;
};

export const generateLetterGridWordFindFromAI = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `Harf Izgarasında Kelime Bul. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: {type: Type.STRING}, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, words: { type: Type.ARRAY, items: { type: Type.STRING } }, writingPrompt: { type: Type.STRING } }, required: ['title', 'prompt', 'grid', 'words', 'writingPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData[]>;
};

export const generateWordPlacementPuzzleFromAI = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
     const { worksheetCount, difficulty } = options;
     const prompt = `Kelime Yerleştirme (Kriss Kross). ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, wordGroups: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {length: {type: Type.INTEGER}, words: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['length','words']}}, unusedWordPrompt: {type: Type.STRING} }, required: ['title', 'grid', 'wordGroups', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData[]>;
}

export const generatePositionalAnagramFromAI = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
     const { worksheetCount, difficulty } = options;
     const prompt = `Yer Değiştirmeli Anagram. ${getDifficultyPrompt(difficulty)} ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, imagePrompt: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, scrambled: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['id','scrambled','answer']}} }, required: ['title', 'puzzles', 'instruction', 'pedagogicalNote', 'imagePrompt'] } };
    return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData[]>;
}

export const generateResfebeFromAI = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const { worksheetCount, difficulty } = options;
    const prompt = `
    Resfebe.
    ${getDifficultyPrompt(difficulty)}
    **İngilizce** 'imagePrompt' (resimler ve ana kapak için).
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: {type: Type.STRING},
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { clues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['text', 'image'] }, value: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["type", "value"] } }, answer: { type: Type.STRING } }, required: ["clues", "answer"] } }
        },
        required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ResfebeData[]>;
};

// Aliases with safe casting
export const generateThematicWordSearchColorFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<ThematicWordSearchColorData[]>;
export const generatePunctuationSpiralPuzzleFromAI = async (options: GeneratorOptions) => generateSpiralPuzzleFromAI(options) as any as Promise<PunctuationSpiralPuzzleData[]>;
export const generateThematicJumbledWordStoryFromAI = async (options: GeneratorOptions) => generateJumbledWordStoryFromAI(options) as Promise<JumbledWordStoryData[]>;
export const generateAntonymResfebeFromAI = async (options: GeneratorOptions) => generateResfebeFromAI(options) as any as Promise<AntonymResfebeData[]>;
export const generateSynonymSearchAndStoryFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymSearchAndStoryData[]>;
export const generateSynonymWordSearchFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymWordSearchData[]>;
