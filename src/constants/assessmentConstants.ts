import { CognitiveDomain, ActivityType } from '../types';

export const DOMAINS: { id: CognitiveDomain; title: string; desc: string; icon: string; estimatedTime: string; color: string }[] = [
    { id: 'visual_spatial_memory', title: 'Görsel-Uzamsal Bellek', desc: 'Kısa süreli görsel hafıza ve desen takibi.', icon: 'fa-table-cells', estimatedTime: '3 dk', color: 'indigo' },
    { id: 'processing_speed', title: 'Hızlı İsimlendirme (RAN)', desc: 'Görsel uyaranları işlemleme ve sözel tepki hızı.', icon: 'fa-stopwatch', estimatedTime: '2 dk', color: 'cyan' },
    { id: 'selective_attention', title: 'Stroop Testi (Dikkat)', desc: 'Dürtü kontrolü, odaklanma ve çeldirici baskılama.', icon: 'fa-traffic-light', estimatedTime: '3 dk', color: 'purple' },
    { id: 'phonological_loop', title: 'Fonolojik Döngü', desc: 'Sözel çalışma belleği ve hece/kelime tekrarı.', icon: 'fa-volume-high', estimatedTime: '4 dk', color: 'rose' },
    { id: 'logical_reasoning', title: 'Mantıksal Muhakeme', desc: 'Akışkan zeka, desen tanıma ve problem çözme.', icon: 'fa-brain', estimatedTime: '5 dk', color: 'amber' },
    { id: 'visual_search', title: 'Görsel Arama', desc: 'Hedef uyaranı karmaşada bulma.', icon: 'fa-magnifying-glass', estimatedTime: '3 dk', color: 'emerald' },
    { id: 'working_memory', title: 'Çalışma Belleği', desc: 'Bilgiyi geçici olarak saklama ve işleme.', icon: 'fa-brain', estimatedTime: '4 dk', color: 'teal' },
    { id: 'planning', title: 'Planlama', desc: 'Strateji geliştirme ve hedefe ulaşma.', icon: 'fa-chess-board', estimatedTime: '5 dk', color: 'violet' },
    { id: 'auditory_processing', title: 'İşitsel İşleme', desc: 'Sesleri algılama ve ayırt etme.', icon: 'fa-volume-high', estimatedTime: '3 dk', color: 'sky' },
    { id: 'visual_motor_integration', title: 'Görsel-Motor Entegrasyon', desc: 'El-göz koordinasyonu.', icon: 'fa-palette', estimatedTime: '4 dk', color: 'orange' },
    { id: 'verbal_comprehension', title: 'Sözel Kavrama', desc: 'Kelime anlamları ve ilişkileri.', icon: 'fa-book', estimatedTime: '3 dk', color: 'pink' }
];

export const DOMAIN_COLORS: Record<string, string> = {
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    rose: 'border-rose-500 bg-rose-50 dark:bg-rose-900/20',
    amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    emerald: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    teal: 'border-teal-500 bg-teal-50 dark:bg-teal-900/20',
    violet: 'border-violet-500 bg-violet-50 dark:bg-violet-900/20',
    sky: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    pink: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20',
};

export const DOMAIN_ICON_COLORS: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    purple: 'bg-purple-100 text-purple-600',
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    teal: 'bg-teal-100 text-teal-600',
    violet: 'bg-violet-100 text-violet-600',
    sky: 'bg-sky-100 text-sky-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
};

export const DOMAIN_ACTIVITY_MAP: Record<CognitiveDomain, ActivityType[]> = {
    visual_spatial_memory: [ActivityType.VISUAL_MEMORY, ActivityType.GRID_DRAWING, ActivityType.DOT_PAINTING],
    processing_speed: [ActivityType.RAPID_NAMING, ActivityType.READING_FLOW],
    selective_attention: [ActivityType.STROOP_TEST, ActivityType.BURDON_TEST, ActivityType.ATTENTION_TO_QUESTION, ActivityType.FIND_THE_DIFFERENCE],
    phonological_loop: [ActivityType.PHONOLOGICAL_AWARENESS, ActivityType.SYLLABLE_TRAIN, ActivityType.WORD_MEMORY],
    logical_reasoning: [ActivityType.LOGIC_GRID_PUZZLE, ActivityType.NUMBER_PATTERN],
    visual_search: [ActivityType.TARGET_SEARCH, ActivityType.VISUAL_TRACKING_LINES, ActivityType.CHAOTIC_NUMBER_SEARCH],
    working_memory: [ActivityType.WORD_MEMORY, ActivityType.SYLLABLE_TRAIN],
    planning: [ActivityType.LOGIC_GRID_PUZZLE, ActivityType.NUMBER_PATTERN],
    auditory_processing: [ActivityType.PHONOLOGICAL_AWARENESS, ActivityType.SYLLABLE_TRAIN],
    visual_motor_integration: [ActivityType.GRID_DRAWING, ActivityType.DOT_PAINTING],
    verbal_comprehension: [ActivityType.READING_COMPREHENSION, ActivityType.SYNONYM_ANTONYM_MATCH]
};
