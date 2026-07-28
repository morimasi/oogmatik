import { ActivityType } from '../../../types/activity.js';
import { PromptTemplate } from '../prompts/index.js';
import { logInfo } from '../../../utils/logger.js';

// Global In-Memory Cache for Dynamic Activity Prompts
const DYNAMIC_PROMPT_CACHE = new Map<string, PromptTemplate>();

export interface ActivityTaxonomy {
    domain: 'Math' | 'Verbal' | 'Visual' | 'Memory' | 'Logic' | 'General';
    targetSkills: string[];
    suggestedPrimaryType: 'grid' | 'table' | 'question_list' | 'matching' | 'svg' | 'text';
    scaffoldingStrategy: string;
}

/**
 * Parses an unknown ActivityType name or ID to extract its cognitive domain and target skills.
 */
export function analyzeActivityTaxonomy(activityType: string): ActivityTaxonomy {
    const upper = activityType.toUpperCase();

    const isMath = /MATH|NUMBER|CALCUL|DIGIT|COUNT|SUM|SUBTRACT|PYRAMID|SUDOKU|EQUATION|LOGIC_RIDDLE|FRACTION/i.test(upper);
    const isVerbal = /READ|WORD|SYLLABLE|HARF|LETTER|TURKCE|GRAMMAR|TEXT|STORY|SENTENCE|SPELLING|VOCAB/i.test(upper);
    const isVisual = /VISUAL|DRAW|GRID|SHAPE|COLOR|TRACKING|MIRROR|MAZE|SPOT|DIFFERENCE|PATTERN/i.test(upper);
    const isMemory = /MEMORY|RECALL|ATTENTION|STROOP|FOCUS|QUICK|SPEED/i.test(upper);
    const isLogic = /PUZZLE|LOGIC|REASONING|FAMILY|APARTMENT|ERROR_HUNTER|CODE|ROUTE/i.test(upper);

    let domain: ActivityTaxonomy['domain'] = 'General';
    let suggestedPrimaryType: ActivityTaxonomy['suggestedPrimaryType'] = 'question_list';
    const targetSkills: string[] = [];

    if (isMath) {
        domain = 'Math';
        targetSkills.push('Sayı Algısı', 'İşlem Becerisi', 'Sayısal Mantık');
        suggestedPrimaryType = /GRID|SUDOKU|PYRAMID|MATRIX/i.test(upper) ? 'grid' : 'table';
    } else if (isVerbal) {
        domain = 'Verbal';
        targetSkills.push('Fonolojik Farkındalık', 'Okuma Akıcılığı', 'Kelime Hazinesi');
        suggestedPrimaryType = /SYLLABLE|HARF|LETTER|MATCH/i.test(upper) ? 'matching' : 'question_list';
    } else if (isVisual) {
        domain = 'Visual';
        targetSkills.push('Görsel Algı', 'Uzamsal İlişkiler', 'Görsel Dikkat');
        suggestedPrimaryType = /GRID|DRAW|MAZE/i.test(upper) ? 'grid' : 'svg';
    } else if (isMemory) {
        domain = 'Memory';
        targetSkills.push('Çalışma Belleği', 'Odaklanma Süresi', 'Bilişsel Esneklik');
        suggestedPrimaryType = 'grid';
    } else if (isLogic) {
        domain = 'Logic';
        targetSkills.push('Analiz Etme', 'Problem Çözme', 'Mantıksal Çıkarım');
        suggestedPrimaryType = 'table';
    } else {
        targetSkills.push('Genel Bilişsel Gelişim', 'Dikkat ve Odaklanma');
    }

    const scaffoldingStrategy = `Etkinlik '${activityType}' özel gereksinimlerine göre disleksi/DEHB dostu scaffolding (kademeli ipucu ve kısa yönergeler) ile desteklenmiştir.`;

    return { domain, targetSkills, suggestedPrimaryType, scaffoldingStrategy };
}

/**
 * Synthesizes a dedicated, high-precision PromptTemplate for an unregistered ActivityType.
 */
export function synthesizeDynamicPromptTemplate(type: ActivityType | string): PromptTemplate {
    const typeStr = String(type);
    if (DYNAMIC_PROMPT_CACHE.has(typeStr)) {
        return DYNAMIC_PROMPT_CACHE.get(typeStr)!;
    }

    const taxonomy = analyzeActivityTaxonomy(typeStr);
    logInfo(`[DynamicActivityTaxonomy] Auto-synthesizing AI Prompt for new ActivityType: '${typeStr}' (${taxonomy.domain} Domain)`);

    const systemPromptSuffix = `
[OTONOM ETKİNLİK ZEKASI — DİNAMİK MODÜL: ${typeStr}]
SEN KAZANIM ODAKLI BİR EĞİTİM UZMANISIN.
Bu etkinlik türü (${typeStr}) için özel pedagojik yapı hazırlanmıştır:
- Bilişsel Alan: ${taxonomy.domain}
- Hedef Beceriler: ${taxonomy.targetSkills.join(', ')}
- Tavsiye Edilen Yerleşim: ${taxonomy.suggestedPrimaryType.toUpperCase()}

TASARIM VE İÇERİK TALİMATLARI:
1. "${typeStr}" ismine ve konseptine %100 özgün, disleksi dostu içerikler ve alıştırmalar üret.
2. Ana Etkinlik (Primary Activity) yapısını '${taxonomy.suggestedPrimaryType}' formatında düzenle.
3. Öğrenci için adım adım, net, 10 kelimeyi geçmeyen yönerge ver.
4. A4 çalışma kağıdını sıfır boşluk kalacak şekilde zengin ve yoğun öğelerle doldur.
5. b-d, p-q karışıklığını önleyecek visual scaffolding ve ipuçları sağla.
`;

    const userPromptSuffix = `Lütfen "${typeStr}" konseptine tam uyumlu, ${taxonomy.domain} alanındaki becerileri destekleyen ultra-premium çalışma kağıdı verisi üret.`;

    const synthesizedTemplate: PromptTemplate = {
        systemPromptSuffix,
        userPromptSuffix,
    };

    DYNAMIC_PROMPT_CACHE.set(typeStr, synthesizedTemplate);
    return synthesizedTemplate;
}
