
import { GeneratorOptions, StoryData, StoryCreationPromptData, WordsInStoryData, StoryAnalysisData, StorySequencingData, ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData, StoryQuestion, ProverbSearchData, MissingPartsData } from '../../types';
import { shuffle, getRandomItems, getWordsForDifficulty, getRandomInt } from './helpers';
import { PROVERBS, SAYINGS, COHERENT_STORY_TEMPLATES, StoryTemplate } from '../../data/sentences';
import { generateOfflineWordSearch } from './wordGames';

// --- HELPER: Coherent Story Builder ---
// Selects a logical template and fills it with consistent variables
const buildCoherentStory = (difficulty: string, topic?: string) => {
    // Filter templates based on difficulty
    // 'Uzman' uses 'Zor' templates if no expert ones exist
    const targetLevel = difficulty === 'Uzman' ? 'Zor' : difficulty;
    
    let candidates = COHERENT_STORY_TEMPLATES.filter(t => t.level === targetLevel);
    
    // If topic provided, we could filter further (future feature), for now random within difficulty
    if (candidates.length === 0) candidates = COHERENT_STORY_TEMPLATES; // Fallback
    
    const template = getRandomItems(candidates, 1)[0];
    
    // Fill variables
    const chosenValues: Record<string, string> = {};
    Object.keys(template.variables).forEach(key => {
        chosenValues[key] = getRandomItems(template.variables[key], 1)[0];
    });

    // Replace in Title
    let title = template.titleTemplate;
    Object.keys(chosenValues).forEach(key => {
        title = title.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
    });

    // Replace in Text
    let story = template.textTemplate;
    Object.keys(chosenValues).forEach(key => {
        story = story.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
    });
    
    // Replace in Image Prompt
    let imagePrompt = template.imagePromptTemplate;
    Object.keys(chosenValues).forEach(key => {
        imagePrompt = imagePrompt.replace(new RegExp(`{${key}}`, 'g'), chosenValues[key]);
    });

    return { story, title, chosenValues, template, imagePrompt };
};

