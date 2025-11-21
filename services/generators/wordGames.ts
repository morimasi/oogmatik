
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, JumbledWordStoryData, ThematicJumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": İlgili görseller için İngilizce detaylı açıklama.
5. İçerik zengin ve eğitici olmalı.
`;

export const generateWordSearchFromAI = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde, ${topic} konulu Kelime Bulmaca. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      hiddenMessage: { type: Type.STRING },
      followUpQuestion: { type: Type.STRING },
      writingPrompt: { type: Type.STRING }
    },
    required: ['title', 'instruction', 'grid', 'words', 'hiddenMessage', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateSpiralPuzzleFromAI = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Sarmal Bulmaca. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordStarts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['id', 'row', 'col'] } },
            passwordPrompt: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'clues', 'wordStarts', 'passwordPrompt', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData[]>;
};

export const generateJumbledWordStoryFromAI = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { theme, worksheetCount } = options;
    const prompt = `
    '${theme}' temalı Karışık Kelime Hikayesi.
    **İngilizce** 'imagePrompt'.
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
    const { worksheetCount } = options;
    const prompt = `Kelime Ağı Bulmacası. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, wordList: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, unusedWordPrompt: {type: Type.STRING} }, required: ['title', 'wordList', 'grid', 'unusedWordPrompt', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData[]>;
};

export const generateAntonymFlowerPuzzleFromAI = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { worksheetCount } = options;
    const prompt = `Zıt Anlam Çiçeği. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {centerWord: {type: Type.STRING}, antonym: {type: Type.STRING}, petalLetters: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['centerWord', 'antonym', 'petalLetters']}}, passwordLength: {type: Type.INTEGER} }, required: ['title', 'puzzles', 'passwordLength', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData[]>;
};

export const generateSynonymMatchingPatternFromAI = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { worksheetCount } = options;
    const prompt = `Eş Anlam Eşleştirme. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pairs: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, synonym: {type: Type.STRING}}, required: ['word', 'synonym']}} }, required: ['title', 'pairs', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<SynonymMatchingPatternData[]>;
};

export const generateMissingPartsFromAI = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
     const { worksheetCount } = options;
     const prompt = `Eksik Parçalar (Kelime). ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, leftParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}}, rightParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}}, givenParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, parts: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['word', 'parts']}} }, required: ['title', 'leftParts', 'rightParts', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData[]>;
};

export const generateWordWebFromAI = async (options: GeneratorOptions): Promise<WordWebData[]> => {
    const { worksheetCount } = options;
    const prompt = `Kelime Ağı. ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, wordsToFind: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, keyWordPrompt: {type: Type.STRING} }, required: ['title', 'wordsToFind', 'grid', 'keyWordPrompt', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<WordWebData[]>;
};

export const generateWordWebWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { worksheetCount } = options;
    const prompt = `Şifreli Kelime Ağı. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, words: { type: Type.ARRAY, items: { type: Type.STRING } }, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, passwordColumnIndex: { type: Type.INTEGER } }, required: ['title', 'prompt', 'words', 'grid', 'passwordColumnIndex', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData[]>;
};

export const generateHomonymSentenceWritingFromAI = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Eş Sesli Kelime Cümle Yazma.
    Her anlam için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning1: { type: Type.STRING }, imagePrompt_1: { type: Type.STRING }, meaning2: { type: Type.STRING }, imagePrompt_2: { type: Type.STRING } }, required: ["word", "meaning1", "imagePrompt_1", "meaning2", "imagePrompt_2"] } } }, required: ["title", "prompt", "items", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<HomonymSentenceData[]>;
};

export const generateHomonymImageMatchFromAI = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Eş Sesli Resim Eşleme.
    Görseller için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, leftImages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"] } }, rightImages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"] } }, wordScramble: { type: Type.OBJECT, properties: { letters: { type: Type.ARRAY, items: { type: Type.STRING } }, word: { type: Type.STRING } }, required: ["letters", "word"] } }, required: ["title", "prompt", "leftImages", "rightImages", "wordScramble", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData[]>;
};

