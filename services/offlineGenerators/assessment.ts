
import { AdaptiveQuestion, TestCategory } from '../../types';
import { shuffle } from './helpers';

// Hardcoded Question Bank (Expanded from the original component)
const QUESTION_BANK: Record<string, AdaptiveQuestion[]> = {
    'linguistic': [
        { id: 'l1', text: "'Elma' kelimesinin eş anlamlısı nedir?", options: ["Armut", "Meyve", "Kırmızı", "Amasya"], correct: "Meyve", difficulty: 1, skill: 'linguistic', errorTags: {"Armut": "semantic_error", "Kırmızı": "visual_association"} },
        { id: 'l2', text: "'Siyah' kelimesinin zıt anlamlısı nedir?", options: ["Beyaz", "Kara", "Mavi", "Karanlık"], correct: "Beyaz", difficulty: 1, skill: 'linguistic', errorTags: {"Kara": "synonym_confusion", "Karanlık": "association_error"} },
        { id: 'l3', text: "Aşağıdaki kelimelerden hangisi doğru yazılmıştır?", options: ["Yalnış", "Yanlış", "Yanluş", "Yannış"], correct: "Yanlış", difficulty: 2, skill: 'linguistic', errorTags: {"Yalnış": "metathesis_error", "Yannış": "phonological_error"} },
        { id: 'l4', text: "'Kütüphane' kelimesinde kaç hece vardır?", options: ["3", "4", "5", "6"], correct: "4", difficulty: 2, skill: 'linguistic', errorTags: {"3": "counting_error", "5": "counting_error"} },
        { id: 'l5', text: "Hangi kelime diğerlerinden farklı bir kategoridedir?", options: ["Sandalye", "Masa", "Koltuk", "Elma"], correct: "Elma", difficulty: 3, skill: 'linguistic', errorTags: {"Sandalye": "category_error", "Masa": "category_error"} },
        { id: 'l6', text: "'Gözlük' kelimesindeki ek hangisidir?", options: ["-lük", "-k", "-göz", "-ü"], correct: "-lük", difficulty: 3, skill: 'linguistic', errorTags: {"-k": "morphology_error"} },
        { id: 'l7', text: "Aşağıdaki cümlede hangi kelime 'sıfat' görevindedir? 'Kırmızı araba hızlı gidiyordu.'", options: ["Kırmızı", "Araba", "Hızlı", "Gidiyordu"], correct: "Kırmızı", difficulty: 4, skill: 'linguistic', errorTags: {"Araba": "noun_confusion", "Gidiyordu": "verb_confusion"} },
    ],
    'spatial': [
        { id: 's1', text: "Aşağıdaki harfin aynısını bul: ( b )", options: ["d", "p", "q", "b"], correct: "b", difficulty: 1, skill: 'spatial', subSkill: 'reversal', errorTags: {"d": "reversal_error", "p": "inversion_error", "q": "rotation_error"} },
        { id: 's2', text: "Hangi şekil diğerlerinden farklıdır? (Üçgen - Üçgen - Kare - Üçgen)", options: ["1. Üçgen", "Kare", "Son Üçgen", "Hepsi Aynı"], correct: "Kare", difficulty: 1, skill: 'spatial', errorTags: {"1. Üçgen": "attention_lapse"} },
        { id: 's3', text: "Aşağıdaki harf dizisinde kuralı bozan hangisidir? ( b - b - d - b )", options: ["d", "b", "Hepsi aynı", "Hiçbiri"], correct: "d", difficulty: 2, skill: 'spatial', subSkill: 'sequencing', errorTags: {"b": "visual_discrimination_error"} },
        { id: 's4', text: "'p' harfinin aynadaki görüntüsü hangisidir?", options: ["q", "b", "d", "p"], correct: "q", difficulty: 3, skill: 'spatial', subSkill: 'mental_rotation', errorTags: {"b": "axis_confusion", "d": "double_flip"} },
        { id: 's5', text: "Hangi kelime tersten okunduğunda da aynıdır?", options: ["KAZAK", "KAZAN", "KABAK", "KASAP"], correct: "KAZAK", difficulty: 3, skill: 'spatial', errorTags: {"KABAK": "visual_similarity"} },
        { id: 's6', text: "Hangi şekil saat yönünde döndürüldüğünde diğerleriyle aynı olmaz?", options: ["A", "B", "C", "D"], correct: "C", difficulty: 4, skill: 'spatial', errorTags: {"A": "rotation_error"} } // Placeholder text logic
    ],
    'logical': [
        { id: 'm1', text: "2, 4, 6, ... Sırada hangi sayı gelmelidir?", options: ["7", "8", "9", "10"], correct: "8", difficulty: 1, skill: 'logical', errorTags: {"7": "counting_error"} },
        { id: 'm2', text: "5 elman vardı, 2'sini yedin. Kaç elman kaldı?", options: ["3", "7", "2", "5"], correct: "3", difficulty: 1, skill: 'logical', errorTags: {"7": "operation_confusion_add"} },
        { id: 'm3', text: "Saat 3:00 iken yelkovan (uzun çubuk) nerededir?", options: ["12", "3", "6", "9"], correct: "12", difficulty: 2, skill: 'logical', errorTags: {"3": "hand_confusion"} },
        { id: 'm4', text: "Hangi sayı çifttir?", options: ["3", "5", "8", "1"], correct: "8", difficulty: 2, skill: 'logical', errorTags: {"3": "concept_error"} },
        { id: 'm5', text: "Bir kutuda 12 yumurta var. Yarısı kırıldı. Kaç yumurta kaldı?", options: ["6", "12", "24", "4"], correct: "6", difficulty: 3, skill: 'logical', errorTags: {"24": "operation_confusion_mult"} }
    ],
    'attention': [
        { id: 'a1', text: "Hangi renk ismi kendi rengiyle yazılmamıştır? (Stroop)", options: ["KIRMIZI (Kırmızı)", "MAVİ (Yeşil)", "SARI (Sarı)"], correct: "MAVİ (Yeşil)", difficulty: 2, skill: 'attention', errorTags: {"KIRMIZI (Kırmızı)": "impulsivity"} },
        { id: 'a2', text: "Aşağıdaki dizide kaç tane 'A' harfi vardır? A B A C A D A", options: ["3", "4", "5", "2"], correct: "4", difficulty: 1, skill: 'attention', errorTags: {"3": "counting_lapse"} }
    ]
};

