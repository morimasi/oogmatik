import { ActivityBlueprint } from '../types';
import { InjectionResult } from '../ActivityScaffoldEngine';
import { IScaffoldPlugin, PluginUtils } from './IScaffoldPlugin';
import { tryGenerateWithCorrection } from '../../../services/aiContentService';
import { SyntaxValidator } from '../SyntaxValidator';
// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
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
            // @ts-ignore
            const typesCorePath = path.join(process.cwd(), 'src/types/core.ts');
            if (fs.existsSync(typesCorePath)) {
                const content = fs.readFileSync(typesCorePath, 'utf8');
                // Önemli kısımları alalım (SingleWorksheetData, WorksheetBlock vb.)
                ragContext = `\nPROJE TİP REFERANSLARI (RAG CONTEXT):\n${content.substring(0, 1500)}`;
            }
        } catch(e) {}

        const PascalCase = bp.identity.key.toLowerCase().split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('');

        // Multimodal Vision Support (Blueprint'te varsa)
        const visualReference = (bp as any).visualAnalysis 
            ? `\n[GÖRSEL REFERANS ALINDI - KLONLAMA MODU AKTİF]:\n${JSON.stringify((bp as any).visualAnalysis, null, 2)}` 
            : '';

        return `
[ROL: Senior AI Architect - Selin Arslan persona]
GÖREV: Oogmatik platformunun Otonom Üretim Hattı (Generative Engine) için '${bp.identity.title}' modülünü inşa et.

TASARIM STANDARTLARI (Kritik):
1. **A4 Yoğunluk**: Çalışma sayfası dolu görünmeli. Fazla boşluktan (whitespace) kaçın, kompak tasarla. 
2. **Nöro-Mimar**: Disleksi ve DEHB dostu hiyerarşi. Lexend fontu zorunlu. 
3. **Görsel Dil**: Çalışma sayfası için "Temiz, Yüksek Kontrastlı, Premium Print" stilini kullan.
4. **Tip Güvenliği**: TypeScript 'any' tipi kesinlikle yasak. 'unknown' + Type Guard kullan.
${visualReference ? '5. **Klonlama Protokolü**: Sağlanan görsel analize (DNA) %100 sadık kal. Layout, soru tipi ve veri yapısını görsele göre simüle et.' : ''}

BLUEPRINT:
- Key: ${bp.identity.key}
- Title: ${bp.identity.title}
- Veri Yapısı: ${JSON.stringify(bp.dataModel)}
${ragContext}
${visualReference}

DOSYA YAPILARI:
- types.ts: '${PascalCase}Data' interface'ini 'SingleWorksheetData' ile uyumlu şekilde tanımla.
- generators.ts: Gemini 1.5 Flash için sistem promptu ve 'generate${PascalCase}FromAI' fonksiyonu.
- offlineGenerators.ts: İnternet yokken çalışan 'generateOffline${PascalCase}' fonksiyonu (minimum 5 örnek içerik üretmeli).
- ui/WorksheetUI.tsx: '${PascalCase}Sheet' bileşeni. A4 sayfa içine sığacak, print-ready, modern React bileşeni.

EKİP ONAYI:
- Elif Yıldız (Pedagoji): "ZPD uyumlu, başarı anı odaklı."
- Dr. Ahmet Kaya (Klinik): "Bilişsel yükü optimize edilmiş hiyerarşi."
- Bora Demir (Mühendislik): "Strict TypeScript ve performant bileşenler."

Lütfen sadece JSON formatında yanıt ver. Content validasyonu Selin Arslan tarafından yapılmıştır.
`;
    }


}
