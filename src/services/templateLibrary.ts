/**
 * OOGMATIK — Premium Etkinlik Kütüphanesi
 *
 * Mod 2 (sıfırdan üretim) için zengin şablon ve içerik bankası.
 * Sınıf düzeyi, beceri alanı, soru tipi bazlı filtreleme.
 *
 * Elif Yıldız: Her şablon ZPD uyumlu, pedagojik temelli.
 * Selin Arslan: AI prompt'larında kütüphane ilham kaynağı, kopyalama yasak.
 */

import type {
    QuestionType,
    Difficulty,
    _ProductionMode,
} from '../types/ocr-activity';
import type { AgeGroup, LearningDisabilityProfile } from '../types/creativeStudio';

// ─── Premium Şablon Arayüzü ─────────────────────────────────────────────

export interface PremiumTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    subject: string;
    gradeRange: { min: number; max: number };
    ageGroup: AgeGroup;
    questionTypes: QuestionType[];
    difficulty: Difficulty;
    estimatedDuration: number;
    targetSkills: string[];
    /** Şablon yapısı (bölüm sayısı ve tipleri) */
    structure: TemplateStructure;
    /** Pedagojik açıklama */
    pedagogicalDescription: string;
    /** Disleksi/ADHD uyumluluğu */
    supportedProfiles: LearningDisabilityProfile[];
    /** Etiketler (arama için) */
    tags: string[];
}

export type TemplateCategory =
    | 'matematik'
    | 'turkce'
    | 'fen_bilimleri'
    | 'sosyal_bilgiler'
    | 'ingilizce'
    | 'gorunsel_algi'
    | 'dikkat_bellek'
    | 'genel';

export interface TemplateStructure {
    columns: number;
    sectionTypes: Array<'header' | 'instruction' | 'question_block' | 'image_area' | 'answer_key' | 'footer'>;
    questionCount: number;
    hasImages: boolean;
    hasAnswerKey: boolean;
}

// ─── Yerleşik Premium Şablonlar ──────────────────────────────────────────

