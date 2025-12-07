
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, ProverbSearchData, MissingPartsData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, SAYINGS, DYNAMIC_STORY_MODULES } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

// --- HELPER: Advanced Story Assembler with Vocabulary Control ---
const buildDynamicStory = (difficulty: string, topic?: string, characterName?: string) => {
    // Difficulty Settings: [Sentence Count, Avg Word Length, Abstractness]
    let config = { sentences: 5, complexity: 1 };
    if (difficulty === 'Orta') config = { sentences: 10, complexity: 2 };
    if (difficulty === 'Zor') config = { sentences: 15, complexity: 3 };
    if (difficulty === 'Uzman') config = { sentences: 20, complexity: 4 };

    // 1. Select Modules based on logic flow
    const intro = getRandomItems(DYNAMIC_STORY_MODULES.intros, 1)[0];
    const conclusion = getRandomItems(DYNAMIC_STORY_MODULES.conclusions, 1)[0];
    
    let bodyCount = Math.max(2, config.sentences - 2);
    let actions: string[] = [];
    
    // Ensure varied actions
    const availableActions = shuffle([...DYNAMIC_STORY_MODULES.actions]);
    while(actions.length < bodyCount) {
        if(availableActions.length === 0) availableActions.push(...DYNAMIC_STORY_MODULES.actions);
        actions.push(availableActions.pop()!);
    }
    
    // 3. Assemble
    const storyTemplate = [intro, ...actions, conclusion].join(' ');

    // 4. Personalize
    let story = storyTemplate;
    const fillers = DYNAMIC_STORY_MODULES.fillers;
    
    const chosenValues: Record<string, string> = {
        character: characterName || getRandomItems(fillers.characters, 1)[0],
        place: getRandomItems(fillers.places, 1)[0],
        object: getRandomItems(fillers.objects, 1)[0],
        friend: getRandomItems(fillers.friends, 1)[0],
        animal: getRandomItems(fillers.animals, 1)[0],
        food: getRandomItems(fillers.foods, 1)[0],
        activity: getRandomItems(fillers.activities, 1)[0],
        adjective: getRandomItems(fillers.adjectives, 1)[0]
    };

    Object.keys(chosenValues).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        story = story.replace(regex, chosenValues[key]);
    });

    return { story, chosenValues };
};

// --- GENERATOR 1: STORY COMPREHENSION (Expanded) ---
export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, characterName, difficulty } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, chosenValues } = buildDynamicStory(difficulty, topic, characterName);
        
        const questions: StoryQuestion[] = [];
        
        // 1. Literal Questions (Multiple Choice)
        questions.push({
            type: 'multiple-choice',
            question: "Hikayenin baş kahramanı kimdir?",
            options: shuffle([chosenValues.character, chosenValues.friend, 'Bir Öğretmen', 'Bilinmiyor']),
            answerIndex: 0
        });

        questions.push({
            type: 'multiple-choice',
            question: "Olay nerede geçmektedir?",
            options: shuffle([chosenValues.place, 'Okul bahçesinde', 'Evde', 'Uzayda']),
            answerIndex: 0
        });

        // 2. Inferential Question (Open Ended)
        questions.push({
            type: 'open-ended',
            question: `Sence ${chosenValues.character} neden böyle hissetmiş olabilir?`,
            spaceLines: 3
        });

        // 3. True/False Questions
        const tfStatements = [
            { statement: `${chosenValues.character}, ${chosenValues.place} mekanına gitti.`, isTrue: true },
            { statement: `Hikayede bir ${chosenValues.animal} ile karşılaşıldı.`, isTrue: story.includes(chosenValues.animal) },
            { statement: `${chosenValues.character} tek başına değildi, yanında ${chosenValues.friend} vardı.`, isTrue: story.includes(chosenValues.friend) },
            { statement: "Olay gece yarısı, zifiri karanlıkta geçti.", isTrue: false }
        ];
        
        // Select 2 relevant T/F
        const selectedTF = tfStatements.slice(0, difficulty === 'Başlangıç' ? 2 : 4);
        selectedTF.forEach(tf => {
            questions.push({ type: 'true-false', ...tf });
        });

        results.push({ 
            title: `Okuma Anlama: ${chosenValues.character}'in Macerası`,
            instruction: "Hikayeyi dikkatlice oku ve soruları cevapla.",
            story, 
            questions: questions,
            characters: [chosenValues.character, chosenValues.friend].filter(c => story.includes(c)), 
            mainIdea: 'Dikkatli okuma, detayları fark etme ve çıkarım yapma.', 
            setting: chosenValues.place,
            pedagogicalNote: `${difficulty} seviyesinde okuma anlama. 5N1K soruları ve çıkarım yapma becerileri desteklenmektedir.`,
            imagePrompt: `${chosenValues.character} in ${chosenValues.place} with a ${chosenValues.object}` // Precise prompt
        });
    }
    return results;
};

