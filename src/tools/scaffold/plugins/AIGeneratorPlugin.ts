import { ActivityBlueprint } from '../types';
import { InjectionResult } from '../ActivityScaffoldEngine';
import { IScaffoldPlugin, PluginUtils } from './IScaffoldPlugin';
import { tryGenerateWithCorrection } from '../../../services/aiContentService';
import { SyntaxValidator } from '../SyntaxValidator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AIGeneratorPlugin: Phase 4 Generative Engine'in kalbi.
 * Şablon kullanmak yerine Selin Arslan (AI) ile gerçek zamanlı kod yazar.
 */
export class AIGeneratorPlugin implements IScaffoldPlugin {
    name = 'AIGeneratorPlugin';

    /**
     * Senkron metod - Implementasyon zorunluluğu için boş döner.
     */
    execute(_bp: ActivityBlueprint, _utils: PluginUtils): InjectionResult[] {
        return [];
    }

    /**
     * Asenkron metod - AI üretimini gerçekleştirir.
     */
    async executeAsync(bp: ActivityBlueprint, utils: PluginUtils): Promise<InjectionResult[]> {
        utils.log('info', `[Selin Arslan] Uygulama katmanı kodları AI ile üretiliyor: ${bp.identity.key}`);

        const prompt = this.buildPrompt(bp);
        const schema = {
            type: 'OBJECT',
            properties: {
                uiCode: { type: 'STRING', description: 'WorksheetUI.tsx içeriği' },
                generatorCode: { type: 'STRING', description: 'offlineGenerators.ts içeriği' },
                aiGeneratorCode: { type: 'STRING', description: 'generators.ts içeriği' },
                typesCode: { type: 'STRING', description: 'types.ts içeriği' }
            },
            required: ['uiCode', 'generatorCode', 'aiGeneratorCode', 'typesCode']
        };

        try {
            const result = await tryGenerateWithCorrection<any>(
                prompt,
                schema,
                (data) => SyntaxValidator.validatePayload({
                    'WorksheetUI.tsx': data.uiCode,
                    'offlineGenerators.ts': data.generatorCode,
                    'generators.ts': data.aiGeneratorCode,
                    'types.ts': data.typesCode
                })
            );

            // Üretilen kodları VFS'ye yaz
            const slug = bp.identity.key.toLowerCase().replace(/_/g, '-');
            const baseDir = path.join(utils.workspaceRoot, 'src/modules/activities', slug);

            utils.writeVFS(path.join(baseDir, 'ui/WorksheetUI.tsx'), result.uiCode);
            utils.writeVFS(path.join(baseDir, 'offlineGenerators.ts'), result.generatorCode);
            utils.writeVFS(path.join(baseDir, 'generators.ts'), result.aiGeneratorCode);
            utils.writeVFS(path.join(baseDir, 'types.ts'), result.typesCode);

            return [{
                target: 'AI-Generation',
                type: 'registry',
                key: bp.identity.key,
                success: true
            }];

        } catch (error: any) {
            utils.log('error', `AI Kod Üretim Hatası: ${error.message}. Fallback (Fail-Safe) şablona geçiliyor...`);
            
            // Fallback: Fail-Safe Şablonları yükle
            const slug = bp.identity.key.toLowerCase().replace(/_/g, '-');
            const baseDir = path.join(utils.workspaceRoot, 'src/modules/activities', slug);
            
            utils.writeVFS(path.join(baseDir, 'ui/WorksheetUI.tsx'), `
import React from 'react';
// FALLBACK TEMPLATE: AI Generation Failed
export const WorksheetUI: React.FC<any> = (props) => (
  <div className="font-lexend p-8 bg-zinc-900 text-white rounded-3xl">
    <h1 className="text-2xl font-bold text-red-400">Üretim Hatası: ${bp.identity.title}</h1>
    <p className="mt-2 text-zinc-300">Bu aktivitenin otonom inşası tamamlanamadı. Standart şablon görüntüleniyor.</p>
  </div>
);`);
            utils.writeVFS(path.join(baseDir, 'offlineGenerators.ts'), `
// FALLBACK GENERATOR
export const generateOffline = () => ({ items: [] });
            `);
            utils.writeVFS(path.join(baseDir, 'generators.ts'), `
// FALLBACK AI GENERATOR
export const generateAI = async () => ({ items: [] });
            `);
            utils.writeVFS(path.join(baseDir, 'types.ts'), `
// FALLBACK TYPES
export interface ${bp.dataModel.interfaceName || 'ActivityData'} { items: any[] }
            `);
            
            return [{
                target: 'AI-Generation',
                type: 'registry',
                key: bp.identity.key,
                success: true, // Graceful degradation - success is true to not crash
                error: `Generated with Fallback UI: ${error.message}`
            }];
        }
    }

    private buildPrompt(bp: ActivityBlueprint): string {
        // RAG Context Injector: Projenin global core typelarını oku
        let ragContext = '';
        try {
            const typesCorePath = path.join(process.cwd(), 'src/types/core.ts');
            if (fs.existsSync(typesCorePath)) {
                const content = fs.readFileSync(typesCorePath, 'utf8');
                ragContext = `\nPROJE TİP REFERANSLARI (RAG CONTEXT):\n${content.substring(0, 500)} // ... (kısaltıldı)`;
            }
        } catch(e) {}

        return `
    [ROL: Senior AI Architect - Selin Arslan]
    GÖREV: Oogmatik platformu için yeni bir '${bp.identity.title}' etkinlik modülünün tüm kodlarını yazmak.
    
    STRATEJİ:
    1. Lexend fontu ve TailwindCSS kullanarak "Premium Dark Glassmorphism" stiline sadık kal.
    2. Disleksi dostu (ferah, yüksek kontrastlı, karmaşadan uzak) bir UI tasarla.
    
    BLUEPRINT VERİLERİ:
    - Key: ${bp.identity.key}
    - Title: ${bp.identity.title}
    - Data Structure: ${JSON.stringify(bp.dataModel)}
    ${ragContext}
    
    TEKNİK KISITLAR:
    - SADECE Tailwind sınıfları kullan. Inline style yasak.
    - Kök div'e mutlaka 'font-lexend' ekle.
    `;
    }
}