// --- GENERATOR 1: STORY COMPREHENSION (Logic Based) ---
export const generateOfflineStoryComprehension = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    const results: StoryData[] = [];

    for (let i = 0; i < worksheetCount; i++) {
        const { story, title, chosenValues, template, imagePrompt } = buildCoherentStory(difficulty, topic);
        
        const questions: StoryQuestion[] = [];
        
        // Generate Logical Questions based on the template metadata
        template.questions.forEach(qTemplate => {
            let correctAnswer = "";
            
            if (qTemplate.aKey.startsWith("custom:")) {
                correctAnswer = qTemplate.aKey.split("custom:")[1];
            } else {
                correctAnswer = chosenValues[qTemplate.aKey];
            }
            
            // Format question text if it has variables
            let qText = qTemplate.q;
            Object.keys(chosenValues).forEach(k => {
                qText = qText.replace(new RegExp(`{${k}}`, 'g'), chosenValues[k]);
            });

            questions.push({
                type: 'multiple-choice',
                question: qText,
                options: shuffle([correctAnswer, ...getRandomItems(qTemplate.distractors, 3)]),
                answerIndex: 0 // Frontend should shuffle or we can shuffle and find index. 
                // Currently Activity renderer handles finding the correct answer if we passed it, 
                // but types say answerIndex. Let's rely on renderer to shuffle options if needed, 
                // or we shuffle here and set index.
            });
        });
        
        // Fix Answer Index (Shuffle options correctly)
        questions.forEach(q => {
            if (q.type === 'multiple-choice') {
                const correct = q.options[0];
                q.options = shuffle(q.options);
                q.answerIndex = q.options.indexOf(correct);
            }
        });

        // 2. Inferential Question (Open Ended)
        questions.push({
            type: 'open-ended',
            question: "Hikayenin en sevdiğin bölümü hangisiydi? Neden?",
            spaceLines: 3
        });

        // 3. True/False Logic Check
        // Generate a true statement based on variables
        // Generate a false statement by swapping a variable
        const trueStmt = `${chosenValues['character'] || 'Kahraman'}, ${chosenValues['place'] || 'mekanda'} bulundu.`;
        const falseStmt = `${chosenValues['character'] || 'Kahraman'} hiç ${chosenValues['place'] || 'mekana'} gitmedi.`;
        
        questions.push({ type: 'true-false', statement: trueStmt, isTrue: true });
        questions.push({ type: 'true-false', statement: falseStmt, isTrue: false });

        // 5N 1K Mapping
        const fiveW1H = {
            who: template.fiveW1H_keys.who === 'character' ? chosenValues['character'] : chosenValues[template.fiveW1H_keys.who] || "Kahraman",
            where: template.fiveW1H_keys.where === 'place' ? chosenValues['place'] : (template.fiveW1H_keys.where.includes('{') ? template.fiveW1H_keys.where.replace('{place}', chosenValues['place']) : template.fiveW1H_keys.where),
            when: template.fiveW1H_keys.when,
            what: template.fiveW1H_keys.what,
            why: "Merak ettiği için", // Generic deduction
            how: "Cesurca" // Generic manner
        };
        
        // Dynamic replacement for 5N1K values
         Object.keys(fiveW1H).forEach(k => {
             const key = k as keyof typeof fiveW1H;
            Object.keys(chosenValues).forEach(vKey => {
                fiveW1H[key] = fiveW1H[key].replace(new RegExp(`{${vKey}}`, 'g'), chosenValues[vKey]);
            });
            // Clean up any unmatched keys
             if (fiveW1H[key].startsWith('custom:')) fiveW1H[key] = fiveW1H[key].split(':')[1];
        });


        results.push({ 
            title: title,
            instruction: "Hikayeyi dikkatlice oku, 5N 1K tablosunu doldur ve soruları cevapla.",
            story, 
            questions: questions,
            characters: [chosenValues['character']], 
            mainIdea: 'Dikkatli okuma ve anlama.', 
            setting: chosenValues['place'] || 'Bilinmiyor',
            pedagogicalNote: `${difficulty} seviyesinde kurgusal metin analizi. Mantıksal akış takibi.`,
            imagePrompt: imagePrompt,
            fiveW1H: fiveW1H
        });
    }
    return results;
};

// --- GENERATOR 2: STORY CREATION (Writer's Workshop) ---
export const generateOfflineStoryCreationPrompt = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        // Use the same coherent logic but leave parts blank
        const { chosenValues, template, imagePrompt } = buildCoherentStory(difficulty, topic);
        
        const hints = {
            who: chosenValues['character'] || "Bir Kahraman",
            where: chosenValues['place'] || "Gizli Bir Yer",
            when: "Bir sabah",
            problem: "Bir sorunla karşılaştı"
        };
        
        // Customize hints based on template type
        if (template.id === 'kayip_esya') hints.problem = `Kaybettiği ${chosenValues['object']}nu arıyor`;
        if (template.id === 'doga_yuruyusu') hints.problem = `Çevredeki ${chosenValues['trash']} çöplerini gördü`;

        // Keywords from the story
        const keywords = Object.values(chosenValues).slice(0, 5);

        return {
            title: `Hikaye Atölyesi: ${template.level}`,
            prompt: "Aşağıdaki ipuçlarını ve anahtar kelimeleri kullanarak bu hikayeyi kendi cümlelerinle yaz.",
            instruction: "Giriş, gelişme ve sonuç bölümlerine dikkat et.",
            keywords: keywords,
            structureHints: hints,
            pedagogicalNote: "Yaratıcı yazma ve kurgu oluşturma.",
            imagePrompt: imagePrompt
        };
    });
};

