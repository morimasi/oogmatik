import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from './AgentOrchestrator';
import { ActivityScaffoldEngine } from './ActivityScaffoldEngine';
import { ActivityBlueprint } from './types';
import * as fs from 'fs';
import * as path from 'path';

describe('Activity Scaffold E2E', () => {
    it('E2E: Should evaluate, approve, and generate a new activity module', async () => {
        // 1. Blueprint oluştur
        const blueprint: ActivityBlueprint = {
            identity: {
                key: 'E2E_TEST_ACTIVITY',
                enumValue: 'e2e-test',
                title: 'E2E Test Etkinliği',
                description: 'End to end validation process test.',
                icon: 'fa-solid fa-flask',
                categoryId: 'reading-verbal',
            },
            dataModel: {
                interfaceName: 'E2ETestData',
                fields: [{ name: 'instruction', type: 'string', required: true }],
                itemFields: [{ name: 'content', type: 'string', required: true }],
            },
            logic: {
                offlineAlgorithm: 'simple-generation',
                aiPrompt: {
                    role: 'Uzman Eğitimci',
                    task: 'Çocuklara göre doğru kelimeleri bulan 20 kelimelik test hazırla. Kesin gerçek verilere dayan.',
                    rules: ['Açık anlaşılır olsun.', 'Motivasyon ve başarı sağla.', 'Zorlukları kademeli artır.'],
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
                ageGroups: ['7-9', '10-12'],
            },
        };

        // 2. Ajan Denetimi (AgentOrchestrator)
        const orchestrator = new AgentOrchestrator();
        const agentResult = await orchestrator.evaluate(blueprint);

        // E2E blueprint'imiz tüm ajan testlerinden sorunsuz geçmeli
        expect(agentResult.allApproved).toBe(true);
        expect(agentResult.structuralValidation.valid).toBe(true);

        // 3. Dosyaları Üretme (ActivityScaffoldEngine) - Dry Run Mode
        const workspaceRoot = process.cwd();
        const engine = new ActivityScaffoldEngine(workspaceRoot);
        const engineResult = await engine.process(blueprint, { dryRun: true });

        // 4. Sonuçları doğrula
        expect(engineResult.success).toBe(true);
        expect(engineResult.moduleDir).toBeDefined();
        expect(engineResult.generatedFiles.length).toBeGreaterThan(0);
        expect(engineResult.injections.length).toBeGreaterThan(0);

        // Pipeline tamamlanmıştır
    });
});
