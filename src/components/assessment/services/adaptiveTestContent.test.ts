import { describe, it, expect } from 'vitest';
import {
    createRng,
    calculateAdaptiveScaling,
    generateLogicItems,
    generatePhonologicalSequences,
    generateAuditoryItems,
    generateVerbalItems,
    difficultyBand,
    sampleUnique,
} from './adaptiveTestContent';
import type { DomainAdaptiveParameters } from './cognitiveAdaptiveService';

const makeParams = (complexityScore: number, timeLimitMultiplier = 1): DomainAdaptiveParameters => ({
    difficultyLevel: 'medium',
    complexityScore,
    targetItemsCount: complexityScore <= 2 ? 5 : complexityScore === 3 ? 6 : 8,
    timeLimitMultiplier,
    distractorComplexity: 'moderate',
    guidanceText: 'test',
    supportNote: 'test',
    seedSalt: 'seed',
});

describe('createRng / seed helpers', () => {
    it('aynı seed deterministik, farklı seed farklı çıktı üretir', () => {
        const a1 = Array.from({ length: 5 }, () => createRng('seed-a')());
        const a2 = Array.from({ length: 5 }, () => createRng('seed-a')());
        const b = Array.from({ length: 5 }, () => createRng('seed-b')());
        expect(a1).toEqual(a2);
        expect(a1).not.toEqual(b);
    });

    it('sampleUnique istenen sayıda benzersiz öğe döner', () => {
        const rng = createRng('x');
        const out = sampleUnique(rng, [1, 2, 3, 4, 5], 3);
        expect(out).toHaveLength(3);
        expect(new Set(out).size).toBe(3);
    });
});

describe('calculateAdaptiveScaling', () => {
    it('profil karmaşıklığıyla zorluk ölçeklerini yükseltir', () => {
        const easy = calculateAdaptiveScaling(makeParams(1));
        const hard = calculateAdaptiveScaling(makeParams(5));
        expect(easy.complexityScore).toBeLessThan(hard.complexityScore);
        expect(hard.stroopTrials).toBeGreaterThan(easy.stroopTrials);
        expect(hard.workingMemoryStart).toBeGreaterThanOrEqual(easy.workingMemoryStart);
        expect(hard.visualSearchTargets).toBeGreaterThan(easy.visualSearchTargets);
    });

    it('params verilmediğinde güvenli varsayılanlara döner', () => {
        const scaling = calculateAdaptiveScaling(undefined);
        expect(scaling.complexityScore).toBe(3);
        expect(scaling.stroopTrials).toBeGreaterThan(0);
    });

    it('destek gerektiren profillerde zamanlama çarpanı yansıtılır', () => {
        const scaling = calculateAdaptiveScaling(makeParams(2, 1.4));
        expect(scaling.timeMultiplier).toBeCloseTo(1.4);
    });

    it('difficultyBand aralıkları doğru', () => {
        expect(difficultyBand(1)).toBe('kolay');
        expect(difficultyBand(3)).toBe('orta');
        expect(difficultyBand(5)).toBe('uzman');
    });
});

describe('generateLogicItems', () => {
    it('her madde tutarlı grid/options/answer üretir', () => {
        const items = generateLogicItems(makeParams(3), createRng('logic-1'));
        expect(items.length).toBeGreaterThanOrEqual(8);
        for (const item of items) {
            expect(item.grid.flat()).toContain('?');
            expect(item.options).toContain(item.answer);
            expect(new Set(item.options).size).toBe(item.options.length);
            expect(['easy', 'medium', 'hard']).toContain(item.difficulty);
        }
    });

    it('iki ayrı seed iki farklı soru seti üretir (benzersizlik)', () => {
        const a = generateLogicItems(makeParams(4), createRng('logic-a'));
        const b = generateLogicItems(makeParams(4), createRng('logic-b'));
        expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    });

    it('ileri profilde zor soru oranı artar', () => {
        const easyItems = generateLogicItems(makeParams(1), createRng('logic-easy'));
        const hardItems = generateLogicItems(makeParams(5), createRng('logic-hard'));
        const easyHard = easyItems.filter((i) => i.difficulty === 'hard').length;
        const hardHard = hardItems.filter((i) => i.difficulty === 'hard').length;
        expect(hardHard).toBeGreaterThan(easyHard);
    });
});

describe('generatePhonologicalSequences', () => {
    it('geçerli tip ve öğelerden diziler üretir', () => {
        const seqs = generatePhonologicalSequences(makeParams(3), createRng('phono-1'));
        const validTypes = ['syllable', 'word', 'digit', 'reverse', 'letter', 'mixed'];
        expect(seqs.length).toBeGreaterThanOrEqual(8);
        for (const seq of seqs) {
            expect(seq.items.length).toBeGreaterThanOrEqual(2);
            expect(validTypes).toContain(seq.type);
        }
    });

    it('farklı seed farklı diziler üretir', () => {
        const a = generatePhonologicalSequences(makeParams(3), createRng('phono-a'));
        const b = generatePhonologicalSequences(makeParams(3), createRng('phono-b'));
        expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    });
});

describe('generateAuditoryItems / generateVerbalItems', () => {
    it('işitsel maddelerde hedef mutlaka seçeneklerdedir', () => {
        const items = generateAuditoryItems(makeParams(3), createRng('aud-1'), 8);
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(item.options).toContain(item.targetWord);
            expect(new Set(item.options).size).toBe(item.options.length);
        }
    });

    it('sözel maddelerde doğru cevap seçeneklerdedir ve zorlukla birlikte havuz değişir', () => {
        const easy = generateVerbalItems(makeParams(1), createRng('verb-easy'));
        const hard = generateVerbalItems(makeParams(5), createRng('verb-hard'));
        for (const item of [...easy, ...hard]) {
            expect(item.options).toContain(item.correct);
        }
        expect(JSON.stringify(easy)).not.toBe(JSON.stringify(hard));
    });
});