const PREMIUM_TEMPLATES: PremiumTemplate[] = [
    // ────── MATEMATİK ──────
    {
        id: 'tmpl_math_basic_ops',
        name: 'Temel İşlemler Çalışma Kâğıdı',
        description: 'Toplama, çıkarma, çarpma, bölme işlemleri. 2 sütunlu düzen, 10-20 soru.',
        category: 'matematik',
        subject: 'Matematik',
        gradeRange: { min: 1, max: 4 },
        ageGroup: '5-7',
        questionTypes: ['fill_in_the_blank'],
        difficulty: 'Kolay',
        estimatedDuration: 15,
        targetSkills: ['İşlem becerisi', 'Sayı algısı', 'Zihinsel hesaplama'],
        structure: {
            columns: 2,
            sectionTypes: ['header', 'instruction', 'question_block', 'answer_key', 'footer'],
            questionCount: 15,
            hasImages: false,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Temel aritmetik işlemleri pekiştiren, disleksi dostu büyük punto ve geniş satır aralığı ile tasarlanmış çalışma kâğıdı.',
        supportedProfiles: ['dyslexia', 'dyscalculia', 'adhd', 'mixed'],
        tags: ['toplama', 'çıkarma', 'çarpma', 'bölme', 'temel işlemler'],
    },
    {
        id: 'tmpl_math_word_problems',
        name: 'Sözel Problemler',
        description: 'Günlük hayattan senaryolarla problem çözme. Tek sütun, 5-8 soru.',
        category: 'matematik',
        subject: 'Matematik',
        gradeRange: { min: 3, max: 6 },
        ageGroup: '8-10',
        questionTypes: ['open_ended'],
        difficulty: 'Orta',
        estimatedDuration: 25,
        targetSkills: ['Problem çözme', 'Okuduğunu anlama', 'Modelleme'],
        structure: {
            columns: 1,
            sectionTypes: ['header', 'instruction', 'question_block', 'answer_key', 'footer'],
            questionCount: 6,
            hasImages: true,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Gerçek yaşam senaryoları ile matematik becerilerini uygulatan, ADHD öğrenciler için kısa ve odaklı problemler.',
        supportedProfiles: ['dyslexia', 'dyscalculia', 'adhd', 'mixed'],
        tags: ['sözel problem', 'günlük hayat', 'problem çözme'],
    },
    {
        id: 'tmpl_math_pattern',
        name: 'Örüntü ve Desen Tamamlama',
        description: 'Sayı ve şekil örüntülerini tamamlama. Görsel ağırlıklı.',
        category: 'matematik',
        subject: 'Matematik',
        gradeRange: { min: 1, max: 5 },
        ageGroup: '5-7',
        questionTypes: ['fill_in_the_blank'],
        difficulty: 'Kolay',
        estimatedDuration: 15,
        targetSkills: ['Örüntü algısı', 'Mantıksal düşünme', 'Görsel algı'],
        structure: {
            columns: 1,
            sectionTypes: ['header', 'instruction', 'image_area', 'question_block', 'answer_key', 'footer'],
            questionCount: 8,
            hasImages: true,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Görsel ve sayısal örüntülerle mantıksal düşünme becerilerini geliştiren, disleksi dostu format.',
        supportedProfiles: ['dyslexia', 'dyscalculia', 'adhd', 'mixed'],
        tags: ['örüntü', 'desen', 'sıralama', 'mantık'],
    },

    // ────── TÜRKÇE ──────
    {
        id: 'tmpl_turkce_reading',
        name: 'Okuma Anlama Çalışma Kâğıdı',
        description: 'Metin + anlama soruları. Hece vurgulu, disleksi dostu tipografi.',
        category: 'turkce',
        subject: 'Türkçe',
        gradeRange: { min: 2, max: 6 },
        ageGroup: '8-10',
        questionTypes: ['multiple_choice', 'open_ended', 'true_false'],
        difficulty: 'Orta',
        estimatedDuration: 30,
        targetSkills: ['Okuduğunu anlama', 'Çıkarım yapma', 'Ana fikir bulma'],
        structure: {
            columns: 1,
            sectionTypes: ['header', 'instruction', 'question_block', 'answer_key', 'footer'],
            questionCount: 8,
            hasImages: false,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Lexend font, geniş satır aralığı ve hece vurgulama ile disleksi dostu okuma metni ve anlama soruları.',
        supportedProfiles: ['dyslexia', 'adhd', 'mixed'],
        tags: ['okuma', 'anlama', 'metin', 'soru'],
    },
    {
        id: 'tmpl_turkce_fill_blank',
        name: 'Boşluk Doldurma — Kelime Bilgisi',
        description: 'Cümle içi boşlukları uygun kelimelerle doldurma.',
        category: 'turkce',
        subject: 'Türkçe',
        gradeRange: { min: 2, max: 5 },
        ageGroup: '8-10',
        questionTypes: ['fill_in_the_blank'],
        difficulty: 'Kolay',
        estimatedDuration: 15,
        targetSkills: ['Kelime bilgisi', 'Cümle tamamlama', 'Bağlamdan anlam çıkarma'],
        structure: {
            columns: 1,
            sectionTypes: ['header', 'instruction', 'question_block', 'answer_key', 'footer'],
            questionCount: 10,
            hasImages: false,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Bağlamsal ipuçlarıyla kelime bilgisini geliştiren, disleksi dostu büyük ve okunaklı format.',
        supportedProfiles: ['dyslexia', 'adhd', 'mixed'],
        tags: ['boşluk doldurma', 'kelime', 'cümle'],
    },
    {
        id: 'tmpl_turkce_matching',
        name: 'Eşleştirme — Eş Anlamlı / Zıt Anlamlı',
        description: '2 sütunlu eşleştirme formatı.',
        category: 'turkce',
        subject: 'Türkçe',
        gradeRange: { min: 3, max: 6 },
        ageGroup: '8-10',
        questionTypes: ['matching'],
        difficulty: 'Orta',
        estimatedDuration: 15,
        targetSkills: ['Eş anlamlı kelimeler', 'Zıt anlamlı kelimeler', 'Kelime hazinesi'],
        structure: {
            columns: 2,
            sectionTypes: ['header', 'instruction', 'question_block', 'answer_key', 'footer'],
            questionCount: 10,
            hasImages: false,
            hasAnswerKey: true,
        },
        pedagogicalDescription:
            'Kelime çiftlerini eşleştirerek sözcük dağarcığını geliştiren, ADHD için kısa ve odaklı etkinlik.',
        supportedProfiles: ['dyslexia', 'adhd', 'mixed'],
        tags: ['eşleştirme', 'eş anlamlı', 'zıt anlamlı'],
    },

    // ────── GÖRSEL ALGI ──────
    {
        id: 'tmpl_visual_perception',
        name: 'Görsel Algı — Fark Bul / Şekil Tamamla',
        description: 'Görsel dikkat ve algı becerilerini geliştiren etkinlikler.',
        category: 'gorunsel_algi',
        subject: 'Görsel Algı',
        gradeRange: { min: 1, max: 4 },
        ageGroup: '5-7',
        questionTypes: ['open_ended'],
        difficulty: 'Kolay',
        estimatedDuration: 15,
        targetSkills: ['Görsel ayrıntı algısı', 'Şekil tamamlama', 'Görsel bellek'],
        structure: {
            columns: 2,
            sectionTypes: ['header', 'instruction', 'image_area', 'question_block', 'footer'],
            questionCount: 6,
            hasImages: true,
            hasAnswerKey: false,
        },
        pedagogicalDescription:
            'Disleksi ve ADHD profili için görsel algı becerilerini güçlendiren, oyun tabanlı etkinlik formatı.',
        supportedProfiles: ['dyslexia', 'dyscalculia', 'adhd', 'mixed'],
        tags: ['fark bul', 'şekil', 'görsel algı', 'dikkat'],
    },

    // ────── DİKKAT & BELLEK ──────
    {
        id: 'tmpl_attention_memory',
        name: 'Dikkat ve Kısa Süreli Bellek',
        description: 'Sıralama, eşleştirme ve hatırlama etkinlikleri.',
        category: 'dikkat_bellek',
        subject: 'Bilişsel Beceriler',
        gradeRange: { min: 1, max: 6 },
        ageGroup: '8-10',
        questionTypes: ['fill_in_the_blank', 'ordering'],
        difficulty: 'Orta',
        estimatedDuration: 20,
        targetSkills: ['Seçici dikkat', 'Kısa süreli bellek', 'Çalışma belleği'],
        structure: {
            columns: 1,
            sectionTypes: ['header', 'instruction', 'question_block', 'footer'],
            questionCount: 8,
            hasImages: true,
            hasAnswerKey: false,
        },
        pedagogicalDescription:
            'ADHD profili için özel tasarlanmış, kısa süreli ve odaklı dikkat antrenman etkinlikleri.',
        supportedProfiles: ['adhd', 'dyslexia', 'mixed'],
        tags: ['dikkat', 'bellek', 'sıralama', 'hatırlama'],
    },
];

// ─── Kütüphane Servisi ───────────────────────────────────────────────────

export const templateLibrary = {
    /**
     * Tüm premium şablonları döndürür.
     */
    getAll(): PremiumTemplate[] {
        return PREMIUM_TEMPLATES;
    },

    /**
     * Kategori bazlı şablon getir.
     */
    getByCategory(category: TemplateCategory): PremiumTemplate[] {
        return PREMIUM_TEMPLATES.filter((t) => t.category === category);
    },

    /**
     * Sınıf düzeyine göre filtrele.
     */
    getByGradeLevel(gradeLevel: number): PremiumTemplate[] {
        return PREMIUM_TEMPLATES.filter(
            (t) => gradeLevel >= t.gradeRange.min && gradeLevel <= t.gradeRange.max
        );
    },

    /**
     * Soru tipi bazlı şablon getir.
     */
    getByQuestionType(type: QuestionType): PremiumTemplate[] {
        return PREMIUM_TEMPLATES.filter((t) => t.questionTypes.includes(type));
    },

    /**
     * Zorluk seviyesine göre filtrele.
     */
    filterByDifficulty(templates: PremiumTemplate[], difficulty: Difficulty): PremiumTemplate[] {
        return templates.filter((t) => t.difficulty === difficulty);
    },

    /**
     * Profil uyumlu şablonları filtrele.
     */
    filterByProfile(
        templates: PremiumTemplate[],
        profile: LearningDisabilityProfile
    ): PremiumTemplate[] {
        return templates.filter((t) => t.supportedProfiles.includes(profile));
    },

    /**
     * Prompt'tan otomatik şablon seç.
     * Anahtar kelime eşleştirmesi ve puan sistemi ile en uygun şablonu bulur.
     */
    autoSelectTemplate(prompt: string, gradeLevel: number): PremiumTemplate | null {
        const lowerPrompt = prompt.toLowerCase();

        // Sınıf düzeyine göre filtrele
        const candidates = this.getByGradeLevel(gradeLevel);
        if (candidates.length === 0) return PREMIUM_TEMPLATES[0] || null;

        // Puan sistemi ile en iyi eşleşmeyi bul
        let bestMatch: PremiumTemplate | null = null;
        let bestScore = 0;

        for (const template of candidates) {
            let score = 0;

            // Tag eşleşmesi
            for (const tag of template.tags) {
                if (lowerPrompt.includes(tag.toLowerCase())) {
                    score += 10;
                }
            }

            // Konu eşleşmesi
            if (lowerPrompt.includes(template.subject.toLowerCase())) {
                score += 15;
            }

            // Kategori eşleşmesi
            if (lowerPrompt.includes(template.category.replace('_', ' '))) {
                score += 10;
            }

            // Beceri eşleşmesi
            for (const skill of template.targetSkills) {
                if (lowerPrompt.includes(skill.toLowerCase())) {
                    score += 5;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = template;
            }
        }

        // En az %20 eşleşme yoksa ilk uygun şablonu döndür
        return bestMatch || candidates[0] || null;
    },

    /**
     * Etiket bazlı arama.
     */
    searchByTags(tags: string[]): PremiumTemplate[] {
        const lowerTags = tags.map((t) => t.toLowerCase());
        return PREMIUM_TEMPLATES.filter((template) =>
            template.tags.some((tag) => lowerTags.includes(tag.toLowerCase()))
        );
    },

    /**
     * ID ile şablon getir.
     */
    getById(id: string): PremiumTemplate | null {
        return PREMIUM_TEMPLATES.find((t) => t.id === id) ?? null;
    },
};