// --- GENERATOR 3: TEXT ANALYSIS (Context Clues) ---
export const generateOfflineWordsInStory = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const { story, title, chosenValues } = buildCoherentStory(difficulty, topic);
        
        // Select logic-bearing words from the story variables
        // Instead of random words, we use the variables which are central to the plot
        const selectedWords = Object.values(chosenValues).filter(w => w.length > 3).slice(0, 4);

        return { 
            title: 'Kelimelerin Gücü',
            instruction: "Hikayeyi oku ve seçilen kelimelerin anlamlarını tahmin et.",
            story, 
            vocabWork: selectedWords.map(word => ({
                word,
                type: 'meaning',
                contextQuestion: `Hikayede geçen "${word}" kelimesi sence ne anlama geliyor?`
            })),
            questions: [],
            pedagogicalNote: "Bağlamdan anlam çıkarma.",
            imagePrompt: `${chosenValues['character']} thinking`
        };
    });
};

// --- GENERATOR 4: STORY ANALYSIS (Story Map) ---
export const generateOfflineStoryAnalysis = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
    const { worksheetCount, topic, difficulty } = options;
    return Array.from({ length: worksheetCount }, () => {
         const { story, title, chosenValues, template, imagePrompt } = buildCoherentStory(difficulty, topic);
         return {
             title: 'Hikaye Haritası',
             instruction: "Hikayenin unsurlarını analiz et.",
             story,
             storyMap: {
                 characters: chosenValues['character'],
                 setting: chosenValues['place'],
                 problem: template.fiveW1H_keys.what.replace('{object}', chosenValues['object'] || ''),
                 solution: 'Sorun nasıl çözüldü?',
                 theme: 'Hikayenin ana fikri nedir?'
             },
             analysisQuestions: [],
             pedagogicalNote: "Hikaye haritalama ve analiz.",
             imagePrompt: imagePrompt
         };
    });
};

// --- GENERATOR 5: STORY SEQUENCING (Logical Flow) ---
export const generateOfflineStorySequencing = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { worksheetCount, difficulty } = options;
    
    // Fixed logical sequences (Offline robust data)
    // These guarantee logical flow unlike random sentence combining
    const sequences = [
        { 
            title: "Tohumun Yolculuğu",
            steps: [
                { desc: 'Çiftçi tarlayı sürdü.', order: 1, img: 'Farmer plowing field' },
                { desc: 'Tohumları toprağa ekti.', order: 2, img: 'Planting seeds' },
                { desc: 'Yağmur yağdı ve güneş açtı.', order: 3, img: 'Rain and sun' },
                { desc: 'Küçük filizler topraktan çıktı.', order: 4, img: 'Sprout growing' },
                { desc: 'Bitkiler büyüdü ve çiçek açtı.', order: 5, img: 'Flowers blooming' }
            ]
        },
        {
            title: "Kek Yapımı",
            steps: [
                { desc: 'Malzemeleri masaya hazırladık.', order: 1, img: 'Ingredients on table' },
                { desc: 'Yumurta ve şekeri çırptık.', order: 2, img: 'Whisking eggs' },
                { desc: 'Unu ekleyip karıştırdık.', order: 3, img: 'Mixing flour' },
                { desc: 'Karışımı fırına koyduk.', order: 4, img: 'Oven baking' },
                { desc: 'Kek pişince afiyetle yedik.', order: 5, img: 'Eating cake' }
            ]
        },
        {
            title: "Kütüphane Kuralları",
            steps: [
                { desc: 'Kütüphaneye sessizce girdim.', order: 1, img: 'Quiet library entrance' },
                { desc: 'İstediğim kitabı rafta buldum.', order: 2, img: 'Bookshelf search' },
                { desc: 'Masaya oturup okumaya başladım.', order: 3, img: 'Reading at table' },
                { desc: 'Kitabı ödünç almak için görevliye gittim.', order: 4, img: 'Librarian desk' },
                { desc: 'Kitabı çantama koyup çıktım.', order: 5, img: 'Leaving library' }
            ]
        }
    ];

    return Array.from({ length: worksheetCount }, () => {
        const seq = getRandomItems(sequences, 1)[0];
        
        return {
            title: `Olay Sıralama: ${seq.title}`,
            instruction: "Resimleri ve cümleleri oluş sırasına göre numaralandır.",
            prompt: "Olayların sırasını bul.",
            pedagogicalNote: "Kronolojik sıralama ve süreç takibi.",
            panels: shuffle(seq.steps.map((step) => ({
                id: crypto.randomUUID(), 
                description: step.desc,
                order: step.order,
                imagePrompt: step.img, 
                imageBase64: '' 
            }))),
            transitionWords: ['Önce', 'Sonra', 'Daha sonra', 'En sonunda'],
            imagePrompt: 'Sequence'
        };
    });
};