export const generateImageAnagramSortFromAI = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Resimli Anagram Sıralama.
    **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, cards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, scrambledWord: { type: Type.STRING }, correctWord: { type: Type.STRING } }, required: ["imageDescription", "imagePrompt", "scrambledWord", "correctWord"] } } }, required: ["title", "prompt", "cards", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData[]>;
};

export const generateAnagramImageMatchFromAI = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Anagram Resim Eşleme.
    **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, wordBank: { type: Type.ARRAY, items: { type: Type.STRING } }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { imageDescription: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, partialAnswer: { type: Type.STRING }, correctWord: { type: Type.STRING } }, required: ["imageDescription", "imagePrompt", "partialAnswer", "correctWord"] } } }, required: ["title", "prompt", "wordBank", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData[]>;
};

export const generateSyllableWordSearchFromAI = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
     const { worksheetCount } = options;
     const prompt = `Hece ve Kelime Avı. ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, syllablesToCombine: {type: Type.ARRAY, items: {type: Type.STRING}}, wordsToCreate: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {syllable1: {type: Type.STRING}, syllable2: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['syllable1','syllable2','answer']}}, wordsToFindInSearch: {type: Type.ARRAY, items: {type: Type.STRING}}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, passwordPrompt: {type: Type.STRING} }, required: ['title', 'syllablesToCombine', 'wordsToCreate', 'grid', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData[]>;
}

export const generateWordSearchWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const { worksheetCount } = options;
    const prompt = `Şifreli Kelime Avı. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, words: { type: Type.ARRAY, items: { type: Type.STRING } }, passwordCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] } } }, required: ['title', 'prompt', 'grid', 'words', 'passwordCells', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData[]>;
};

export const generateLetterGridWordFindFromAI = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const { worksheetCount } = options;
    const prompt = `Harf Izgarasında Kelime Bul. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }, words: { type: Type.ARRAY, items: { type: Type.STRING } }, writingPrompt: { type: Type.STRING } }, required: ['title', 'prompt', 'grid', 'words', 'writingPrompt', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData[]>;
};

export const generateWordPlacementPuzzleFromAI = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
     const { worksheetCount } = options;
     const prompt = `Kelime Yerleştirme (Kriss Kross). ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, wordGroups: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {length: {type: Type.INTEGER}, words: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['length','words']}}, unusedWordPrompt: {type: Type.STRING} }, required: ['title', 'grid', 'wordGroups', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData[]>;
}

export const generatePositionalAnagramFromAI = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
     const { worksheetCount } = options;
     const prompt = `Yer Değiştirmeli Anagram. ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, scrambled: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['id','scrambled','answer']}} }, required: ['title', 'puzzles', 'instruction', 'pedagogicalNote'] } };
    return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData[]>;
}

export const generateResfebeFromAI = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const { worksheetCount } = options;
    const prompt = `
    Resfebe.
    **İngilizce** 'imagePrompt' (resimler için).
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
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { clues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['text', 'image'] }, value: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["type", "value"] } }, answer: { type: Type.STRING } }, required: ["clues", "answer"] } }
        },
        required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ResfebeData[]>;
};

// Aliases with safe casting
export const generateThematicWordSearchColorFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<ThematicWordSearchColorData[]>;
export const generatePunctuationSpiralPuzzleFromAI = async (options: GeneratorOptions) => generateSpiralPuzzleFromAI(options) as any as Promise<PunctuationSpiralPuzzleData[]>;
export const generateThematicJumbledWordStoryFromAI = async (options: GeneratorOptions) => generateJumbledWordStoryFromAI(options) as any as Promise<ThematicJumbledWordStoryData[]>;
export const generateAntonymResfebeFromAI = async (options: GeneratorOptions) => generateResfebeFromAI(options) as any as Promise<AntonymResfebeData[]>;
export const generateSynonymSearchAndStoryFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymSearchAndStoryData[]>;
export const generateSynonymWordSearchFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymWordSearchData[]>;
