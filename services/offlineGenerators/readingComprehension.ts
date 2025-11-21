
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, ProverbSearchData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, STORY_TEMPLATES, SAYINGS } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

// --- OFFLINE DATA POOLS ---

const logicalStories = [
    {
        theme: "Bir Tohumun Hikayesi",
        panels: [
            { id: 'A', description: 'Ayşe toprağı kazdı ve küçük bir fasulye tohumu ekti.' },
            { id: 'B', description: 'Her gün tohumu suladı ve güneş almasını sağladı.' },
            { id: 'C', description: 'Topraktan küçük yeşil bir filiz çıktı.' },
            { id: 'D', description: 'Filiz büyüdü, sarmaşıkları uzadı ve fasulyeler verdi.' }
        ]
    },
    {
        theme: "Yaramaz Kedi Mırnav",
        panels: [
            { id: 'A', description: 'Kedi Mırnav acıkmıştı ve sessizce mutfağa gitti.' },
            { id: 'B', description: 'Tezgahın üzerinde bir süt şişesi gördü.' },
            { id: 'C', description: 'Merakla zıplayıp şişeyi devirdi, süt her yere döküldü.' },
            { id: 'D', description: 'Sahibinin ayak seslerini duyunca masanın altına saklandı.' }
        ]
    },
    {
        theme: "Lezzetli Bir Kek",
        panels: [
            { id: 'A', description: 'Can, annesiyle kek yapmak için malzemeleri hazırladı: un, şeker, yumurta.' },
            { id: 'B', description: 'Tüm malzemeleri büyük bir kapta özenle karıştırdılar.' },
            { id: 'C', description: 'Karışımı kek kalıbına döküp önceden ısıtılmış fırına verdiler.' },
            { id: 'D', description: 'Mis gibi kokan keki fırından çıkarıp afiyetle yediler.' }
        ]
    },
    {
        theme: "Kış Eğlencesi",
        panels: [
            { id: 'A', description: 'Lapa lapa kar yağınca Efe ve babası bahçeye çıktı.' },
            { id: 'B', description: 'Önce küçük bir kar topu yapıp onu karda yuvarlayarak büyüttüler.' },
            { id: 'C', description: 'İki büyük kar topunu üst üste koyup kardan adamın gövdesini yaptılar.' },
            { id: 'D', description: 'Kardan adama havuçtan burun, kömürden göz ve eski bir atkı taktılar.' }
        ]
    }
];

const proverbUsagePrompts = [
    'Seçtiğin bir atasözünü günlük hayattan bir olayla ilişkilendirerek anlat.',
    'Bu atasözlerinden bir tanesiyle ilgili kısa bir anını yaz.',
    'Bir atasözü seç ve bu atasözünün sana ne öğrettiğini açıkla.',
    'Listeden bir atasözü seç ve ana fikrini anlatan kısa bir resim çiz.'
];

const storyCreationPrompts = [
    "Aşağıdaki kelimeleri kullanarak, içinde en az bir diyalog geçen bir hikaye yaz.",
    "Bu anahtar kelimelerle başlayıp beklenmedik bir sonla biten bir macera kurgula.",
    "Seçtiğin üç kelimeyi kullanarak komik bir olay anlatan kısa bir metin oluştur."
];

// --- Helper: Generate Logic-Based Story ---
const generateLogicBasedStory = (topic?: string, characterName?: string) => {
    const template = getRandomItems(STORY_TEMPLATES, 1)[0];
    let story = template.template;
    const placeholders = [...story.matchAll(/{(\w+)}/g)];
    const uniqueKeys = [...new Set(placeholders.map(p => p[1]))];
    const usedValues: { [key: string]: string } = {};

    uniqueKeys.forEach(key => {
        const pluralKey = `${key}s`;
        const dataArray = ((template as any)[pluralKey] || []) as string[];
        let value: string | undefined = '';
        if (key === 'character' && characterName) {
            value = characterName;
        } else if (dataArray && dataArray.length > 0) {
            value = getRandomItems(dataArray, 1)[0];
        }
        
        if (value) {
            usedValues[key] = value;
            story = story.replace(new RegExp(`{${key}}`, 'g'), value);
        }
    });
    
    story = story.replace(/{.*?}/g, '...').trim();
    return { story, usedValues, template };
};

