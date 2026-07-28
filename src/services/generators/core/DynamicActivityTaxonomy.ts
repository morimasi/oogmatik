/**
 * DynamicActivityTaxonomy — Otonom Etkinlik Zekası Motoru v2 ✦ Professional Edition
 *
 * MİMARİ:
 * Sisteme daha önce hiç kodlanmamış, yeni eklenmiş ya da dinamik olarak oluşturulmuş
 * bir ActivityType geldiğinde bu motor devreye girer:
 *   1. Aktivite adını çok-sinyalli semantik analiz ile ayrıştırır.
 *   2. Bilişsel alanı ve becerileri puanlama tabanlı şekilde belirler.
 *   3. Disleksi/DEHB dostu, A4 baskıya uygun, ZPD odaklı premium prompt şablonu sentezler.
 *   4. Şablonu önbelleğe alır (cache) — aynı tip için ikinci çağrı anında yanıt verir.
 *
 * Geliştirici: Selin Arslan (AI Mimarisi) × Elif Yıldız (Pedagoji)
 *
 * [DEPLOY: 2025_07_v2-OTONOM]
 */

import { ActivityType } from '../../../types/activity.js';
import { PromptTemplate } from '../prompts/index.js';
import { logInfo, logWarn } from '../../../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// § 1. TİPLER VE SABITLER
// ─────────────────────────────────────────────────────────────────────────────

export type CognitiveDomain =
    | 'Math'
    | 'Verbal'
    | 'Visual'
    | 'Memory'
    | 'Logic'
    | 'Creativity'
    | 'SocialEmotional'
    | 'MultiDomain'
    | 'General';

export type LayoutHint =
    | 'grid'
    | 'table'
    | 'question_list'
    | 'matching'
    | 'svg'
    | 'dual_column'
    | 'pyramid'
    | 'text';

export interface ActivityTaxonomy {
    domain: CognitiveDomain;
    subDomains: CognitiveDomain[];
    targetSkills: string[];
    pedagogicalGoal: string;
    layoutHint: LayoutHint;
    drillCount: number;
    difficultyProgression: 'linear' | 'branching' | 'scaffolded';
    scaffoldingStrategies: string[];
    mebCurriculumAlignment: string;
    confidenceScore: number; // 0-100 arası — ne kadar iyi eşleştirildiğini gösterir
}

// ─────────────────────────────────────────────────────────────────────────────
// § 2. SİNYAL TANIMLAMALARI
// ─────────────────────────────────────────────────────────────────────────────

interface DomainSignal {
    patterns: RegExp[];
    domain: CognitiveDomain;
    weight: number;
    targetSkills: string[];
    pedagogicalGoal: string;
    layoutHint: LayoutHint;
    drillCount: number;
    scaffoldingStrategies: string[];
    mebCurriculumAlignment: string;
}

