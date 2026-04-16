import type { BellekConfig, SariKitapGeneratedContent, MemoryPhaseData } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

// ─── Kategori Bazlı Kelime Havuzu ────────────────────────────────
const CATEGORY_WORDS: Record<string, string[]> = {
    hayvanlar: [
        'Kedi', 'Köpek', 'Kuş', 'Balık', 'Tavşan', 'At', 'İnek', 'Koyun',
        'Keçi', 'Tavuk', 'Ördek', 'Kaz', 'Aslan', 'Kaplan', 'Fil',
        'Zürafa', 'Maymun', 'Kartal', 'Yunus', 'Kaplumbağa', 'Arı',
        'Kelebek', 'Karınca', 'Papağan', 'Tilki', 'Ayı', 'Kurt',
        'Geyik', 'Sincap', 'Baykuş', 'Serçe', 'Güvercin', 'Fare'
    ],
    doğa: [
        'Ağaç', 'Çiçek', 'Yaprak', 'Orman', 'Dere', 'Dağ', 'Bulut',
        'Yağmur', 'Güneş', 'Toprak', 'Kar', 'Deniz', 'Dalga', 'Rüzgar',
        'Yıldız', 'Ay', 'Gökyüzü', 'Nehir', 'Göl', 'Kaynak', 'Tepe',
        'Vadi', 'Çimen', 'Gül', 'Lale', 'Papatya', 'Tomurcuk',
        'Kök', 'Dal', 'Tohum', 'Fidan', 'Çam', 'Meşe'
    ],
    okul: [
        'Kitap', 'Defter', 'Kalem', 'Silgi', 'Çanta', 'Tahta', 'Sıra',
        'Öğretmen', 'Öğrenci', 'Ders', 'Sınav', 'Karne', 'Ödev',
        'Kütüphane', 'Teneffüs', 'Bahçe', 'Boya', 'Cetvel', 'Harita',
        'Atlas', 'Bilgisayar', 'Projeksiyon', 'Müdür', 'Sınıf',
        'Laboratuvar', 'Pergel', 'Hesap', 'Formül', 'Tablo', 'Grafik'
    ],
};

const DISTRACTOR_POOL: string[] = [
    'Masa', 'Sandalye', 'Pencere', 'Kapı', 'Duvar', 'Tavan', 'Zemin',
    'Halı', 'Perde', 'Ayna', 'Saat', 'Vazo', 'Tabak', 'Bardak',
    'Çatal', 'Bıçak', 'Kaşık', 'Tepsi', 'Sepet', 'Kutu', 'Torba',
    'İp', 'Düğme', 'Anahtar', 'Kilit', 'Mum', 'Lamba', 'Tuz',
    'Şeker', 'Un', 'Yağ', 'Çay', 'Süt', 'Ekmek', 'Peynir',
];

const SENTENCE_TEMPLATES: string[] = [
    'Bugün ______ gördüm ve çok sevindim.',
    'Bahçede ______ çok güzeldi.',
    '______ ile ______ birlikte oyun oynadı.',
    'Annem bana ______ hakkında bir şey anlattı.',
    'Ormanda bir ______ sessizce yürüyordu.',
    'Dün okulda ______ hakkında ders işledik.',
    '______ sabah erken kalktı ve yola çıktı.',
    'Kitapta ______ ile ilgili bilgiler vardı.',
];

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getDistractorCount(ratio: 'düşük' | 'orta' | 'yüksek', wordCount: number): number {
    switch (ratio) {
        case 'düşük': return Math.ceil(wordCount * 0.3);
        case 'orta': return Math.ceil(wordCount * 0.5);
        case 'yüksek': return Math.ceil(wordCount * 0.8);
    }
}

export function generateBellekOffline(config: BellekConfig): SariKitapGeneratedContent {
    const count = config.blockCount;

    // 1. Kelime seçimi (kategoriye göre)
    let pool: string[] = [];
    if (config.category === 'karışık') {
        pool = [
            ...CATEGORY_WORDS.hayvanlar,
            ...CATEGORY_WORDS.doğa,
            ...CATEGORY_WORDS.okul,
        ];
    } else {
        pool = [...(CATEGORY_WORDS[config.category] ?? CATEGORY_WORDS.hayvanlar)];
    }

    const studyWords = shuffleArray(pool).slice(0, count);

    // 2. Boş indeksler (Faz B)
    const totalBlanks = Math.ceil(count * config.blankRatio);
    const allIndices = Array.from({ length: count }, (_, i) => i);
    const blankIndices = shuffleArray(allIndices).slice(0, totalBlanks);

    // 3. Dikkat dağıtıcılar (Faz C)
    const distractorCount = getDistractorCount(config.distractorRatio, count);
    const availableDistractors = DISTRACTOR_POOL.filter(
        (d) => !studyWords.includes(d)
    );
    const distractors = shuffleArray(availableDistractors).slice(0, distractorCount);

    // 4. Cümle şablonları (Faz D)
    const sentencePrompts = shuffleArray(SENTENCE_TEMPLATES).slice(0, config.sentenceLines);

    const memoryData: MemoryPhaseData = {
        studyWords,
        blankIndices,
        distractors,
        sentencePrompts,
    };

    // rawText ve heceRows oluştur (uyumluluk için)
    const rawText = studyWords.join(' ');
    const heceRows = metniHecele(rawText);
    const rows = Math.ceil(count / config.gridColumns);
    const wordBlocks: string[][] = [];
    for (let r = 0; r < rows; r++) {
        wordBlocks.push(studyWords.slice(r * config.gridColumns, (r + 1) * config.gridColumns));
    }

    return buildGeneratedContent(
        'Bellek Kelime Etkinliği',
        rawText,
        heceRows,
        config,
        { wordBlocks, memoryData }
    );
}