// --- GENERATOR FUNCTIONS ---

export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, characterName } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, usedValues, template } = generateLogicBasedStory(topic, characterName);
        const questions: StoryQuestion[] = [];

        const literalKey = getRandomItems(Object.keys(usedValues).filter(k => !['adjective', 'weather'].includes(k)), 1)[0] as string;
        if (literalKey && usedValues[literalKey]) {
            const answer = usedValues[literalKey];
            const pool = ((template as any)[`${literalKey}s`] || []) as string[];
            const distractors = getRandomItems(pool.filter(item => item !== answer), 2);
            questions.push({
                type: 'multiple-choice',
                question: `Hikayedeki ${literalKey} neydi/kimdi?`,
                options: shuffle([answer, ...distractors]),
                answerIndex: 0 
            });
        }

        questions.push({
            type: 'open-ended',
            question: `Sence ${usedValues['character'] || 'ana karakter'} hikayenin sonunda ne hissetmiştir? Neden?`
        });

        questions.push({
            type: 'open-ended',
            question: `Eğer hikayenin yazarı sen olsaydın, sonunu nasıl değiştirirdin?`
        });

        questions.forEach(q => {
            if (q.type === 'multiple-choice' && q.options.length > 0) {
                const correctAnswer = q.options[q.answerIndex];
                shuffle(q.options);
                q.answerIndex = q.options.indexOf(correctAnswer);
            }
        });

        results.push({ 
            title: `Hikaye Anlama: ${usedValues['character'] || 'Bir Macera'}`, 
            story, 
            questions: shuffle(questions),
            characters: [usedValues['character']].filter(Boolean), 
            mainIdea: 'Olayların akışını ve detayları anlama.', 
            setting: usedValues['place'] || 'Bilinmeyen bir diyar',
            pedagogicalNote: "Bloom taksonomisine göre (Hatırlama, Çıkarım, Değerlendirme) sorular içerir."
        });
    }
    return results;
};

export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => ({
        title: `Hikaye Oluşturma: ${topic || 'Serbest Tema'}`,
        prompt: getRandomItems(storyCreationPrompts, 1)[0],
        keywords: getRandomItems(getWordsForDifficulty(difficulty, topic), itemCount),
        pedagogicalNote: "Yaratıcı yazma, kelime kullanımı ve hikaye kurgulama becerisini geliştirir."
    }));
};

export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const { story } = generateLogicBasedStory(topic);
        const words = story.split(' ').map(w => w.replace(/[.,!?]/g, '').toLowerCase());
        const candidates = [...new Set(words.filter(w => w.length > 4 && w.length < 8))];
        const selectedWords = getRandomItems(candidates, 4);

        return { 
            title: 'Metindeki Kelimeler', 
            story, 
            questions: selectedWords.map(word => ({
                word,
                question: `Bu kelimenin anlamını tahmin et ve farklı bir cümlede kullan.`
            })),
            pedagogicalNote: "Bağlamdan kelime anlamı çıkarma ve kelime dağarcığı geliştirme."
        };
    });
};

export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic } = options;
    return Array.from({ length: worksheetCount }, () => {
         const { story, usedValues } = generateLogicBasedStory(topic);
         return {
             title: 'Hikaye Analizi',
             story,
             analysisQuestions: shuffle([
                 { type: 'tema', question: 'Bu hikayeye en uygun başlık ne olurdu? Neden?' },
                 { type: 'karakter', question: `${usedValues['character'] || 'Ana karakter'} sence nasıl biri? Hikayeden bir örnek ver.` },
                 { type: 'sebep-sonuç', question: `Hikayedeki en önemli olay neydi ve bu olayın sonucu ne oldu?` },
                 { type: 'çıkarım', question: 'Hikayenin geçtiği yer hakkında neler hayal edebilirsin?' }
             ]),
             pedagogicalNote: "Metnin derin yapısını (tema, karakter, kurgu) analiz etme ve eleştirel düşünme becerisi."
         };
    });
};