// --- GENERATOR 2: STORY CREATION (Writer's Workshop) ---
export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const fillers = DYNAMIC_STORY_MODULES.fillers;
        
        // Define theme-based hints for better context if a topic is provided
        let specificHints = null;
        let themeTitle = "Hikaye Atölyesi";
        let imagePrompt = `Creative writing inspiration notebook`;

        if (topic === 'space') {
            specificHints = {
                who: getRandomItems(['Astronot Efe', 'Uzaylı Zorg', 'Kaptan Yıldız'], 1)[0],
                where: getRandomItems(['Mars Gezegeni', 'Ay Üssü', 'Kuyruklu Yıldız'], 1)[0],
                when: getRandomItems(['3025 yılında', 'Roket kalkarken', 'Gece yarısı'], 1)[0],
                problem: getRandomItems(['Yakıt bitti', 'İletişim koptu', 'Meteor yaklaşıyor'], 1)[0]
            };
            themeTitle = "Uzay Macerası";
            imagePrompt = "Astronaut in space rocket ship planets";
        } else if (topic === 'animals') {
            specificHints = {
                who: getRandomItems(['Aslan Kral', 'Minik Tavşan', 'Bilge Baykuş'], 1)[0],
                where: getRandomItems(['Büyülü Orman', 'Hayvanat Bahçesi', 'Nehir Kenarı'], 1)[0],
                when: getRandomItems(['Güneş doğarken', 'Kış uykusundan önce', 'Bahar sabahı'], 1)[0],
                problem: getRandomItems(['Yuvasını kaybetti', 'Karnı acıktı', 'Arkadaşını bulamadı'], 1)[0]
            };
            themeTitle = "Hayvanlar Alemi";
            imagePrompt = "Forest animals lion rabbit owl woods";
        } else if (topic === 'school') {
            specificHints = {
                who: getRandomItems(['Yeni Öğrenci', 'Öğretmen', 'Yaramaz Can'], 1)[0],
                where: getRandomItems(['Okul Bahçesi', 'Sınıf', 'Kütüphane'], 1)[0],
                when: getRandomItems(['Teneffüs zili çalınca', 'Sınav sırasında', 'Okulun ilk günü'], 1)[0],
                problem: getRandomItems(['Ödevini unuttu', 'Topu patladı', 'Geç kaldı'], 1)[0]
            };
            themeTitle = "Okul Hikayesi";
            imagePrompt = "School classroom students books blackboard";
        } else if (topic === 'nature') {
            specificHints = {
                who: getRandomItems(['Doğa Kaşifi', 'Kampçı', 'Dağcı Ali'], 1)[0],
                where: getRandomItems(['Kamp Alanı', 'Şelale', 'Yüksek Dağ'], 1)[0],
                when: getRandomItems(['Fırtına çıkınca', 'Güneş batarken', 'Yürüyüş yaparken'], 1)[0],
                problem: getRandomItems(['Çadırı uçtu', 'Yolu kaybetti', 'Ayı gördü'], 1)[0]
            };
            themeTitle = "Doğa Gezisi";
            imagePrompt = "Camping tent nature mountains river";
        } else if (topic === 'fantasy') {
            specificHints = {
                who: getRandomItems(['Prenses Elif', 'Cesur Şövalye', 'Küçük Ejderha'], 1)[0],
                where: getRandomItems(['Bulutlar Ülkesi', 'Kristal Mağara', 'Uçan Kale'], 1)[0],
                when: getRandomItems(['Dolunayda', 'Sihir yaparken', 'Yüzyıllar önce'], 1)[0],
                problem: getRandomItems(['Asası kırıldı', 'Ejderha uyandı', 'Büyü bozuldu'], 1)[0]
            };
            themeTitle = "Masal Diyarı";
            imagePrompt = "Fantasy castle dragon princess magic";
        }

        const hints = specificHints || {
            who: getRandomItems(fillers.characters, 1)[0],
            where: getRandomItems(fillers.places, 1)[0],
            when: getRandomItems(['Sabah erkenden', 'Fırtınalı bir gece', 'Okul çıkışı', 'Yaz tatilinde'], 1)[0],
            problem: getRandomItems(['Anahtar kayboldu', 'Yolunu kaybetti', 'Gizemli bir ses duydu', 'Arkadaşı gelmedi'], 1)[0]
        };

        // Determine keywords based on topic or difficulty
        let keywordsPool = getWordsForDifficulty(difficulty, topic && topic !== 'Rastgele' && topic !== 'fantasy' && topic !== 'space' && topic !== 'nature' ? topic : undefined);
        
        // Add topic specific words manually if getWordsForDifficulty returns generic
        if (topic === 'space') keywordsPool = ['roket', 'yıldız', 'gezegen', 'astronot', 'uzaylı', ...keywordsPool];
        if (topic === 'fantasy') keywordsPool = ['sihir', 'ejderha', 'kale', 'prenses', 'hazine', ...keywordsPool];
        if (topic === 'nature') keywordsPool = ['ağaç', 'nehir', 'kamp', 'çadır', 'ateş', ...keywordsPool];

        return {
            title: `${themeTitle} (${difficulty})`,
            prompt: "Aşağıdaki ipuçlarını ve 5N 1K tablosunu kullanarak kendi özgün hikayeni oluştur.",
            instruction: "İpuçlarını kullanarak hikayeni yaz.",
            keywords: getRandomItems(keywordsPool, 5),
            structureHints: hints,
            pedagogicalNote: "Yaratıcı yazma, olay örgüsü kurma ve hikaye unsurlarını (karakter, mekan, zaman, olay) yapılandırma becerisi.",
            imagePrompt: imagePrompt
        };
    });
};

