
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, StoryData, ReadingStroopData, SynonymAntonymMatchData, ReadingSudokuData, StoryAnalysisData, StorySequencingData, MissingPartsData } from '../../types.js';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI & PSİKOMETRİST]
Amaç: Disleksik çocuklarda dürtü kontrolü, odaklanma ve sözel enterferans (karışma) direncini artırmak.
Tasarım: Sözel Stroop Testi (Verbal Stroop) bir A4 sayfasını dolduracak yoğunlukta olmalıdır.
`;

export const generateReadingSudokuFromAI = async (options: GeneratorOptions): Promise<ReadingSudokuData[]> => {
    const { difficulty, _worksheetCount, variant = 'letters', gridSize = 4 } = options as Record<string, unknown>;

    const variantDesc = {
        'letters': 'Dislekside sık karıştırılan harf çiftleri (b-d, p-q, m-n vb.) veya sesli harfler.',
        'words': 'Aynı temaya ait (uzay, meyveler, duygular) kısa ve somut kelimeler.',
        'visuals': 'Semboller veya piktogramlar (yıldız, kare, üçgen vb.)',
        'numbers': 'Sayısal veriler.'
    }[variant as unknown as string] || 'Harfler';

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

    const         schema = {
        type: 'ARRAY',
        description: 'Dil Sudokusu sayfaları',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING', description: 'Etkinlik başlığı' },
                instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
                grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING', nullable: true } }, description: 'Başlangıç ızgarası (null=boş)' },
                solution: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Tamamlanmış çözüm ızgarası' },
                symbols: {
                    type: 'ARRAY',
                    description: 'Kullanılan sembol/harf listesi',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            value: { type: 'STRING', description: 'Sembol değeri' },
                            label: { type: 'STRING', description: 'Görünen etiket' },
                            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
                        },
                        required: ['value']
                    }
                }
            },
            required: ['title', 'grid', 'solution', 'symbols', 'instruction']
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map(p => ({
        ...p,
        settings: {
            size: gridSize,
            variant: variant as unknown as any,
            fontFamily: options.fontFamily || 'OpenDyslexic'
        }
    }));
};

export const generateSynonymAntonymMatchFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymMatchData[]> => {
    const { difficulty, _worksheetCount, variant = 'mixed', itemCount = 6 } = options as Record<string, unknown>;

    const modeDesc = variant === 'synonym' ? 'Sadece Eş Anlamlılar' : variant === 'antonym' ? 'Sadece Zıt Anlamlılar' : 'Eş ve Zıt Anlamlı Karışık';

    const prompt = `
    [ROL: UZMAN EĞİTİM MATERYALİ TASARIMCISI]
    GÖREV: "${difficulty}" seviyesinde, disleksi dostu bir "Eş ve Zıt Anlamlı Kelime Bulmacası" oluştur.
    MOD: ${modeDesc}
    ADET: ${(itemCount as number) || 0} çift kelime ve ${Math.min(4, (itemCount as number) || 0)} adet bağlamsal cümle.

    KURALLAR:
    1. Kelimeler somut ve disleksik bireylerin kelime dağarcığını geliştirecek nitelikte seçilmeli.
    2. "pairs" listesi: Bir kaynak kelime ve onun hedef (eş veya zıt) anlamlısını içermeli.
    3. GÖRSEL KULLANMA: Bu etkinlik sadece metin tabanlıdır, kesinlikle görsel/imagePrompt üretme.
    4. "sentences" listesi: Kelimenin cümle içindeki kullanımını ve parantez içinde bizden ne istendiğini belirt (örn: "(Zıt Anlamlısını Yaz)").

    ÇIKTI: JSON.
    `;

    const     schema = {
        type: 'ARRAY',
        description: 'Eş/Zıt anlam bulmaca sayfaları',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING', description: 'Etkinlik başlığı' },
                instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
                mode: { type: 'STRING', description: 'synonym|antonym|mixed' },
                pairs: {
                    type: 'ARRAY',
                    description: 'Kelime çiftleri',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            source: { type: 'STRING', description: 'Kaynak kelime' },
                            target: { type: 'STRING', description: 'Eş/Zıt anlamlısı' },
                            type: { type: 'STRING', description: 'synonym veya antonym' }
                        },
                        required: ['source', 'target', 'type']
                    }
                },
                sentences: {
                    type: 'ARRAY',
                    description: 'Bağlam cümleleri',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            text: { type: 'STRING', description: 'Cümle metni' },
                            word: { type: 'STRING', description: 'Hedef kelime' },
                            target: { type: 'STRING', description: 'İstenen cevap' },
                            type: { type: 'STRING', description: 'synonym veya antonym' }
                        },
                        required: ['text', 'word', 'target', 'type']
                    }
                }
            },
            required: ['title', 'instruction', 'pairs', 'sentences']
        }
    };

    return await generateWithSchema(prompt, schema) as unknown as Promise<SynonymAntonymMatchData[]>;
};

export const generateReadingStroopFromAI = async (options: GeneratorOptions): Promise<ReadingStroopData[]> => {
    const { difficulty, worksheetCount, itemCount = 40, variant } = options as Record<string, unknown>;

    const wordTypeMap: Record<string, string> = {
        'colors': 'Temel Renk Adları (Mavi, Kırmızı, Yeşil vb.)',
        'semantic': 'Renk çağrıştıran doğa nesneleri (Limon, Deniz, Çilek, Gece vb.)',
        'confusing': 'Birbirine benzeyen çeldirici kelimeler (Mavi-Mani, Sarı-Sarı, Kara-Kasa vb.)',
        'shapes': 'Geometrik Şekil İsimleri (Kare, Üçgen, Daire, Yıldız vb.)',
        'animals': 'Hayvan İsimleri (Aslan, Kedi, Köpek, Fil vb.)',
        'verbs': 'Kısa Emir Fiilleri (Bak, Gör, Koş, Dur, Al vb.)',
        'mirror_chars': 'Ayna harflerle başlayan kelimeler (Balık, Dalga, Polat, Oluk vb. - b,d,p,q odaklı)'
    };

    const selectedWordType = wordTypeMap[(variant as string) || 'colors'];

    const prompt = `
    "${difficulty}" seviyesinde Sözel Stroop Testi üret.
    Kelimeler: ${selectedWordType} olsun.
    Adet: Sayfa başına ${itemCount} kelime.
    
    KURALLAR:
    1. Kelime ile yazıldığı renk ÇELİŞMELİDİR (Örn: "Limon" kelimesi Mavi renkle yazılmalı).
    2. Kelime ve Renk kombinasyonlarını rastgele ve dengeli dağıt.
    3. Disleksi dostu font ve yerleşim planla.
    4. Renk kodlarını (hex veya css name) çeşitlendir.
    
    ${worksheetCount} adet sayfa üret.
    `;

    const     schema = {
        type: 'ARRAY',
        description: 'Stroop test sayfaları',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING', description: 'Etkinlik başlığı' },
                instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
                grid: {
                    type: 'ARRAY',
                    description: 'Kelime-renk eşleşmeleri',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            text: { type: 'STRING', description: 'Yazılacak kelime' },
                            color: { type: 'STRING', description: 'Kelimenin rengi (çelişen)' }
                        },
                        required: ['text', 'color']
                    }
                }
            },
            required: ['title', 'grid', 'instruction']
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    let result: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(result)) result = [result];

    return result.filter(p => p && typeof p === 'object').map(p => ({
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
    const { topic, difficulty, worksheetCount } = options as Record<string, unknown>;

    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();

    const constraints = difficulty === 'Başlangıç'
        ? '50-80 kelime. Basit cümleler. Somut olaylar.'
        : difficulty === 'Orta'
            ? '100-150 kelime. Diyalog içerebilir. Günlük maceralar.'
            : '200+ kelime. Betimlemeler, sebep-sonuç ilişkileri.';

    const prompt = `
    "${topic}" konusunda, ${difficulty} seviyesinde (${constraints}) özgün bir hikaye yaz.
    
    ⚠️ KRİTİK: HER ÜRETİMDE TAMAMEN FARKLI HİKAYE!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı hikaye, aynı karakterler, aynı olayları tekrar etme
    - Her üretimde yeni kelimeler, yeni sorular, yeni görevler
    
    EKSTRA GÖREVLER (JSON ÇIKTISINDA ZORUNLU):
    1. **vocabulary:** Hikayeden ${difficulty === 'Başlangıç' ? '3' : '4'} adet "öğrenilmesi gereken" veya "zor" kelime seç ve kısa, child-friendly tanımlarını yaz.
    2. **creativeTask:** Öğrencinin hikayeyle ilgili yapabileceği bir çizim veya kısa yazma görevi ver.
    3. **questions:** 
       - 2 adet Çoktan Seçmeli (4 şıklı).
       - 1 adet Doğru/Yanlış.
       - 1 adet Açık Uçlu (Yorum/Çıkarım).
    
    GÖRSEL PROMPT: Hikayenin en can alıcı sahnesini betimleyen, çocuklar için uygun, renkli, "storybook illustration" tarzında İngilizce bir prompt yaz.
    
    ${worksheetCount} adet üret.
    `;

    const     singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Hikaye başlığı' },
            story: { type: 'STRING', description: 'Hikaye metni' },
            imagePrompt: { type: 'STRING', description: 'Sahne görseli promptu (İngilizce)' },
            mainIdea: { type: 'STRING', description: 'Ana fikir özeti' },
            characters: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Karakter listesi' },
            setting: { type: 'STRING', description: 'Hikaye mekanı/zamanı' },
            vocabulary: {
                type: 'ARRAY',
                description: 'Öğrenilmesi gereken kelimeler',
                items: {
                    type: 'OBJECT',
                    properties: {
                        word: { type: 'STRING', description: 'Hedef kelime' },
                        definition: { type: 'STRING', description: 'Çocuk dostu tanım' }
                    },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: 'STRING', description: 'Yaratıcı görev yönergesi' },
            questions: {
                type: 'ARRAY',
                description: 'Okuduğunu anlama soruları',
                items: {
                    type: 'OBJECT',
                    properties: {
                        type: { type: 'STRING', enum: ['multiple-choice', 'true-false', 'open-ended'], description: 'Soru türü' },
                        question: { type: 'STRING', description: 'Soru metni' },
                        options: { type: 'ARRAY', items: { type: 'STRING' }, nullable: true, description: 'Çoktan seçmeli şıklar' },
                        answer: { type: 'STRING', description: 'Doğru cevap' },
                        isTrue: { type: 'BOOLEAN', nullable: true, description: 'Doğru/Yanlış sorusu için' }
                    },
                    required: ['type', 'question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions', 'vocabulary', 'creativeTask']
    };

    const schema = { type: 'ARRAY', description: 'Hikaye sayfaları', items: singleSchema };

    return generateWithSchema(prompt, schema) as unknown as Promise<StoryData[]>;
};

// generateMissingPartsFromAI yeni dosyasına taşındı.

export const generateStoryCreationPromptFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateWordsInStoryFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateProverbSayingSortFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateProverbWordChainFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateProverbFillInTheBlankFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateProverbSearchFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
export const generateProverbSentenceFinderFromAI = async (_o: GeneratorOptions) => [] as unknown as any;