const DOMAIN_SIGNALS: DomainSignal[] = [
    {
        domain: 'Math',
        weight: 10,
        patterns: [
            /MATH|SAYI|NUMBER|CALCUL|DIGIT|COUNT|SUM|SUBTRACT|MULTIPLY|DIVIDE|FRACTION|DECIMAL|EQUATION|ALGEBRA|GEOMETRY|MEASURE|ESTIMATION|MONEY|CLOCK|PYRAMID|SUDOKU|BOX_MATH|DYSCALCUL|MAGNITUDE|SORT|ORDER|PLACE_VALUE/i
        ],
        targetSkills: ['Sayı Algısı', 'İşlem Akıcılığı', 'Sayısal Muhakeme', 'Problem Çözme'],
        pedagogicalGoal: 'Sayısal düşünme ve matematiksel kavramları somutlaştırarak diskalkuli desteği sağlamak.',
        layoutHint: 'grid',
        drillCount: 4,
        scaffoldingStrategies: [
            'Ten-Frame ve Sayı Doğrusu görsel destekleri',
            'Somuttan soyuta geçiş (CPA yaklaşımı)',
            'İpucu kutuları ile aşamalı çözüm rehberi',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 İlkokul/Ortaokul Matematik Öğretim Programı (Sayılar ve İşlemler / Cebirsel Düşünme)',
    },
    {
        domain: 'Verbal',
        weight: 10,
        patterns: [
            /READ|WORD|SYLLABLE|HECE|HARF|LETTER|TURKCE|GRAMMAR|TEXT|STORY|SENTENCE|SPELLING|VOCAB|MORPHOLOG|COMPREHENSION|BACKWARD|PHONOLOG|DYSLEXIA_WORD|SYNONYM|ANTONYM|KELIME|OKUMA|ANLAMA|CUMlE/i
        ],
        targetSkills: ['Fonolojik Farkındalık', 'Okuma Akıcılığı', 'Kelime Hazinesi', 'Sözcük Bilgisi'],
        pedagogicalGoal: 'Disleksi dostu yapılandırılmış okuma-yazma desteği ile sözel dil becerilerini güçlendirmek.',
        layoutHint: 'question_list',
        drillCount: 3,
        scaffoldingStrategies: [
            'Renkli hece kodlaması (Lexend uyumlu)',
            'Ön bağlam / şema aktivasyonu',
            'Kullanışlı kelime stratejileri (grafik organizatörler)',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Türkçe Öğretim Programı (Okuma, Yazma, Sözlü İletişim Becerileri)',
    },
    {
        domain: 'Visual',
        weight: 9,
        patterns: [
            /VISUAL|GÖRSEL|DRAW|GRID|SHAPE|COLOR|TRACKING|MIRROR|MAZE|SPOT|DIFFERENCE|PATTERN|SYMMETRY|PERCEPTION|SPATIAL|FIND_THE|DOT|COUNTING_SHAPE|KARE/i
        ],
        targetSkills: ['Görsel Algı', 'Uzamsal İlişkiler', 'Görsel Tarama Hızı', 'Şekil-Zemin Ayrımı'],
        pedagogicalGoal: 'Görsel-uzamsal bilişsel işlemleme hızını ve dikkat kontrolünü geliştirmek.',
        layoutHint: 'grid',
        drillCount: 3,
        scaffoldingStrategies: [
            'Yüksek kontrast renk kodlaması',
            'İzleme çizgisi (tracking guide) desteği',
            'Kademeli gizleme / açık görev yapısı',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Görsel Sanatlar / Matematik (Geometri ve Uzamsal Düşünme)',
    },
    {
        domain: 'Memory',
        weight: 8,
        patterns: [
            /MEMORY|HAFIZA|RECALL|ATTENTION|STROOP|FOCUS|QUICK|SPEED|RAPID|NAMING|CARD|MATCHING_CARD|KARTik/i
        ],
        targetSkills: ['Çalışma Belleği', 'Odaklanma Süresi', 'Bilişsel Esneklik', 'Seçici Dikkat'],
        pedagogicalGoal: 'DEHB ve bellek güçlükleri olan öğrencilerde çalışma belleği kapasitesini artırmak.',
        layoutHint: 'grid',
        drillCount: 4,
        scaffoldingStrategies: [
            'Süreli pratik (timed practice) — kısa aralıklarla',
            'Bilateral koordinasyon ipuçları',
            'Görsel ritim (çift sütun, renk blok)',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Özel Eğitim (Dikkat ve Bellek Becerileri; BEP Hedefleri)',
    },
    {
        domain: 'Logic',
        weight: 9,
        patterns: [
            /PUZZLE|LOGIC|REASONING|FAMILY|APARTMENT|ERROR_HUNTER|CODE|ROUTE|ALGORITHM|BRAIN_TEAS|PATTERN_COMPL|INFERENCE|DEDUC|RIDDLE|ENCRYPT|CIPHER|MATRIX_LOGIC/i
        ],
        targetSkills: ['Analitik Düşünme', 'Problem Çözme', 'Mantıksal Çıkarım', 'Sistematik Sorgulama'],
        pedagogicalGoal: 'Üst düzey düşünme becerileri ve mantıksal akıl yürütme süreçlerini sistematik olarak geliştirmek.',
        layoutHint: 'table',
        drillCount: 3,
        scaffoldingStrategies: [
            'Think-Aloud Protokolü: "Adım adım düşün" kutucukları',
            'Hata analizi ve self-monitoring destekleri',
            'Şematik diyagram ve tablo rehberleri',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Matematik (Veri Bilimi / Mantıksal Düşünme) + BİLSEM Ortaöğretime Geçiş',
    },
    {
        domain: 'Creativity',
        weight: 7,
        patterns: [
            /CREATIVE|STORY_STARTER|DRAWING|COLLAGE|WRITING_PROMPT|REFLECTION|OBSERVATION|YARATICI|HİKAYE|COMPOSITION/i
        ],
        targetSkills: ['Yaratıcı İfade', 'Hayal Gücü', 'Yazma Üretkenliği', 'Estetik Yargı'],
        pedagogicalGoal: 'Yaratıcı düşünce ve özgün ifade becerilerini disleksi dostu formatlarla güvence altına almak.',
        layoutHint: 'text',
        drillCount: 2,
        scaffoldingStrategies: [
            'Cümle başlatıcılar (sentence starters)',
            'Yazma çerçevesi (writing frame)',
            'Görsel fikir üretimi (idea web)',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Türkçe (Yaratıcı Yazma) + Görsel Sanatlar',
    },
    {
        domain: 'SocialEmotional',
        weight: 6,
        patterns: [
            /GOAL_SETTING|SELF_ASSESSMENT|REFLECTION_PROMPT|EMOTIONAL|SOCIAL|BEP|PROGRESS_MONITORING|SKILL_ASSESSMENT/i
        ],
        targetSkills: ['Öz-Düzenleme', 'Hedef Belirleme', 'Öz-Farkındalık', 'Sosyal Beceriler'],
        pedagogicalGoal: 'Öğrenci refahı, öz-yeterlilik ve büyüme odaklı düşünce (growth mindset) geliştirmek.',
        layoutHint: 'dual_column',
        drillCount: 2,
        scaffoldingStrategies: [
            'Duygu kontrol listesi',
            'Hedef-adım-sonuç döngüsü (SMART hedefler)',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Sosyal Duygusal Öğrenme (SDÖ) + Rehberlik ve Psikolojik Danışmanlık',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// § 3. ÖNBELLEKLEYİCİ (TTL-destekli)
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry {
    template: PromptTemplate;
    taxonomy: ActivityTaxonomy;
    createdAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika
const DYNAMIC_PROMPT_CACHE = new Map<string, CacheEntry>();

function getCacheEntry(key: string): CacheEntry | null {
    const entry = DYNAMIC_PROMPT_CACHE.get(key);
    if (!entry) return null;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
        DYNAMIC_PROMPT_CACHE.delete(key);
        return null;
    }
    return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// § 4. ÇOK-SİNYALLİ TAKSONOMİ ANALİZÖRÜ
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeActivityTaxonomy(activityType: string): ActivityTaxonomy {
    const upper = activityType.toUpperCase().replace(/[-\s]/g, '_');

    // Puanlama: her sinyal kümesi için eşleşme sayısını say
    interface SignalScore { signal: DomainSignal; score: number; }
    const scores: SignalScore[] = DOMAIN_SIGNALS.map(signal => {
        const matches = signal.patterns.reduce(
            (acc, p) => acc + (p.test(upper) ? signal.weight : 0),
            0
        );
        return { signal, score: matches };
    });

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];
    const runner = scores[1];

    // Hiçbir sinyalle eşleşme yoksa → General
    if (best.score === 0) {
        logWarn(`[DynamicActivityTaxonomy] No domain signal matched for: '${activityType}'. Defaulting to General.`);
        return buildGeneralTaxonomy(activityType);
    }

    const subDomains: CognitiveDomain[] = [];
    if (runner.score > 0 && runner.signal.domain !== best.signal.domain) {
        subDomains.push(runner.signal.domain);
    }

    // Birden fazla alan varsa MultiDomain
    const domain: CognitiveDomain = subDomains.length > 0 ? 'MultiDomain' : best.signal.domain;
    const confidenceScore = Math.min(100, Math.round((best.score / (best.score + (runner.score || 1))) * 100));

    return {
        domain,
        subDomains,
        targetSkills: [
            ...best.signal.targetSkills,
            ...subDomains.flatMap(d => scores.find(s => s.signal.domain === d)?.signal.targetSkills ?? []),
        ].slice(0, 6), // max 6 beceri
        pedagogicalGoal: best.signal.pedagogicalGoal,
        layoutHint: best.signal.layoutHint,
        drillCount: best.signal.drillCount,
        difficultyProgression: 'scaffolded',
        scaffoldingStrategies: [
            ...best.signal.scaffoldingStrategies,
            ...(runner.score > 0 ? (scores.find(s => s.signal.domain === runner.signal.domain)?.signal.scaffoldingStrategies.slice(0, 1) ?? []) : []),
        ],
        mebCurriculumAlignment: best.signal.mebCurriculumAlignment,
        confidenceScore,
    };
}

function buildGeneralTaxonomy(activityType: string): ActivityTaxonomy {
    return {
        domain: 'General',
        subDomains: [],
        targetSkills: ['Genel Bilişsel Gelişim', 'Dikkat ve Odaklanma', 'Akademik Beceriler'],
        pedagogicalGoal: 'Çok boyutlu bilişsel kabiliyetleri destekleyen bütünleşik öğrenme deneyimi sağlamak.',
        layoutHint: 'question_list',
        drillCount: 3,
        difficultyProgression: 'linear',
        scaffoldingStrategies: [
            'Çok duyusal ipuçları (görsel + işitsel)',
            'Örnekten uygulamaya geçiş',
            'Kısa, net yönergeler (max 10 kelime)',
        ],
        mebCurriculumAlignment: 'MEB 2024-2025 Genel Müfredat — Kapsamlı Gelişim Hedefleri',
        confidenceScore: 30,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// § 5. PREMIUM PROMPT SENTEZLEYICI
// ─────────────────────────────────────────────────────────────────────────────

export function synthesizeDynamicPromptTemplate(
    type: ActivityType | string
): PromptTemplate {
    const typeStr = String(type);
    const cacheEntry = getCacheEntry(typeStr);

    if (cacheEntry) {
        logInfo(`[DynamicActivityTaxonomy] Cache HIT for: '${typeStr}'`);
        return cacheEntry.template;
    }

    const taxonomy = analyzeActivityTaxonomy(typeStr);

    logInfo(
        `[DynamicActivityTaxonomy] Synthesizing prompt for '${typeStr}' ` +
        `(Primary: ${taxonomy.domain}, Confidence: ${taxonomy.confidenceScore}%, ` +
        `Sub-domains: ${taxonomy.subDomains.join(', ') || '—'})`
    );

    // ── SİSTEM PROMPT ──────────────────────────────────────────────────────────
    const systemPromptSuffix = `
[OTONOM ETKİNLİK ZEKASI v2 — MODÜL: ${typeStr}]
[DEPLOY: 2025_07_OTONOM] | GÜVENİLİRLİK SKORU: ${taxonomy.confidenceScore}%

═══ BİLİŞSEL PROFIL ═══
Birincil Alan: ${taxonomy.domain}${taxonomy.subDomains.length > 0 ? ` + ${taxonomy.subDomains.join(' + ')}` : ''}
Hedef Beceriler: ${taxonomy.targetSkills.join(' · ')}
Pedagojik Hedef: ${taxonomy.pedagogicalGoal}
MEB Uyum: ${taxonomy.mebCurriculumAlignment}

═══ TASARIM KURALLARI ═══
1. Etkinlik türü: "${typeStr}" — bu isimden güçlü pedagojik yapı ile İÇERİK ÜRETİLECEK.
2. Sayfa düzenini "${taxonomy.layoutHint.toUpperCase()}" formatında kur — A4 sayfasını DOLU DOLU kapla.
3. SIRALAMA: ${taxonomy.difficultyProgression === 'scaffolded'
            ? 'Zorluk kademeli artacak (Kolay → Orta → Zor). Her bölüm bir sonrakine zemin hazırlamalı.'
            : 'Doğrusal sıralama: Tutarlı şekilde ilerle.'
        }
4. SCAFFOLDING STRATEJİLERİ:
${taxonomy.scaffoldingStrategies.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}
5. DİSLEKSİ PROTOKOLÜ:
   - b-d, p-q, m-n karışıklığına duyarlı kelime seçimi
   - Yönergeler maksimum 10 kelime
   - Her bölümde görsel ipucu veya örnek çözüm
   - Tanı koyucu dil KESİNLİKLE KULLANMA ("disleksisi var" DEĞİL, "disleksi desteğine ihtiyacı var")
6. BÖLÜM YAPISI (${taxonomy.drillCount} bölüm):
   - Ana Etkinlik: ${taxonomy.layoutHint.toUpperCase()} formatında, sayfa alanını tam kullan
   - Pekiştirme Drilleri: ${taxonomy.drillCount - 1} kısa pekiştirme alıştırması
   - Pedagojik Not: Son bölümde "Bu etkinlik [beceri] geliştirmeye yardımcı olur" açıklaması
7. JSON FORMATI: Tüm çıktı geçerli JSON olmalı. Ek açıklama ekleme.
`;

    // ── KULLANICI PROMPT ───────────────────────────────────────────────────────
    const userPromptSuffix = `"${typeStr}" etkinliği için ${taxonomy.domain} alanında — ${taxonomy.targetSkills.slice(0, 3).join(', ')} becerilerini hedefleyen — disleksi ve DEHB dostu, A4 baskı uyumlu ultra-premium çalışma kağıdı üret. Pedagojik not dahil et.`;

    // ── EXTRA SCHEMA FIELDS ─────────────────────────────────────────────────────
    const extraSchemaFields: Record<string, unknown> = buildExtraSchema(taxonomy);

    const synthesizedTemplate: PromptTemplate = {
        systemPromptSuffix,
        userPromptSuffix,
        extraSchemaFields,
        drillCount: taxonomy.drillCount,
        layoutHint: taxonomy.layoutHint as PromptTemplate['layoutHint'],
    };

    DYNAMIC_PROMPT_CACHE.set(typeStr, {
        template: synthesizedTemplate,
        taxonomy,
        createdAt: Date.now(),
    });

    return synthesizedTemplate;
}

// ─────────────────────────────────────────────────────────────────────────────
// § 6. ŞEMA OLUŞTURUCU (Domain'e Göre)
// ─────────────────────────────────────────────────────────────────────────────

function buildExtraSchema(taxonomy: ActivityTaxonomy): Record<string, unknown> {
    const baseItemSchema = {
        type: 'OBJECT',
        properties: {
            id: { type: 'STRING', description: 'Benzersiz öğe kimliği' },
            content: { type: 'STRING', description: 'Öğe içeriği / soru metni' },
            answer: { type: 'STRING', description: 'Doğru cevap veya çözüm' },
            hint: { type: 'STRING', description: 'Scaffolding ipucu', nullable: true },
            difficulty: { type: 'STRING', description: 'Kolay | Orta | Zor' }
        },
        required: ['id', 'content', 'answer']
    };

    if (taxonomy.domain === 'Math') {
        return {
            type: 'OBJECT',
            properties: {
                items: {
                    type: 'ARRAY',
                    description: 'Matematik soruları veya bulmacaları',
                    items: {
                        ...baseItemSchema,
                        properties: {
                            ...baseItemSchema.properties,
                            visualRepresentation: { type: 'STRING', description: 'Ten-frame veya sayı doğrusu SVG açıklaması', nullable: true },
                            steps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Çözüm adımları' },
                        }
                    }
                },
                pedagogicalNote: { type: 'STRING', description: 'Öğretmene yönelik pedagojik not' }
            },
            required: ['items', 'pedagogicalNote']
        };
    }

    if (taxonomy.domain === 'Verbal') {
        return {
            type: 'OBJECT',
            properties: {
                items: {
                    type: 'ARRAY',
                    description: 'Sözel etkinlik öğeleri',
                    items: {
                        ...baseItemSchema,
                        properties: {
                            ...baseItemSchema.properties,
                            syllables: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Hece ayrımı (varsa)', nullable: true },
                            contextClue: { type: 'STRING', description: 'Bağlam ipucu', nullable: true },
                        }
                    }
                },
                pedagogicalNote: { type: 'STRING', description: 'Öğretmene yönelik pedagojik not' }
            },
            required: ['items', 'pedagogicalNote']
        };
    }

    if (taxonomy.domain === 'Visual') {
        return {
            type: 'OBJECT',
            properties: {
                grid: {
                    type: 'ARRAY',
                    description: '2D ızgara verisi',
                    items: { type: 'ARRAY', items: { type: 'STRING' } }
                },
                items: { type: 'ARRAY', items: baseItemSchema },
                pedagogicalNote: { type: 'STRING', description: 'Öğretmene yönelik pedagojik not' }
            },
            required: ['items', 'pedagogicalNote']
        };
    }

    if (taxonomy.domain === 'Logic' || taxonomy.domain === 'MultiDomain') {
        return {
            type: 'OBJECT',
            properties: {
                scenario: { type: 'STRING', description: 'Problem senaryosu (Logic aktiviteleri için)', nullable: true },
                items: { type: 'ARRAY', items: baseItemSchema },
                solutionMatrix: {
                    type: 'ARRAY',
                    items: { type: 'ARRAY', items: { type: 'STRING' } },
                    description: 'Çözüm matrisi (logic grid için)',
                    nullable: true,
                },
                pedagogicalNote: { type: 'STRING', description: 'Öğretmene yönelik pedagojik not' }
            },
            required: ['items', 'pedagogicalNote']
        };
    }

    // Generic (Memory, Creativity, SocialEmotional, General)
    return {
        type: 'OBJECT',
        properties: {
            items: { type: 'ARRAY', items: baseItemSchema },
            pedagogicalNote: { type: 'STRING', description: 'Öğretmene yönelik pedagojik not' }
        },
        required: ['items', 'pedagogicalNote']
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// § 7. PUBLIC UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Önbellek içeriğini döndür (Admin / Debug amaçlı) */
export function getDynamicCacheStats(): {
    size: number;
    entries: Array<{ type: string; domain: CognitiveDomain; confidence: number; ageMs: number }>;
} {
    const now = Date.now();
    const entries = Array.from(DYNAMIC_PROMPT_CACHE.entries()).map(([key, val]) => ({
        type: key,
        domain: val.taxonomy.domain,
        confidence: val.taxonomy.confidenceScore,
        ageMs: now - val.createdAt,
    }));
    return { size: entries.length, entries };
}

/** Belirli bir tip için önbelleği temizle */
export function invalidateDynamicCache(type?: string): void {
    if (type) {
        DYNAMIC_PROMPT_CACHE.delete(type);
        logInfo(`[DynamicActivityTaxonomy] Cache invalidated for: '${type}'`);
    } else {
        DYNAMIC_PROMPT_CACHE.clear();
        logInfo('[DynamicActivityTaxonomy] Full cache cleared.');
    }
}

/** analyzeActivityTaxonomy'i doğrudan dışa aktar (Admin / Test amaçlı) */
export { analyzeActivityTaxonomy as analyzeTaxonomy };