// --- GENERATOR 3: TEXT ANALYSIS (Context Clues) ---
export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const { story, chosenValues } = buildDynamicStory(difficulty, topic);
        const words = story.split(' ').map(w => w.replace(/[.,!?]/g, ''));
        // Select interesting words (longer than 4 chars)
        const candidates = [...new Set(words.filter(w => w.length > 4))];
        const selectedWords = getRandomItems(candidates, 4);

        return { 
            title: 'Bağlamdan Anlam Çıkarma',
            instruction: "Metni oku ve kelimelerin anlamlarını tahmin et.",
            story, 
            vocabWork: selectedWords.map(word => ({
                word,
                type: Math.random() > 0.5 ? 'meaning' : (Math.random() > 0.5 ? 'synonym' : 'antonym'),
                contextQuestion: `Hikayede geçen "${word}" kelimesi sence ne anlama geliyor? İpucu: Cümlenin geri kalanına bak.`
            })),
            questions: [], // Deprecated field kept for type compatibility if needed
            pedagogicalNote: "Bilinmeyen kelimelerin anlamını bağlam ipuçlarını kullanarak tahmin etme stratejisi.",
            imagePrompt: `${chosenValues.character} reading a book`
        };
    });
};

// --- GENERATOR 4: STORY ANALYSIS (Story Map) ---
export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
         const { story, chosenValues } = buildDynamicStory(difficulty, topic);
         return {
             title: 'Hikaye Haritası',
             instruction: "Hikaye haritasını doldur.",
             story,
             storyMap: {
                 characters: chosenValues.character + (story.includes(chosenValues.friend) ? `, ${chosenValues.friend}` : ''),
                 setting: chosenValues.place,
                 problem: 'Karakterin karşılaştığı zorluk veya macera nedir?',
                 solution: 'Hikaye nasıl bitti? Sorun nasıl çözüldü?',
                 theme: 'Hikayenin ana fikri veya bize verdiği ders nedir?'
             },
             analysisQuestions: [], // Deprecated
             pedagogicalNote: "Hikaye unsurlarını ayrıştırma, analiz etme ve özetleme becerisi.",
             imagePrompt: `Story map path journey ${chosenValues.place}`
         };
    });
};

