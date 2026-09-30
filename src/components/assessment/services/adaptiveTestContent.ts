import type { DomainAdaptiveParameters } from './cognitiveAdaptiveService';

/**
 * adaptation engine's deterministic core.
 *
 * Her test, öğrenci profiline göre üretilen bir "seed" ile çalışır. Böylece:
 *  - Aynı öğrenci için bile her uygulama farklı içerik üretir (benzersizlik).
 *  - İçerik zorluğu `DomainAdaptiveParameters.complexityScore` ile ölçeklenir.
 *  - AI çağrısı başarısız olsa bile asla "hep aynı sorular" çıkmaz (güvenli fallback).
 */

export type Rng = () => number;

export function hashString(input: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/** Mulberry32 tabanlı, seed'e bağlı deterministik RNG. */
export function createRng(seed: string): Rng {
    let a = hashString(seed) || 0x9e3779b9;
    return function next() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
    return arr[Math.floor(rng() * arr.length)];
}

export function shuffleSeeded<T>(rng: Rng, arr: readonly T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function sampleUnique<T>(rng: Rng, arr: readonly T[], count: number): T[] {
    return shuffleSeeded(rng, arr).slice(0, Math.min(count, arr.length));
}

export function randInt(rng: Rng, min: number, max: number): number {
    return min + Math.floor(rng() * (max - min + 1));
}

export type DifficultyBand = 'kolay' | 'dengeli' | 'orta' | 'ileri' | 'uzman';

export function difficultyBand(complexityScore: number): DifficultyBand {
    switch (complexityScore) {
        case 1: return 'kolay';
        case 2: return 'dengeli';
        case 3: return 'orta';
        case 4: return 'ileri';
        default: return 'uzman';
    }
}

/**
 * Testlerin ders akışında kullanacağı zorluk-ölçekli sayısal parametreler.
 * Tek yerden yönetilir; her test kendi alanına uygun olanı kullanır.
 */
export interface AdaptiveScaling {
    band: DifficultyBand;
    complexityScore: number;
    /** Görsel-uzamsal ızgara başlangıç kenarı (3/4/5). */
    memoryGridStart: number;
    /** İlk seviyede hedeflenecek hücre sayısı. */
    memoryTargetsStart: number;
    /** Preview / gösterim süresi (ms). */
    showTimeMs: number;
    /** Çalışma belleği başlangıç dizi uzunluğu. */
    workingMemoryStart: number;
    /** RAN ızgara hücre sayısı. */
    rapidNamingTrials: number;
    /** Stroop deneme sayısı. */
    stroopTrials: number;
    /** Stroop uyumsuz (incongruent) uyaran oranı (0-1). */
    stroopIncongruentRatio: number;
    /** Görsel arama ızgarası kenar artışı. */
    visualSearchGridBase: number;
    /** Görsel arama hedef sayısı. */
    visualSearchTargets: number;
    /** Görsel-motor seçenek sayısı. */
    visualMotorOptionCount: number;
    /** Planlama: başlangıç seviyesi (0-3) ve ek zorluk. */
    planningStartLevel: number;
    /** Değerlendirilecek toplam soru/deneme sayısı. */
    itemsCount: number;
    /** Zaman baskısı çarpanı (destek gerektiren profillerde > 1). */
    timeMultiplier: number;
}

export function calculateAdaptiveScaling(params?: DomainAdaptiveParameters): AdaptiveScaling {
    const score = Math.max(1, Math.min(5, params?.complexityScore || 3));
    const timeMultiplier = params?.timeLimitMultiplier || 1;

    return {
        band: difficultyBand(score),
        complexityScore: score,
        memoryGridStart: score <= 2 ? 3 : score === 3 ? 4 : 5,
        memoryTargetsStart: score <= 2 ? 2 : score === 3 ? 3 : 4,
        showTimeMs: Math.round((score <= 2 ? 3400 : score === 3 ? 3000 : 2600) * timeMultiplier),
        workingMemoryStart: score <= 2 ? 3 : score === 3 ? 4 : 5,
        rapidNamingTrials: score <= 2 ? 16 : score === 3 ? 20 : 24,
        stroopTrials: score <= 2 ? 12 : score === 3 ? 16 : 20,
        stroopIncongruentRatio: score <= 2 ? 0.5 : score === 3 ? 0.65 : 0.8,
        visualSearchGridBase: score <= 2 ? 4 : score === 3 ? 5 : 6,
        visualSearchTargets: score <= 2 ? 3 : score === 3 ? 5 : 7,
        visualMotorOptionCount: score <= 2 ? 3 : 4,
        planningStartLevel: score <= 2 ? 0 : score === 3 ? 1 : 2,
        itemsCount: score <= 2 ? 8 : score === 3 ? 10 : 12,
        timeMultiplier,
    };
}

/* ------------------------------------------------------------------ */
/* MANTIKSAL MUHAKEME (logical_reasoning)                              */
/* ------------------------------------------------------------------ */

export type LogicDifficulty = 'easy' | 'medium' | 'hard';

export interface LogicItem {
    id: number;
    grid: string[][];
    options: string[];
    answer: string;
    rule: string;
    difficulty: LogicDifficulty;
    hint: string;
}

const LOGIC_SYMBOLS = ['⬛', '⬜', '🔴', '🔵', '🟢', '⭐', '🔺', '🔻', '🔷', '🔶', '🟣', '🟠'];
const ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'];

function logicDistractors(rng: Rng, pool: readonly string[], answer: string, count: number): string[] {
    const others = pool.filter((s) => s !== answer);
    const picks = sampleUnique(rng, others, count);
    return [answer, ...picks];
}

function buildConstant(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const s = pick(rng, LOGIC_SYMBOLS);
    return {
        grid: [[s, s, s], [s, s, s], [s, s, '?']],
        answer: s,
        options: shuffleSeeded(rng, logicDistractors(rng, LOGIC_SYMBOLS, s, 2)),
        rule: 'Desen Tekrarı',
        hint: 'Tüm kareler aynı desende kalır.',
    };
}

function buildArithmetic(rng: Rng, step: number): Omit<LogicItem, 'id' | 'difficulty'> {
    const start = randInt(rng, 1, 6);
    const nums: string[] = [];
    for (let i = 0; i < 9; i++) nums.push(String(start + i * step));
    const answer = nums[8];
    const distractors = [String(Number(answer) + step), String(Number(answer) - 1), String(Number(answer) + 2)];
    return {
        grid: [nums.slice(0, 3), nums.slice(3, 6), [nums[6], nums[7], '?']],
        answer,
        options: shuffleSeeded(rng, logicDistractors(rng, distractors, answer, 2)),
        rule: `${step}'er Artış`,
        hint: `Sayılar her adımda ${step} artıyor.`,
    };
}

function buildDoubling(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const start = randInt(rng, 1, 4);
    const nums: string[] = [];
    let cur = start;
    for (let i = 0; i < 9; i++) {
        nums.push(String(cur));
        cur *= 2;
    }
    const answer = nums[8];
    const distractors = [String(Number(answer) / 2), String(Number(answer) + Number(answer) / 2), String(Number(answer) + 1)];
    return {
        grid: [nums.slice(0, 3), nums.slice(3, 6), [nums[6], nums[7], '?']],
        answer,
        options: shuffleSeeded(rng, logicDistractors(rng, distractors, answer, 2)),
        rule: 'İkiye Katlama',
        hint: 'Her sayı bir öncekinin iki katı.',
    };
}

function buildFibonacci(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const a0 = randInt(rng, 1, 3);
    const a1 = randInt(rng, 1, 4);
    const nums: number[] = [a0, a1];
    for (let i = 2; i < 9; i++) nums.push(nums[i - 1] + nums[i - 2]);
    const str = nums.map(String);
    const answer = str[8];
    const distractors = [String(nums[7] + nums[5]), String(nums[8] + 1), String(nums[8] - 2)];
    return {
        grid: [str.slice(0, 3), str.slice(3, 6), [str[6], str[7], '?']],
        answer,
        options: shuffleSeeded(rng, logicDistractors(rng, distractors, answer, 2)),
        rule: 'Toplam Örüntüsü',
        hint: 'Her sayı kendinden önceki iki sayının toplamı.',
    };
}

function buildRotation(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const startIdx = randInt(rng, 0, 3);
    const seen = [ARROWS[startIdx], ARROWS[(startIdx + 1) % 4], ARROWS[(startIdx + 2) % 4]];
    const answer = ARROWS[(startIdx + 3) % 4];
    return {
        grid: [[seen[0], seen[1]], [seen[2], '?']],
        answer,
        options: shuffleSeeded(rng, logicDistractors(rng, ARROWS, answer, 2)),
        rule: 'Saat Yönünde Döndürme',
        hint: 'Oklar saat yönünde dönüyor.',
    };
}

function buildAlternating(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const [x, y] = sampleUnique(rng, LOGIC_SYMBOLS, 2);
    return {
        grid: [[x, y, x], [y, x, y], [x, y, '?']],
        answer: x,
        options: shuffleSeeded(rng, logicDistractors(rng, LOGIC_SYMBOLS, x, 2)),
        rule: 'Dönüşümlü Desen',
        hint: 'İki sembol sırayla yer değiştiriyor.',
    };
}

function buildSumRows(rng: Rng): Omit<LogicItem, 'id' | 'difficulty'> {
    const rows: number[][] = [];
    for (let r = 0; r < 3; r++) {
        const a = randInt(rng, 1, 5);
        const b = randInt(rng, 1, 5);
        rows.push([a, b, a + b]);
    }
    const str = rows.map((r) => r.map(String));
    const answer = str[2][2];
    const distractors = [String(rows[2][0] + rows[2][1] + 1), String(rows[2][0] * rows[2][1]), String(rows[2][1] + 2)];
    return {
        grid: [str[0], str[1], [str[2][0], str[2][1], '?']],
        answer,
        options: shuffleSeeded(rng, logicDistractors(rng, distractors, answer, 2)),
        rule: 'Satır Toplamı',
        hint: 'Her satırdaki ilk iki sayının toplamı üçüncüyü verir.',
    };
}

/**
 * Zorluk profiline göre benzersiz mantıksal örüntü matrisleri üretir.
 */
export function generateLogicItems(params: DomainAdaptiveParameters, rng: Rng): LogicItem[] {
    const scaling = calculateAdaptiveScaling(params);
    const total = scaling.complexityScore <= 2 ? 8 : scaling.complexityScore === 3 ? 10 : 12;

    const easyBuilders = [
        () => buildConstant(rng),
        () => buildAlternating(rng),
        () => buildRotation(rng),
        () => buildArithmetic(rng, 1),
    ];
    const mediumBuilders = [
        () => buildArithmetic(rng, 2),
        () => buildArithmetic(rng, 3),
        () => buildRotation(rng),
        () => buildAlternating(rng),
        () => buildDoubling(rng),
    ];
    const hardBuilders = [
        () => buildFibonacci(rng),
        () => buildDoubling(rng),
        () => buildSumRows(rng),
        () => buildArithmetic(rng, 4),
    ];

    const result: LogicItem[] = [];
    for (let i = 0; i < total; i++) {
        const progress = i / Math.max(1, total - 1);
        const isLate = progress > 0.66;
        const isMid = progress > 0.33;

        let difficulty: LogicDifficulty;
        let builder: () => Omit<LogicItem, 'id' | 'difficulty'>;

        if (scaling.complexityScore <= 2) {
            difficulty = isLate ? 'medium' : 'easy';
            builder = isLate ? pick(rng, mediumBuilders) : pick(rng, easyBuilders);
        } else if (scaling.complexityScore === 3) {
            difficulty = isLate ? 'hard' : isMid ? 'medium' : 'easy';
            builder = isLate ? pick(rng, hardBuilders) : isMid ? pick(rng, mediumBuilders) : pick(rng, easyBuilders);
        } else {
            difficulty = isMid ? 'hard' : 'medium';
            builder = isMid ? pick(rng, hardBuilders) : pick(rng, mediumBuilders);
        }

        result.push({ id: i + 1, difficulty, ...builder() });
    }
    return result;
}

/* ------------------------------------------------------------------ */
/* FONOLOJİK DÖNGÜ (phonological_loop)                                 */
/* ------------------------------------------------------------------ */

export type SequenceType = 'syllable' | 'word' | 'digit' | 'reverse' | 'letter' | 'mixed';

export interface PhonologicalSequence {
    items: string[];
    level: number;
    type: SequenceType;
}

const SYLLABLE_POOL = ['ba', 'ma', 'ta', 'li', 'ka', 'ra', 'su', 'bi', 'le', 'gi', 'da', 'ni', 'me', 'ya', 'ko', 'tu', 'se', 'fi'];
const SIMPLE_WORDS = ['elma', 'top', 'kedi', 'ev', 'ağaç', 'araba', 'masa', 'kitap', 'kuş', 'balık', 'güneş', 'ay', 'yol', 'göl', 'dağ'];
const COMPLEX_WORDS = ['kalem', 'defter', 'deniz', 'ateş', 'rüzgar', 'yıldız', 'bulut', 'toprak', 'çiçek', 'köprü', 'kelebek', 'pencere'];
const LETTERS = ['A', 'K', 'M', 'T', 'B', 'D', 'G', 'L', 'E', 'R', 'S', 'Y'];

export function generatePhonologicalSequences(params: DomainAdaptiveParameters, rng: Rng): PhonologicalSequence[] {
    const scaling = calculateAdaptiveScaling(params);
    const total = scaling.complexityScore <= 2 ? 8 : scaling.complexityScore === 3 ? 10 : 12;
    const sequences: PhonologicalSequence[] = [];
    const usedSyllables = new Set<string>();

    for (let i = 0; i < total; i++) {
        const progress = i / Math.max(1, total - 1);
        let type: SequenceType;
        let length: number;

        if (scaling.complexityScore <= 2) {
            type = progress < 0.5 ? 'syllable' : 'word';
            length = progress < 0.5 ? 2 + (i % 2) : 3;
        } else if (scaling.complexityScore === 3) {
            if (progress < 0.3) { type = 'syllable'; length = 3; }
            else if (progress < 0.55) { type = 'word'; length = 3; }
            else if (progress < 0.75) { type = 'digit'; length = 4; }
            else { type = 'reverse'; length = 3; }
        } else {
            if (progress < 0.2) { type = 'word'; length = 4; }
            else if (progress < 0.4) { type = 'digit'; length = 5; }
            else if (progress < 0.6) { type = 'letter'; length = 4; }
            else if (progress < 0.8) { type = 'reverse'; length = 4; }
            else { type = 'mixed'; length = 5; }
        }

        sequences.push({ level: i + 1, type, items: buildSequenceItems(rng, type, length, usedSyllables) });
    }
    return sequences;
}

function buildSequenceItems(rng: Rng, type: SequenceType, length: number, used: Set<string>): string[] {
    switch (type) {
        case 'syllable': {
            let items: string[] = [];
            // Aynı hecenin tekrarını mümkün olduğunca engelle → her deneme farklı hissettirir
            for (let attempt = 0; attempt < 12; attempt++) {
                items = sampleUnique(rng, SYLLABLE_POOL, length);
                if (!items.some((s) => used.has(s)) || attempt === 11) break;
            }
            items.forEach((s) => used.add(s));
            return items;
        }
        case 'word': {
            const pool = length >= 4 ? [...SIMPLE_WORDS, ...COMPLEX_WORDS] : SIMPLE_WORDS;
            return sampleUnique(rng, pool, length);
        }
        case 'digit': {
            const digits: string[] = [];
            while (digits.length < length) {
                const d = String(randInt(rng, 1, 9));
                if (!digits.includes(d)) digits.push(d);
            }
            return digits;
        }
        case 'letter':
            return sampleUnique(rng, LETTERS, length);
        case 'reverse': {
            const pool = length >= 4 ? [...SIMPLE_WORDS, ...COMPLEX_WORDS] : SIMPLE_WORDS;
            return sampleUnique(rng, pool, length);
        }
        case 'mixed': {
            const digits = sampleUnique(rng, ['1', '2', '3', '4', '5', '6', '7', '8', '9'], 3);
            const syllables = sampleUnique(rng, SYLLABLE_POOL, 2);
            const merged = [...digits, ...syllables];
            return shuffleSeeded(rng, merged);
        }
    }
}

/* ------------------------------------------------------------------ */
/* İŞİTSEL İŞLEME (auditory_processing)                                */
/* ------------------------------------------------------------------ */

export interface AuditoryItem {
    targetWord: string;
    options: string[];
}

const AUDITORY_CATEGORIES: Record<string, string[]> = {
    meyve: ['elma', 'armut', 'kiraz', 'portakal', 'muz', 'çilek', 'üzüm', 'şeftali', 'kavun', 'incir'],
    hayvan: ['kedi', 'köpek', 'kuş', 'balık', 'tavşan', 'fare', 'aslan', 'fil', 'zürafa', 'penguen'],
    yer: ['ev', 'okul', 'park', 'kütüphane', 'hastane', 'market', 'sinema', 'bahçe', 'müze', 'istasyon'],
    eşya: ['kalem', 'defter', 'çanta', 'makas', 'sandalye', 'masa', 'lamba', 'anahtar', 'telefon', 'saat'],
    uzun: ['üniversite', 'kütüphane', 'bilgisayar', 'öğretmenlik', 'laboratuvar', 'televizyon']
};

/**
 * Yaş ve profile uygun kelime havuzundan, her uygulamada farklı hedef+çeldirici setleri üretir.
 */
export function generateAuditoryItems(params: DomainAdaptiveParameters, rng: Rng, age = 8): AuditoryItem[] {
    const scaling = calculateAdaptiveScaling(params);
    const includeComplex = scaling.complexityScore >= 4 || age >= 10;
    const categories = Object.keys(AUDITORY_CATEGORIES).filter(
        (c) => c !== 'uzun' || includeComplex
    );

    const total = scaling.complexityScore <= 2 ? 6 : scaling.complexityScore === 3 ? 8 : 10;
    const items: AuditoryItem[] = [];

    for (let i = 0; i < total; i++) {
        const category = categories[Math.floor(rng() * (1 + (i % categories.length))) % categories.length];
        const pool = AUDITORY_CATEGORIES[category];
        const targetWord = pick(rng, pool);
        // Aynı kategoriden 3 çeldirici (fonolojik olarak benzer uzunlukta kalması için)
        const distractors = sampleUnique(rng, pool.filter((w) => w !== targetWord), Math.min(3, pool.length - 1));
        items.push({
            targetWord,
            options: shuffleSeeded(rng, [targetWord, ...distractors])
        });
    }
    return items;
}

/* ------------------------------------------------------------------ */
/* GÖRSEL ARAMA (visual_search)                                        */
/* ------------------------------------------------------------------ */

export interface VisualSearchLevel {
    level: number;
    gridSize: number;
    targetChar: string;
    distractorChars: string[];
    targetCount: number;
    title: string;
}

/** Karıştırılma riski düşükten yükseğe doğru hedef/çeldirici kümeleri. */
const SEARCH_GROUPS: { target: string; distractors: string[] }[] = [
    { target: '★', distractors: ['▲', '●', '■', '◆'] },
    { target: 'A', distractors: ['O', 'U', 'I', 'E'] },
    { target: '7', distractors: ['1', '4', '2', '9'] },
    { target: 'K', distractors: ['H', 'N', 'X', 'M'] },
    { target: 'b', distractors: ['d', 'p', 'q'] },
    { target: 'E', distractors: ['F', 'B', 'P', '3', '8'] },
    { target: 'M', distractors: ['N', 'W', 'V', 'U'] },
    { target: '6', distractors: ['9', '8', '0', '5'] },
    { target: 'bd', distractors: ['db', 'pb', 'qp'] },
    { target: 'O', distractors: ['Q', 'D', '0', 'C'] },
    { target: 's', distractors: ['z', '5', 'e', 'c'] },
];

/**
 * Profile göre ölçeklenmiş, her uygulamada farklı hedef/çeldirici kümesi seçen görsel arama seviyeleri.
 */
export function generateVisualSearchLevels(
    params: DomainAdaptiveParameters | undefined,
    rng: Rng
): VisualSearchLevel[] {
    const scaling = calculateAdaptiveScaling(params);
    const score = scaling.complexityScore;

    const pool = score <= 2
        ? SEARCH_GROUPS.slice(0, 4)
        : score >= 4
            ? [...SEARCH_GROUPS.slice(0, 4), ...SEARCH_GROUPS.slice(4)]
            : SEARCH_GROUPS.slice(2, 8);

    const levelCount = score <= 2 ? 3 : 4;
    const chosen = sampleUnique(rng, pool, levelCount);

    return chosen.map((group, i) => {
        const gridSize = Math.max(3, Math.min(12, scaling.visualSearchGridBase + i));
        const maxTargets = gridSize * gridSize - 2;
        const targetCount = Math.max(2, Math.min(maxTargets, scaling.visualSearchTargets + i));
        return {
            level: i + 1,
            gridSize,
            targetChar: group.target,
            distractorChars: [...group.distractors],
            targetCount,
            title: `'${group.target}' Karakterini Bul`,
        };
    });
}

/* ------------------------------------------------------------------ */
/* SÖZEL KAVRAMA (verbal_comprehension)                                */
/* ------------------------------------------------------------------ */

export interface VerbalItem {
    word: string;
    options: string[];
    correct: string;
}

interface AntonymPair {
    word: string;
    correct: string;
    distractors: string[];
    tier: 1 | 2 | 3;
}

const ANTONYMS: AntonymPair[] = [
    { word: 'büyük', correct: 'küçük', distractors: ['uzun', 'geniş', 'derin'], tier: 1 },
    { word: 'sıcak', correct: 'soğuk', distractors: ['ılık', 'güzel', 'kuru'], tier: 1 },
    { word: 'hızlı', correct: 'yavaş', distractors: ['güçlü', 'hafif', 'sert'], tier: 1 },
    { word: 'mutlu', correct: 'üzgün', distractors: ['korkmuş', 'şakacı', 'sakin'], tier: 1 },
    { word: 'açık', correct: 'kapalı', distractors: ['aydınlık', 'ferah', 'geniş'], tier: 1 },
    { word: 'yukarı', correct: 'aşağı', distractors: ['ileri', 'geri', 'yanda'], tier: 1 },
    { word: 'temiz', correct: 'kirli', distractors: ['paslı', 'eski', 'yeni'], tier: 1 },
    { word: 'kolay', correct: 'zor', distractors: ['hızlı', 'uzun', 'sıkıcı'], tier: 1 },
    { word: 'gece', correct: 'gündüz', distractors: ['sabah', 'akşam', 'öğlen'], tier: 2 },
    { word: 'ucuz', correct: 'pahalı', distractors: ['bol', 'nadir', 'değerli'], tier: 2 },
    { word: 'başlangıç', correct: 'son', distractors: ['orta', 'devam', 'süreç'], tier: 2 },
    { word: 'gürültülü', correct: 'sessiz', distractors: ['kalabalık', 'hareketli', 'canlı'], tier: 2 },
    { word: 'dost', correct: 'düşman', distractors: ['yabancı', 'komşu', 'misafir'], tier: 2 },
    { word: 'cesur', correct: 'korkak', distractors: ['utangaç', 'tedbirli', 'dikkatli'], tier: 2 },
    { word: 'israf', correct: 'tutum', distractors: ['harcama', 'tüketim', 'birikim'], tier: 3 },
    { word: 'özgür', correct: 'tutsak', distractors: ['yalnız', 'bağımsız', 'serbest'], tier: 3 },
    { word: 'somut', correct: 'soyut', distractors: ['gerçek', 'belirgin', 'basit'], tier: 3 },
    { word: 'iyimser', correct: 'kötümser', distractors: ['umutlu', 'kararsız', 'sabırlı'], tier: 3 },
    { word: 'yıkım', correct: 'inşa', distractors: ['onarım', 'yapı', 'kurgu'], tier: 3 },
    { word: 'titiz', correct: 'savsak', distractors: ['düzenli', 'hızlı', 'sabırlı'], tier: 3 },
];

export function generateVerbalItems(params: DomainAdaptiveParameters, rng: Rng): VerbalItem[] {
    const scaling = calculateAdaptiveScaling(params);
    const maxTier = scaling.complexityScore <= 2 ? 1 : scaling.complexityScore === 3 ? 2 : 3;
    const pool = ANTONYMS.filter((p) => p.tier <= maxTier);
    const selected = shuffleSeeded(rng, pool).slice(0, scaling.itemsCount);

    return selected.map((pair) => ({
        word: pair.word,
        correct: pair.correct,
        options: shuffleSeeded(rng, [pair.correct, ...pair.distractors])
    }));
}
