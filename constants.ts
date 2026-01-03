
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
        id: ActivityType.READING_STROOP,
        title: 'Sözel Stroop Testi',
        description: 'Renk ve kelime çelişkisi üzerinden dikkat ve sözel enterferans çalışması.',
        icon: 'fa-solid fa-traffic-light'
    },
    {
        id: ActivityType.LETTER_VISUAL_MATCHING,
        title: 'Harf-Görsel Eşleme',
        description: 'Harflerin şekillerini ve başlangıç seslerini görsellerle ilişkilendirme.',
        icon: 'fa-solid fa-font'
    },
    {
        id: ActivityType.SYLLABLE_WORD_BUILDER,
        title: 'Hece Dedektifi',
        description: 'Karışık heceleri birleştirerek görselle eşleşen kelimeyi inşa etme.',
        icon: 'fa-solid fa-puzzle-piece'
    },
    {
        id: ActivityType.MAP_INSTRUCTION,
        title: 'Harita Dedektifi',
        description: 'Türkiye haritası üzerinde yön, konum and harf takibi yaparak yönergeleri uygulama.',
        icon: 'fa-solid fa-map-location-dot'
    },
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
        description: 'Madeni ve kağıp paraları tanıma, basit alışveriş hesapları.',
        icon: 'fa-solid fa-money-bill-wave'
    },
    {
        id: ActivityType.MATH_MEMORY_CARDS,
        title: 'Matematik Hafıza Kartları',
        description: 'İşlemler ve sonuçlarını eşleştirerek belleği güçlendiren hafıza oyunu.',
        icon: 'fa-solid fa-clone'
    },
    {
        id: ActivityType.FIND_THE_DIFFERENCE,
        title: 'Farkı Bul',
        description: 'Görsel veya metinsel diziler arasındaki farkları ayırt etme.',
        icon: 'fa-solid fa-eye'
    },
    {
        id: ActivityType.VISUAL_ODD_ONE_OUT,
        title: 'Görsel Farklıyı Bul',
        description: 'Görsel örüntüler içindeki uyumsuz öğeyi tespit etme.',
        icon: 'fa-solid fa-ghost'
    },
    {
        id: ActivityType.GRID_DRAWING,
        title: 'Kare Kopyalama',
        description: 'Izgara üzerindeki desenleri hatasız bir şekilde kopyalama çalışması.',
        icon: 'fa-solid fa-border-all'
    },
    {
        id: ActivityType.SYMMETRY_DRAWING,
        title: 'Simetri Tamamlama',
        description: 'Görselin aynadaki yansımasını çizerek tamamlama çalışması.',
        icon: 'fa-solid fa-mirror'
    }
];

// Activity Categories
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
    {
        id: 'visual-perception',
        title: 'Görsel & Mekansal',
        description: 'Görsel tarama, uzamsal algı ve yön tayini çalışmaları.',
        icon: 'fa-solid fa-eye',
        activities: [ActivityType.MAP_INSTRUCTION, ActivityType.FIND_THE_DIFFERENCE, ActivityType.VISUAL_ODD_ONE_OUT, ActivityType.GRID_DRAWING, ActivityType.SYMMETRY_DRAWING]
    },
    {
        id: 'reading-verbal',
        title: 'Okuma & Dil',
        description: 'Disleksi dostu okuma ve yazma materyalleri.',
        icon: 'fa-solid fa-book-open',
        activities: [ActivityType.LETTER_VISUAL_MATCHING, ActivityType.READING_STROOP, ActivityType.SYLLABLE_WORD_BUILDER, ActivityType.STORY_COMPREHENSION, ActivityType.HIDDEN_PASSWORD_GRID, ActivityType.STORY_ANALYSIS, ActivityType.MISSING_PARTS]
    },
    {
        id: 'math-logic',
        title: 'Matematik & Mantık',
        description: 'Sayısal akıl yürütme ve işlem yeteneği geliştirme.',
        icon: 'fa-solid fa-calculator',
        activities: [
            ActivityType.NUMBER_LOGIC_RIDDLES,
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
