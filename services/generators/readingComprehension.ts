
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, StoryData, ReadingStroopData, SynonymAntonymMatchData, ReadingSudokuData } from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI & PSİKOMETRİST]
Amaç: Disleksik çocuklarda dürtü kontrolü, odaklanma ve sözel enterferans (karışma) direncini artırmak.
Tasarım: Sözel Stroop Testi (Verbal Stroop) bir A4 sayfasını dolduracak yoğunlukta olmalıdır.
`;

export const generateReadingSudokuFromAI = async (options: GeneratorOptions): Promise<ReadingSudokuData[]> => {
    const { difficulty, worksheetCount, variant = 'letters', gridSize = 4 } = options;
    
    const variantDesc = {
        'letters': 'Dislekside sık karıştırılan harf çiftleri (b-d, p-q, m-n vb.) veya sesli harfler.',
        'words': 'Aynı temaya ait (uzay, meyveler, duygular) kısa ve somut kelimeler.',
        'visuals': 'Semboller veya piktogramlar (yıldız, kare, üçgen vb.)',
        'numbers': 'Sayısal veriler.'
    }[variant as string] || 'Harfler';

    const prompt = `
    [ROL: UZMAN ÖZEL EĞİTİM MATERYALİ TASARIMCISI]
    GÖREV: "${difficulty}" zorluk seviyesinde, ${gridSize}x${gridSize} boyutunda bir "Dil Sudokusu" üret.
    TEMA/VARYANT: ${variantDesc}
    
    KURALLAR:
    1. Sudoku kuralları geçerlidir: Her öğe her satırda, sütunda ve ${gridSize === 4 ? '2x2' : '3x2'} blokta sadece bir kez bulunmalıdır.
    2. 'grid' alanı, başlangıçta görünen öğeleri içermeli; boş hücreler null olmalıdır.
    3. 'solution' alanı, sudokunun tamamlanmış halini içermelidir.
    4. 'symbols' listesi, kullanılan tüm öğeleri (harf, kelime veya görsel prompt) içermelidir.
    5. Disleksi Dostu: Yazı tipi olarak 'OpenDyslexic' veya 'Lexend' önerilir.
    
    Öğrenci Profili: ${options.studentContext?.diagnosis?.join(', ') || 'Disleksi Riski'}.
    
    ÇIKTI: JSON formatında bir dizi.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING, nullable: true } } },
                solution: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                symbols: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            value: { type: Type.STRING },
                            label: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['value']
                    }
                }
            },
            required: ['title', 'grid', 'solution', 'symbols', 'instruction']
        }
    };

    const result = await generateWithSchema(prompt, schema) as any[];
    return result.map(p => ({
        ...p,
        settings: {
            size: gridSize,
            variant: variant as any,
            fontFamily: options.fontFamily || 'OpenDyslexic'
        }
    }));
};

export const generateSynonymAntonymMatchFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymMatchData[]> => {
    const { difficulty, worksheetCount, variant = 'mixed', itemCount = 6 } = options;
    
    const modeDesc = variant === 'synonym' ? 'Sadece Eş Anlamlılar' : variant === 'antonym' ? 'Sadece Zıt Anlamlılar' : 'Eş ve Zıt Anlamlı Karışık';
    
    const prompt = `
    [ROL: UZMAN EĞİTİM MATERYALİ TASARIMCISI]
    GÖREV: "${difficulty}" seviyesinde, disleksi dostu bir "Eş ve Zıt Anlamlı Kelime Bulmacası" oluştur.
    MOD: ${modeDesc}
    ADET: ${itemCount} çift kelime ve ${Math.min(4, itemCount)} adet bağlamsal cümle.

    KURALLAR:
    1. Kelimeler somut ve disleksik bireylerin kelime dağarcığını geliştirecek nitelikte seçilmeli.
    2. "pairs" listesi: Bir kaynak kelime ve onun hedef (eş veya zıt) anlamlısını içermeli.
    3. GÖRSEL KULLANMA: Bu etkinlik sadece metin tabanlıdır, kesinlikle görsel/imagePrompt üretme.
    4. "sentences" listesi: Kelimenin cümle içindeki kullanımını ve parantez içinde bizden ne istendiğini belirt (örn: "(Zıt Anlamlısını Yaz)").
    5. Pedagojik Not: Disleksi gelişimini nasıl desteklediğini teknik ama anlaşılır açıkla.

    ÇIKTI: JSON.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                mode: { type: Type.STRING },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            source: { type: Type.STRING },
                            target: { type: Type.STRING },
                            type: { type: Type.STRING }
                        },
                        required: ['source', 'target', 'type']
                    }
                },
                sentences: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            word: { type: Type.STRING },
                            target: { type: Type.STRING },
                            type: { type: Type.STRING }
                        },
                        required: ['text', 'word', 'target', 'type']
                    }
                }
            },
            required: ['title', 'instruction', 'pairs', 'sentences']
        }
    };

    return await generateWithSchema(prompt, schema) as Promise<SynonymAntonymMatchData[]>;
};

export const generateReadingStroopFromAI = async (options: GeneratorOptions): Promise<ReadingStroopData[]> => {
    const { difficulty, worksheetCount, itemCount = 40, variant } = options;
    
    const wordTypeMap: Record<string, string> = {
        'colors': 'Temel Renk Adları (Mavi, Kırmızı, Yeşil vb.)',
        'semantic': 'Renk çağrıştıran doğa nesneleri (Limon, Deniz, Çilek, Gece vb.)',
        'confusing': 'Birbirine benzeyen çeldirici kelimeler (Mavi-Mani, Sarı-Sarı, Kara-Kasa vb.)',
        'shapes': 'Geometrik Şekil İsimleri (Kare, Üçgen, Daire, Yıldız vb.)',
        'animals': 'Hayvan İsimleri (Aslan, Kedi, Köpek, Fil vb.)',
        'verbs': 'Kısa Emir Fiilleri (Bak, Gör, Koş, Dur, Al vb.)',
        'mirror_chars': 'Ayna harflerle başlayan kelimeler (Balık, Dalga, Polat, Oluk vb. - b,d,p,q odaklı)'
    };

    const selectedWordType = wordTypeMap[variant || 'colors'];

    const prompt = `
    "${difficulty}" seviyesinde Sözel Stroop Testi üret.
    Kelimeler: ${selectedWordType} olsun.
    Adet: Sayfa başına ${itemCount} kelime.
    
    KURALLAR:
    1. Kelime ile yazıldığı renk ÇELİŞMELİDİR (Örn: "Limon" kelimesi Mavi renkle yazılmalı).
    2. Kelime ve Renk kombinasyonlarını rastgele ve dengeli dağıt.
    3. Disleksi dostu font ve yerleşim planla.
    4. Renk kodlarını (hex veya css name) çeşitlendir.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet sayfa üret.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                grid: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            color: { type: Type.STRING }
                        },
                        required: ['text', 'color']
                    }
                }
            },
            required: ['title', 'grid', 'instruction']
        }
    };

    const result = await generateWithSchema(prompt, schema) as any[];
    return result.map(p => ({
        ...p,
        settings: {
            cols: options.gridSize || 4,
            fontSize: difficulty === 'Başlangıç' ? 28 : (difficulty === 'Orta' ? 22 : 18),
            wordType: options.variant || 'colors'
        },
        evaluationBox: true
    }));
};

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    const constraints = difficulty === 'Başlangıç' 
        ? '50-80 kelime. Basit cümleler. Somut olaylar.' 
        : difficulty === 'Orta' 
            ? '100-150 kelime. Diyalog içerebilir. Günlük maceralar.' 
            : '200+ kelime. Betimlemeler, sebep-sonuç ilişkileri.';
    
    const prompt = `
    "${topic}" konusunda, ${difficulty} seviyesinde (${constraints}) özgün bir hikaye yaz.
    
    EKSTRA GÖREVLER (JSON ÇIKTISINDA ZORUNLU):
    1. **vocabulary:** Hikayeden ${difficulty === 'Başlangıç' ? '3' : '4'} adet "öğrenilmesi gereken" veya "zor" kelime seç ve kısa, child-friendly tanımlarını yaz.
    2. **creativeTask:** Öğrencinin hikayeyle ilgili yapabileceği bir çizim veya kısa yazma görevi ver.
    3. **questions:** 
       - 2 adet Çoktan Seçmeli (4 şıklı).
       - 1 adet Doğru/Yanlış.
       - 1 adet Açık Uçlu (Yorum/Çıkarım).
    
    GÖRSEL PROMPT: Hikayenin en can alıcı sahnesini betimleyen, çocuklar için uygun, renkli, "storybook illustration" tarzında İngilizce bir prompt yaz.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            mainIdea: { type: Type.STRING },
            characters: { type: Type.ARRAY, items: { type: Type.STRING } },
            setting: { type: Type.STRING },
            vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        definition: { type: Type.STRING }
                    },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['multiple-choice', 'true-false', 'open-ended'] },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                        answer: { type: Type.STRING },
                        isTrue: { type: Type.BOOLEAN, nullable: true }
                    },
                    required: ['type', 'question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions', 'pedagogicalNote', 'vocabulary', 'creativeTask']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    
    return generateWithSchema(prompt, schema) as Promise<StoryData[]>;
};

export const generateStoryAnalysisFromAI = async (o: GeneratorOptions) => [] as any; 
export const generateStoryCreationPromptFromAI = async (o: GeneratorOptions) => [] as any;
export const generateWordsInStoryFromAI = async (o: GeneratorOptions) => [] as any;
export const generateStorySequencingFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSayingSortFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbWordChainFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbFillInTheBlankFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSearchFromAI = async (o: GeneratorOptions) => [] as any;
export const generateProverbSentenceFinderFromAI = async (o: GeneratorOptions) => [] as any;
