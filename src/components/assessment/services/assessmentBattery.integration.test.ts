import { describe, it, expect } from 'vitest';
import {
    calculateDomainAdaptiveParameters,
    type CognitiveProfileMetrics,
} from './cognitiveAdaptiveService';
import {
    createRng,
    calculateAdaptiveScaling,
    generateLogicItems,
    generatePhonologicalSequences,
    generateAuditoryItems,
    generateVerbalItems,
    generateVisualSearchLevels,
} from './adaptiveTestContent';

/** Değerlendirme motorundaki 11 bilişsel alan. */
const DOMAINS = [
    'visual_spatial_memory',
    'processing_speed',
    'selective_attention',
    'phonological_loop',
    'logical_reasoning',
    'visual_search',
    'working_memory',
    'planning',
    'auditory_processing',
    'visual_motor_integration',
    'verbal_comprehension',
] as const;

const YOUNG_ADHD: CognitiveProfileMetrics = {
    studentName: 'Deniz',
    age: 7,
    grade: '1. Sınıf',
    diagnosis: ['DEHB', 'Dikkat eksikliği'],
    strengths: [],
    weaknesses: ['dikkat', 'odak'],
};

const STANDARD: CognitiveProfileMetrics = {
    studentName: 'Ece',
    age: 9,
    grade: '3. Sınıf',
    diagnosis: [],
    strengths: [],
    weaknesses: [],
};

const GIFTED: CognitiveProfileMetrics = {
    studentName: 'Kaan',
    age: 12,
    grade: '6. Sınıf',
    diagnosis: ['Üstün yetenek'],
    strengths: ['matematik', 'mantık', 'görsel', 'dil'],
    weaknesses: [],
};

const profiles = [YOUNG_ADHD, STANDARD, GIFTED];

describe('Değerlendirme bataryası — profil ölçekleme', () => {
    it('her alan için profil seviyeleri tutarlı sıralanır', () => {
        for (const domain of DOMAINS) {
            const young = calculateDomainAdaptiveParameters(domain, YOUNG_ADHD);
            const std = calculateDomainAdaptiveParameters(domain, STANDARD);
            const gifted = calculateDomainAdaptiveParameters(domain, GIFTED);

            expect(young.complexityScore).toBeGreaterThanOrEqual(1);
            expect(gifted.complexityScore).toBeLessThanOrEqual(5);
            // Destek profili asla üstün yetenek profilinden zor olmamalı
            expect(young.complexityScore).toBeLessThanOrEqual(gifted.complexityScore);
            expect(std.complexityScore).toBeLessThanOrEqual(gifted.complexityScore);
        }
    });

    it('DEHB profilinde dikkat alanları sadeleşir ve tempo uzar', () => {
        const params = calculateDomainAdaptiveParameters('selective_attention', YOUNG_ADHD);
        expect(params.timeLimitMultiplier).toBeGreaterThan(1);
        expect(params.distractorComplexity).toBe('low');
    });

    it('DEHB profilinde planlama için zaman çarpanı artar', () => {
        const params = calculateDomainAdaptiveParameters('planning', YOUNG_ADHD);
        expect(params.timeLimitMultiplier).toBeGreaterThan(1);
    });

    it('her profil için skalalar profil karmaşıklığıyla monoton artar', () => {
        for (const domain of DOMAINS) {
            const s = profiles.map((p) => calculateAdaptiveScaling(calculateDomainAdaptiveParameters(domain, p)));
            expect(s[0].complexityScore).toBeLessThanOrEqual(s[1].complexityScore);
            expect(s[1].complexityScore).toBeLessThanOrEqual(s[2].complexityScore);
        }
    });
});