export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount } = options;
    const results: StorySequencingData[] = [];
    
    for (let i = 0; i < worksheetCount; i++) {
        const selectedStory = getRandomItems(logicalStories, 1)[0];
        const shuffledPanels = shuffle(selectedStory.panels.map(p => ({...p}))); // Clone to safely shuffle
        
        results.push({
            title: `Hikaye Sıralama: ${selectedStory.theme} (Hızlı Mod)`,
            prompt: "Karışık verilen resim ve olayları doğru oluş sırasına göre dizin.",
            pedagogicalNote: "Olay örgüsü kurma ve mantıksal sıralama becerisi.",
            panels: shuffledPanels.map(p => ({
                id: p.id,
                description: p.description,
                imageBase64: '' // Empty for offline fast mode
            }))
        });
    }
    return results;
};

export const generateOfflineProverbFillInTheBlank = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const proverbs = getRandomItems(PROVERBS, itemCount).map(p => {
            const words = p.split(' ');
            const candidateIndices = words.map((w, i) => ({w, i})).filter(x => x.w.length > 3 && !['bir', 'için', 'kadar'].includes(x.w)).map(x => x.i);
            const blankIndex = candidateIndices.length > 0 ? getRandomItems(candidateIndices, 1)[0] : getRandomInt(1, words.length - 2);
            
            return {
                start: words.slice(0, blankIndex).join(' '),
                end: words.slice(blankIndex + 1).join(' '),
                full: p
            };
        });
        return { 
            title: 'Atasözü Tamamlama',
            proverbs,
            meaning: 'Atasözleri, atalarımızın uzun deneyimler sonucu oluşturduğu, öğüt verici sözlerdir.',
            usagePrompt: getRandomItems(proverbUsagePrompts, 1)[0],
            pedagogicalNote: "Kültürel miras aktarımı ve semantik tamamlama (Cloze Test) becerisi."
        };
    });
};

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const proverbs = getRandomItems(PROVERBS, Math.ceil(itemCount / 2)).map(p => ({ text: p, type: 'atasözü' as const }));
        const sayings = getRandomItems(SAYINGS, Math.floor(itemCount / 2)).map(s => ({ text: s, type: 'özdeyiş' as const }));
        return {
            title: 'Atasözü mü, Özdeyiş mi?',
            prompt: 'Cümleleri incele; söyleyeni belli değilse "Atasözü", belli ise "Özdeyiş" olarak sınıflandır.',
            items: shuffle([...proverbs, ...sayings]),
            pedagogicalNote: "Bilgi kaynağını ayırt etme (anonim vs. bireysel) ve sınıflandırma becerisi."
        };
    });
};

export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const solutions = getRandomItems(PROVERBS, itemCount);
        const wordCloud = solutions.flatMap(s => s.replace(/[.,]/g, '').split(' ')).map(word => ({
            word, 
            color: getRandomItems(['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'], 1)[0]
        }));
        return {
            title: 'Atasözü Zinciri', 
            prompt: 'Dağınık kelimeleri birleştirerek anlamlı atasözleri oluştur.', 
            wordCloud: shuffle(wordCloud), 
            solutions,
            pedagogicalNote: "Sözdizimi (sentaks) kuralları ve anlamsal bütünlük oluşturma becerisi."
        };
    });
};

export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({ ...r, title: 'Cümle Bulmaca (Atasözü)' }));
};

export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount, gridSize, difficulty } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(PROVERBS.filter(p => p.length < 30), 1)[0]; 
        const searchResult = await generateOfflineWordSearch({ ...options, words: proverb.replace(/[.,]/g, '').split(' '), itemCount: 1, worksheetCount: 1, gridSize });
        results.push({
            title: 'Atasözü Avı',
            instruction: "Bulmacada gizlenmiş atasözünü bul ve anlamını öğren.",
            grid: searchResult[0].grid,
            proverb: proverb,
            meaning: 'Atasözünün içerdiği kelimeleri bulmacada bul.',
            pedagogicalNote: "Görsel tarama ve parça-bütün ilişkisi kurarak anlamsal bütünlüğe ulaşma."
        });
    }
    return results;
};