// --- GENERATOR 5: STORY SEQUENCING (Expanded) ---
export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount, difficulty } = options;
    
    // More complex sequences for higher levels
    const sequences = [
        { 
            steps: [
                { desc: 'Çiftçi tarlayı sürdü.', order: 1, img: 'Farmer plowing field tractor' },
                { desc: 'Tohumları toprağa ekti.', order: 2, img: 'Farmer planting seeds soil' },
                { desc: 'Yağmur yağdı ve tohumlar filizlendi.', order: 3, img: 'Rain watering small plant sprout' },
                { desc: 'Başaklar büyüdü ve sarardı.', order: 4, img: 'Golden wheat field' },
                { desc: 'Çiftçi buğdayları hasat etti.', order: 5, img: 'Farmer harvesting wheat' },
                { desc: 'Değirmende un yapıldı.', order: 6, img: 'Flour mill windmill sacks of flour' }
            ]
        },
        {
            steps: [
                { desc: 'Ayşe kütüphaneye gitti.', order: 1, img: 'Girl walking to library building' },
                { desc: 'İstediği kitabı raflarda aradı.', order: 2, img: 'Girl looking at bookshelves' },
                { desc: 'Kitabı bulup masaya oturdu.', order: 3, img: 'Girl sitting at table with book' },
                { desc: 'Okumaya başladı ve çok beğendi.', order: 4, img: 'Girl reading book happily' },
                { desc: 'Kitabı ödünç almak için görevliye gitti.', order: 5, img: 'Girl checking out book at desk' }
            ]
        },
        {
            steps: [
                { desc: 'Kek için malzemeleri hazırladık.', order: 1, img: 'Baking ingredients flour eggs sugar on table' },
                { desc: 'Yumurta ve şekeri çırptık.', order: 2, img: 'Whisking eggs and sugar in bowl' },
                { desc: 'Un ve sütü ekleyip karıştırdık.', order: 3, img: 'Mixing flour milk batter in bowl' },
                { desc: 'Karışımı kalıba döküp fırına verdik.', order: 4, img: 'Putting cake pan into oven' },
                { desc: 'Mis gibi kokan keki fırından çıkardık.', order: 5, img: 'Fresh baked cake out of oven' }
            ]
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const seq = getRandomItems(sequences, 1)[0];
        // Adjust step count based on difficulty
        const stepCount = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : (difficulty === 'Zor' ? 5 : 6));
        const selectedSteps = seq.steps.slice(0, stepCount);
        
        return {
            title: 'Olay Sıralama',
            instruction: "Olayları oluş sırasına göre diz.",
            prompt: "Kartları olayların oluş sırasına göre numaralandır. Geçiş kelimelerini kullanmayı unutma.",
            pedagogicalNote: "Kronolojik düşünme, neden-sonuç ilişkisi ve süreç takibi.",
            panels: shuffle(selectedSteps.map((step) => ({
                id: crypto.randomUUID(), 
                description: step.desc,
                order: step.order,
                // Crucial fix: Use the specific image prompt defined in the data
                imagePrompt: step.img || step.desc, 
                imageBase64: '' 
            }))),
            transitionWords: ['İlk önce', 'Sonra', 'Daha sonra', 'Bunun üzerine', 'En sonunda'],
            imagePrompt: 'Story sequence timeline'
        };
    });
};

// --- GENERATOR 6: MISSING PARTS (Cloze Test) ---
export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount, difficulty, topic } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const { story } = buildDynamicStory(difficulty, topic);
        const words = story.split(' ');
        
        // Strategy: Remove every 5th word or specific POS if we had tagging
        // Offline approach: Random removal avoiding very short words
        const blanksCount = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 5 : 8);
        const blankIndices = new Set<number>();
        
        while(blankIndices.size < blanksCount) {
            const idx = getRandomInt(0, words.length - 1);
            const word = words[idx].replace(/[.,!?]/g, '');
            if (word.length > 3 && !blankIndices.has(idx)) {
                blankIndices.add(idx);
            }
        }

        const segments: string[] = [];
        const answers: string[] = [];
        let currentSegment = [];

        for(let i=0; i<words.length; i++) {
            if (blankIndices.has(i)) {
                segments.push(currentSegment.join(' '));
                currentSegment = [];
                // Clean word for bank, keep punctuation in segment? 
                // Better: Split punctuation
                const match = words[i].match(/([a-zA-ZğüşıöçĞÜŞİÖÇ]+)(.*)/);
                if (match) {
                    answers.push(match[1]);
                    if (match[2]) currentSegment.push(match[2]); // Keep punctuation attached to next or standalone
                } else {
                    answers.push(words[i]);
                }
            } else {
                currentSegment.push(words[i]);
            }
        }
        segments.push(currentSegment.join(' '));

        return {
            title: 'Boşluk Doldurma (Cloze Test)',
            prompt: 'Hikayedeki boşlukları kutudaki uygun kelimelerle tamamla.',
            instruction: 'Metnin anlam bütünlüğüne dikkat et.',
            pedagogicalNote: 'Sözcük dağarcığı, bağlamsal ipuçlarını kullanma ve okuduğunu anlama.',
            imagePrompt: 'Puzzle piece missing',
            storyWithBlanks: segments,
            wordBank: shuffle([...answers, 'yanlış', 'kelime']), // Add distractors
            answers,
            leftParts: [], rightParts: [], givenParts: [] // Legacy compat
        };
    });
};

