import { ActivityBlueprint } from '../types';
import { InjectionResult } from '../ActivityScaffoldEngine';
import { IScaffoldPlugin, PluginUtils } from './IScaffoldPlugin';
import { tryGenerateWithCorrection } from '../../../services/geminiClient';
import { SyntaxValidator } from '../SyntaxValidator';
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
            utils.log('error', `AI Kod Üretim Hatası: ${error.message}`);
            return [{
                target: 'AI-Generation',
                type: 'registry',
                key: bp.identity.key,
                success: false,
                error: error.message
            }];
        }
    }

    private buildPrompt(bp: ActivityBlueprint): string {
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
    
    TEKNİK KISITLAR:
    - SADECE Tailwind sınıfları kullan. Inline style yasak.
    - Kök div'e mutlaka 'font-lexend' ekle.
    `;
    }
}
