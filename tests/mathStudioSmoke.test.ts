import { describe, it, expect } from 'vitest';
import { generateOfflineMathStudioProblems } from '../src/services/generators/mathStudio';
import { MathProblemConfig } from '../src/types/math';

describe('MathStudio Ultra-Premium v3 Smoke Tests', () => {
    it('disleksi profili için pedagojik not ve net sözel sorular üretmeli', () => {
        const config: MathProblemConfig = {
            topic: 'Uzay Keşfi',
            count: 4,
            includeSolutionBox: false,
            studentName: 'Can',
            difficulty: 'Orta',
            selectedOperations: ['add', 'sub'],
            numberRange: '1-20',
            problemStyle: 'simple',
            complexity: '1-step',
            problemTypes: ['standard'],
            generateImages: false,
            fontWeight: 400,
            autoFillPage: true,
            learningProfile: 'dyslexia',
            ageGroup: '8-10'
        };

        const result = generateOfflineMathStudioProblems(config);
        expect(result).toBeDefined();
        expect(result.problems).toHaveLength(4);
        expect(result.pedagogicalNote).toContain('Disleksi');
        expect(result.instruction).toContain('Can');
        expect(result.instruction).toContain('Uzay Keşfi');

        // Her problem doğru şablon alanlarına sahip olmalı
        result.problems.forEach(p => {
            expect(p.text).toBeDefined();
            expect(p.answer).toBeDefined();
            expect(p.operationHint).toBeDefined();
            expect(p.steps && p.steps.length).toBeGreaterThan(0);
            expect(p.svgCode).toContain('<svg');
        });
    });

    it('diskalkuli profili için adım adım işlem ve somut görsel desteği sağlamalı', () => {
        const config: MathProblemConfig = {
            topic: 'Market Alışverişi',
            count: 3,
            includeSolutionBox: true,
            studentName: 'Elif',
            difficulty: 'Kolay',
            selectedOperations: ['mult', 'div'],
            numberRange: '1-10',
            problemStyle: 'simple',
            complexity: '1-step',
            problemTypes: ['fill-in', 'comparison'],
            generateImages: false,
            fontWeight: 400,
            autoFillPage: false,
            learningProfile: 'dyscalculia',
            ageGroup: '8-10'
        };

        const result = generateOfflineMathStudioProblems(config);
        expect(result.problems.length).toBe(3);
        expect(result.pedagogicalNote).toContain('Diskalkuli');
        
        // Boşluk doldurma ve karşılaştırma tipleri doğru set edilmiş olmalı
        expect(result.problems[0].type).toBe('fill-in');
        expect(result.problems[1].type).toBe('comparison');
    });

    it('DEHB profili için mikro-döngü ve motive edici pedagojik not sunmalı', () => {
        const config: MathProblemConfig = {
            topic: 'Doğa Gezisi',
            count: 2,
            includeSolutionBox: false,
            studentName: 'Mert',
            difficulty: 'Kolay',
            selectedOperations: ['add'],
            numberRange: '1-10',
            problemStyle: 'simple',
            complexity: '1-step',
            problemTypes: ['true-false'],
            generateImages: false,
            fontWeight: 400,
            autoFillPage: true,
            learningProfile: 'adhd',
            ageGroup: '5-7'
        };

        const result = generateOfflineMathStudioProblems(config);
        expect(result.pedagogicalNote).toContain('DEHB');
        expect(result.problems[0].type).toBe('true-false');
        expect(result.problems[0].options).toContain('Doğru');
        expect(result.problems[0].options).toContain('Yanlış');
    });

    it('asla tanı koyucu ("disleksisi var" gibi) ayrıştırıcı dil içermemeli', () => {
        const profiles = ['dyslexia', 'dyscalculia', 'adhd', 'mixed'];
        profiles.forEach(prof => {
            const result = generateOfflineMathStudioProblems({
                topic: 'Genel',
                count: 2,
                includeSolutionBox: false,
                studentName: 'Öğrenci',
                difficulty: 'Orta',
                selectedOperations: ['add'],
                numberRange: '1-20',
                problemStyle: 'simple',
                complexity: '1-step',
                problemTypes: ['standard'],
                generateImages: false,
                fontWeight: 400,
                autoFillPage: true,
                learningProfile: prof
            });

            // Kural #5: Tanı koyucu dil mutlak yasak
            expect(result.pedagogicalNote).not.toMatch(/disleksisi var|özürlü|engelli|hasta/i);
            result.problems.forEach(p => {
                expect(p.text).not.toMatch(/disleksisi var|özürlü|engelli|hasta/i);
            });
        });
    });
});
