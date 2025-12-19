
import { Activity, ActivityCategory, ActivityType } from './types';

// Empty Activities List
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
    }
];

// Activity Categories
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
    {
        id: 'math-logic',
        title: 'Matematik & Mantık',
        description: 'Diskalkuli desteği ve sayısal mantık.',
        icon: 'fa-solid fa-calculator',
        activities: [ActivityType.BASIC_OPERATIONS, ActivityType.MATH_PUZZLE, ActivityType.NUMBER_PATTERN, ActivityType.ALGORITHM_GENERATOR]
    },
    {
        id: 'reading-verbal',
        title: 'Okuma & Dil',
        description: 'Disleksi dostu okuma ve yazma materyalleri.',
        icon: 'fa-solid fa-book-open',
        activities: [ActivityType.STORY_COMPREHENSION, ActivityType.STORY_ANALYSIS, ActivityType.MISSING_PARTS]
    },
    {
        id: 'ai-tools',
        title: 'AI Araçları',
        description: 'Yapay zeka destekli dönüşüm araçları.',
        icon: 'fa-solid fa-microchip',
        activities: [ActivityType.AI_WORKSHEET_CONVERTER]
    }
];