// Legacy functions redirection
export const generateOfflineProverbFillInTheBlank = async (o: GeneratorOptions): Promise<ProverbFillData[]> => {
    // Basic implementation for proverb specific filling
    const { itemCount, worksheetCount } = o;
    return Array.from({ length: worksheetCount }, () => {
        const proverbs = getRandomItems(PROVERBS, itemCount || 5).map(p => {
            const parts = p.split(' ');
            const hideIdx = getRandomInt(0, parts.length - 1);
            const full = p;
            const start = parts.slice(0, hideIdx).join(' ');
            const end = parts.slice(hideIdx + 1).join(' ');
            return { start, end, full };
        });
        return { 
            title: 'Atasözü Tamamlama',
            instruction: 'Eksik kelimeleri tamamla.',
            proverbs,
            meaning: 'Eksik kelimeleri bularak atasözlerini tamamla.',
            usagePrompt: 'Bir tanesini seç ve resmini çiz.',
            pedagogicalNote: "Kültürel bellek ve cümle tamamlama.",
            imagePrompt: "Old parchment wisdom"
        };
    });
};

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = itemCount || 8;
        const countPerType = Math.ceil(count / 2);
        const items = shuffle([
            ...getRandomItems(PROVERBS, countPerType).map(t => ({text: t, type: 'atasözü' as const})),
            ...getRandomItems(SAYINGS, countPerType).map(t => ({text: t, type: 'özdeyiş' as const}))
        ]).slice(0, count);
        return {
            title: 'Atasözü mü Özdeyiş mi?',
            instruction: 'Cümleleri doğru kutuya yerleştir.',
            prompt: 'Söyleyeni belli olanlara Özdeyiş, anonim olanlara Atasözü denir. Sınıflandır.',
            items,
            pedagogicalNote: "Bilgi kaynağı analizi.",
            imagePrompt: "Sorting hat or categorization"
        };
    });
};

export const generateOfflineProverbWordChain = async (options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const solution = getRandomItems(PROVERBS, 1)[0];
        const words = shuffle(solution.replace(/[.,]/g,'').split(' ')).map(w => ({word: w, color: '#333'}));
        return {
            title: 'Kelime Zinciri',
            instruction: 'Kelimeleri sıraya diz.',
            prompt: 'Karışık kelimeleri sıraya diz.',
            wordCloud: words,
            solutions: [solution],
            pedagogicalNote: "Sözdizimi (Sentaks) becerisi.",
            imagePrompt: "Word chain link"
        };
    });
};

export const generateOfflineProverbSentenceFinder = async (options: GeneratorOptions) => {
    const res = await generateOfflineProverbWordChain(options);
    return res.map(r => ({...r, title: 'Cümle Kurmaca'})) as unknown as ProverbSentenceFinderData[];
};

export const generateOfflineProverbSearch = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
    const { worksheetCount } = options;
    const results: ProverbSearchData[] = [];
    for (let i = 0; i < worksheetCount; i++) {
        const proverb = getRandomItems(PROVERBS, 1)[0];
        const words = proverb.replace(/[.,]/g, '').split(' ');
        const searchData = await generateOfflineWordSearch({ ...options, words, itemCount: words.length, worksheetCount: 1 });
        results.push({
            title: 'Atasözü Avı',
            instruction: "Tabloda gizli olan atasözünün kelimelerini bul.",
            grid: searchData[0].grid,
            proverb,
            meaning: 'Bulduğun kelimeleri sıraya dizerek atasözünü yaz.',
            pedagogicalNote: "Görsel tarama ve bütünleme.",
            imagePrompt: "Hidden words puzzle"
        });
    }
    return results;
};