// Generic fillers for other intelligences
['musical', 'kinesthetic', 'naturalistic', 'interpersonal', 'intrapersonal'].forEach(key => {
    if (!QUESTION_BANK[key]) {
        QUESTION_BANK[key] = [
            { id: `${key}1`, text: `${key.toUpperCase()} sorusu (Kolay)`, options: ["Doğru", "Yanlış", "Belki"], correct: "Doğru", difficulty: 1, skill: key as TestCategory, errorTags: {} },
            { id: `${key}2`, text: `${key.toUpperCase()} sorusu (Orta)`, options: ["A", "B", "C"], correct: "A", difficulty: 2, skill: key as TestCategory, errorTags: {} },
            { id: `${key}3`, text: `${key.toUpperCase()} sorusu (Zor)`, options: ["A", "B", "C", "D"], correct: "A", difficulty: 3, skill: key as TestCategory, errorTags: {} },
        ];
    }
});

export const generateOfflineAdaptiveQuestions = (
    skills: TestCategory[], 
    countPerSkill: number = 5
): Record<string, AdaptiveQuestion[]> => {
    const result: Record<string, AdaptiveQuestion[]> = {};
    
    skills.forEach(skill => {
        const pool = QUESTION_BANK[skill] || QUESTION_BANK['logical']; // Fallback
        // Shuffle and pick
        const selected = shuffle(pool).slice(0, countPerSkill);
        
        // If we need more questions than available in offline bank, duplicate or cycle
        while (selected.length < countPerSkill && selected.length > 0) {
            const clone = { ...selected[selected.length % pool.length] };
            clone.id = clone.id + '_dup_' + Math.random();
            selected.push(clone);
        }
        
        result[skill] = selected;
    });
    
    return result;
};