describe('Değerlendirme bataryası — benzersizlik', () => {
    it('aynı profil, aynı alan: iki farklı oturum farklı içerik üretir', () => {
        const params = calculateDomainAdaptiveParameters('logical_reasoning', STANDARD);

        const attemptA = generateLogicItems(params, createRng('attempt-A'));
        const attemptB = generateLogicItems(params, createRng('attempt-B'));
        expect(JSON.stringify(attemptA)).not.toBe(JSON.stringify(attemptB));

        const phonoA = generatePhonologicalSequences(calculateDomainAdaptiveParameters('phonological_loop', STANDARD), createRng('attempt-A'));
        const phonoB = generatePhonologicalSequences(calculateDomainAdaptiveParameters('phonological_loop', STANDARD), createRng('attempt-B'));
        expect(JSON.stringify(phonoA)).not.toBe(JSON.stringify(phonoB));

        const verbalA = generateVerbalItems(calculateDomainAdaptiveParameters('verbal_comprehension', STANDARD), createRng('attempt-A'));
        const verbalB = generateVerbalItems(calculateDomainAdaptiveParameters('verbal_comprehension', STANDARD), createRng('attempt-B'));
        expect(JSON.stringify(verbalA)).not.toBe(JSON.stringify(verbalB));

        const auditoryA = generateAuditoryItems(calculateDomainAdaptiveParameters('auditory_processing', STANDARD), createRng('attempt-A'), STANDARD.age);
        const auditoryB = generateAuditoryItems(calculateDomainAdaptiveParameters('auditory_processing', STANDARD), createRng('attempt-B'), STANDARD.age);
        expect(JSON.stringify(auditoryA)).not.toBe(JSON.stringify(auditoryB));
    });

    it('aynı seed ile aynı içerik (deterministik) üretilir', () => {
        const params = calculateDomainAdaptiveParameters('logical_reasoning', STANDARD);
        const a = generateLogicItems(params, createRng('fixed-seed'));
        const b = generateLogicItems(params, createRng('fixed-seed'));
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });

    it('farklı profiller aynı alanda farklı zorlukta içerik alır', () => {
        const youngItems = generateLogicItems(calculateDomainAdaptiveParameters('logical_reasoning', YOUNG_ADHD), createRng('p1'));
        const giftedItems = generateLogicItems(calculateDomainAdaptiveParameters('logical_reasoning', GIFTED), createRng('p1'));
        const youngHard = youngItems.filter((i) => i.difficulty === 'hard').length;
        const giftedHard = giftedItems.filter((i) => i.difficulty === 'hard').length;
        expect(giftedHard).toBeGreaterThan(youngHard);
        expect(giftedItems.length).toBeGreaterThan(youngItems.length);
    });
});

describe('Görsel arama seviyeleri', () => {
    it('geçerli seviyeler üretir ve hedef çeldiriciler arasında tekrarlanmaz', () => {
        const levels = generateVisualSearchLevels(calculateDomainAdaptiveParameters('visual_search', STANDARD), createRng('vs-1'));
        expect(levels.length).toBeGreaterThan(0);
        for (const level of levels) {
            expect(level.gridSize).toBeGreaterThanOrEqual(3);
            expect(level.targetCount).toBeLessThanOrEqual(level.gridSize * level.gridSize - 2);
            expect(level.distractorChars).not.toContain(level.targetChar);
            expect(new Set(level.distractorChars).size).toBe(level.distractorChars.length);
        }
    });

    it('farklı seed farklı hedef/çeldirici kümeleri seçer', () => {
        const params = calculateDomainAdaptiveParameters('visual_search', STANDARD);
        const a = generateVisualSearchLevels(params, createRng('vs-a'));
        const b = generateVisualSearchLevels(params, createRng('vs-b'));
        expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    });

    it('ileri profilde ızgara ve hedef sayısı artar', () => {
        const easy = generateVisualSearchLevels(calculateDomainAdaptiveParameters('visual_search', YOUNG_ADHD), createRng('vs-e'));
        const hard = generateVisualSearchLevels(calculateDomainAdaptiveParameters('visual_search', GIFTED), createRng('vs-h'));
        expect(hard[0].gridSize).toBeGreaterThanOrEqual(easy[0].gridSize);
        expect(hard[hard.length - 1].targetCount).toBeGreaterThan(easy[easy.length - 1].targetCount);
    });
});
