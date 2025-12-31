import { Activity, ActivityCategory, ActivityType } from './types';

// Difficulty Levels
export const DIFFICULTY_OPTIONS = [
    { value: 'Başlangıç', label: 'Başlangıç' },
    { value: 'Orta', label: 'Orta' },
    { value: 'Zor', label: 'Zor' },
    { value: 'Uzman', label: 'Uzman' }
];

// Activities List
export const ACTIVITIES: Activity[] = [
    {
        id: ActivityType.ALGORITHM_GENERATOR,
        title: 'Algoritma Üretici',
        description: 'Sıralı düşünme ve mantık yürütme becerilerini geliştiren akış şemaları.',
        icon: 'fa-solid fa-code-fork'
    },
    {
        id: ActivityType.AI_WORKSHEET_CONVERTER,
        title: 'AI Destekli Dönüştürücü',
        description: 'Mevcut materyalleri yapay zeka ile akıllı çalışma sayfalarına dönüştürün.',
        icon: 'fa-solid fa-wand-sparkles'
    },
    {
        id: ActivityType.HIDDEN_PASSWORD_GRID,
        title: 'Gizli Şifre Matrisi',
        description: 'Izgara içindeki harfleri eleyerek gizli kelimeyi bulma bulmacası.',
        icon: 'fa-solid fa-border-none'
    },
    {
        id: ActivityType.NUMBER_LOGIC_RIDDLES,
        title: 'Sayısal Mantık Bilmeceleri',
        description: 'Sayıların özellikleri üzerinden miktar ve büyüklük kavramlarını geliştiren mantık oyunları.',
        icon: 'fa-solid fa-brain-circuit'
    },
    {
        id: ActivityType.BASIC_OPERATIONS,
        title: 'Dört İşlem Alıştırması',
        description: 'Toplama, çıkarma, çarpma ve bölme becerilerini geliştiren özelleştirilebilir alıştırmalar.',
        icon: 'fa-solid fa-calculator'
    },
    {
        id: ActivityType.MATH_PUZZLE,
        title: 'Matematik Bulmacaları',
        description: 'Görsel öğelerle desteklenmiş eğlenceli matematik problemleri.',
        icon: 'fa-solid fa-puzzle-piece'
    },
    {
        id: ActivityType.CLOCK_READING,
        title: 'Saat Okuma',
        description: 'Analog ve dijital saatler arasındaki ilişkiyi kavrama alıştırmaları.',
        icon: 'fa-solid fa-clock'
    },
    {
        id: ActivityType.MONEY_COUNTING,
        title: 'Paralarımız',
        description: 'Madeni ve kağıt paraları tanıma, basit alışveriş hesapları.',
        icon: 'fa-solid fa-money-bill-wave'
    },
    {
        id: ActivityType.MATH_MEMORY_CARDS,
        title: 'Matematik Hafıza Kartları',
        description: 'İşlemler ve sonuçlarını eşleştirerek belleği güçlendiren hafıza oyunu.',
        icon: 'fa-solid fa-clone'
    }
];

// Activity Categories
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
    {
        id: 'reading-verbal',
        title: 'Okuma & Dil',
        description: 'Disleksi dostu okuma ve yazma materyalleri.',
        icon: 'fa-solid fa-book-open',
        activities: [ActivityType.STORY_COMPREHENSION, ActivityType.HIDDEN_PASSWORD_GRID, ActivityType.STORY_ANALYSIS, ActivityType.MISSING_PARTS]
    },
    {
        id: 'math-logic',
        title: 'Matematik & Mantık',
        description: 'Sayısal akıl yürütme ve işlem yeteneği geliştirme.',
        icon: 'fa-solid fa-calculator',
        activities: [
            ActivityType.NUMBER_LOGIC_RIDDLES,
            ActivityType.BASIC_OPERATIONS, 
            ActivityType.MATH_PUZZLE, 
            ActivityType.NUMBER_PATTERN,
            ActivityType.KENDOKU,
            ActivityType.NUMBER_PYRAMID,
            ActivityType.REAL_LIFE_MATH_PROBLEMS,
            ActivityType.CLOCK_READING,
            ActivityType.MONEY_COUNTING,
            ActivityType.MATH_MEMORY_CARDS
        ]
    }
];