// --- GENERATOR 6: MISSING PARTS (Cloze Test Logic) ---
export const generateOfflineMissingParts = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
    const { worksheetCount, difficulty, topic } = options;
    
    return Array.from({ length: worksheetCount }, () => {
        const { story, chosenValues } = buildCoherentStory(difficulty, topic);
        
        // Target specific variables for blanking to ensure the blanks are meaningful nouns/verbs
        // rather than random words like "ve", "ama".
        const targets = Object.values(chosenValues);
        const segments: string[] = [];
        const answers: string[] = [];
        
        // Simple logic: Split story by target words
        let currentText = story;
        targets.forEach(target => {
            // Only replace first occurrence to avoid confusion or excessive blanks
            const idx = currentText.indexOf(target);
            if (idx !== -1) {
                // Split logic handled loosely for demo simplicity
                // A regex replace with capture would be better but complex for all cases
                currentText = currentText.replace(target, "___BLANK___");
                answers.push(target);
            }
        });
        
        const parts = currentText.split("___BLANK___");

        return {
            title: 'Boşluk Doldurma',
            prompt: 'Hikayedeki boşlukları kutudaki uygun kelimelerle tamamla.',
            instruction: 'Anlam bütünlüğünü koru.',
            pedagogicalNote: 'Sözcük dağarcığı ve bağlamsal tahmin.',
            imagePrompt: 'Missing Piece',
            storyWithBlanks: parts, // This array creates the flow text + inputs
            wordBank: shuffle([...answers, 'yanlış', 'farklı']), // Add distractors
            answers,
            leftParts: [], rightParts: [], givenParts: [] 
        };
    });
};

// ... Legacy/Proverb functions remain unchanged as they are list-based and logical by definition ...
export const generateOfflineProverbFillInTheBlank = async (o: GeneratorOptions): Promise<ProverbFillData[]> => {
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
            meaning: 'Kültürel miras.',
            usagePrompt: 'Seçtiğin atasözünün resmini çiz.',
            pedagogicalNote: "Sözlü kültür ve hafıza.",
            imagePrompt: "Proverb"
        };
    });
};

export const generateOfflineProverbSayingSort = async (options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { itemCount, worksheetCount } = options;
    return Array.from({ length: worksheetCount }, () => {
        const count = itemCount || 8;
        const items = shuffle([
            ...getRandomItems(PROVERBS, count/2).map(t => ({text: t, type: 'atasözü' as const})),
            ...getRandomItems(SAYINGS, count/2).map(t => ({text: t, type: 'özdeyiş' as const}))
        ]).slice(0, count);
        return {
            title: 'Atasözü mü Özdeyiş mi?',
            instruction: 'Sınıflandır.',
            prompt: 'Kutulara yerleştir.',
            items,
            pedagogicalNote: "Sınıflandırma.",
            imagePrompt: "Sorting"
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
            instruction: 'Sıraya diz.',
            prompt: 'Cümle kur.',
            wordCloud: words,
            solutions: [solution],
            pedagogicalNote: "Sözdizimi.",
            imagePrompt: "Chain"
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
            instruction: "Gizli kelimeleri bul.",
            grid: searchData[0].grid,
            proverb,
            meaning: 'Atasözünü tamamla.',
            pedagogicalNote: "Görsel tarama.",
            imagePrompt: "Puzzle"
        });
    }
    return results;
};
