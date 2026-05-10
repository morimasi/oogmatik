import { describe, it, expect } from 'vitest';
import { ActivityValidator } from './ActivityValidator';
import { ActivityBlueprint } from './types';

describe('ActivityValidator', () => {
    const validator = new ActivityValidator();

    const validBlueprint: ActivityBlueprint = {
        identity: {
            key: 'TEST_ACTIVITY',
            enumValue: 'test-activity',
            title: 'Test Aktivitesi',
            description: 'ZPD uyumlu harika bir test aktivitesi.',
            icon: 'fa-solid fa-star',
            categoryId: 'reading-verbal',
        },
        dataModel: {
            interfaceName: 'TestActivityData',
            fields: [{ name: 'instruction', type: 'string', required: true }],
        },
        logic: {
            offlineAlgorithm: '',
            aiPrompt: {
                role: 'Uzman Öğretmen',
                task: 'Çocuklara göre doğru kelimeleri bulan 20 kelimelik test hazırla.',
                rules: ['Açık anlaşılır olsun.', 'Başarı duygusu yaşat.', 'Zorlukları kademeli artır.'],
                schema: { type: 'object' },
            },
        },
        ui: {
            columnsPerDifficulty: { Kolay: 1, Orta: 2, Zor: 3 },
            configFields: [{ id: 'count', label: 'Sayı', type: 'number', defaultValue: 10 }],
            renderType: 'list',
        },
        pedagogical: {
            targetSkills: ['Okuma', 'Dikkat'],
            errorTags: [],
            ageGroups: ['7-9'],
        },
    };

    it('geçerli blueprint için valid true dönmeli', () => {
        const result = validator.validateBlueprint(validBlueprint);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('boş key veya hatalı formatta hata vermeli', () => {
        const invalidBp = { ...validBlueprint, identity: { ...validBlueprint.identity, key: 'kucuk_harf_key' } };
        const result = validator.validateBlueprint(invalidBp as unknown as ActivityBlueprint);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'identity.key')).toBe(true);
    });

    it('Dr. Ahmet klinik dil kontrolünü yakalamalı', () => {
        const diagnosisBp = { ...validBlueprint, identity: { ...validBlueprint.identity, description: 'Öğrencinin disleksisi var, bu yüzden yapıyoruz.' } };
        const result = validator.validateBlueprint(diagnosisBp);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'CLINICAL_LANGUAGE')).toBe(true);
    });

    it('Elif pedagogicalNote denetimini yapmalı', () => {
        const result = validator.checkPedagogicalRequirements('export const foo = "bar";');
        expect(result.valid).toBe(false);
        expect(result.issues).toContain('pedagogicalNote alanı eksik');
    });
});
