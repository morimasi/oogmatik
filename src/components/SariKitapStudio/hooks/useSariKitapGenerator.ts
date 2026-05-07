import { useCallback } from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { generatePencereFromAI } from '../../../services/generators/sariKitap/pencere.js';
import { generateNoktaFromAI } from '../../../services/generators/sariKitap/nokta.js';
import { generateKopruFromAI } from '../../../services/generators/sariKitap/kopru.js';
import { generateCiftMetinFromAI } from '../../../services/generators/sariKitap/ciftMetin.js';
import { generateBellekFromAI } from '../../../services/generators/sariKitap/bellek.js';
import { generateHizliOkumaFromAI } from '../../../services/generators/sariKitap/hizliOkuma.js';
import { generateOffline } from '../../../services/offlineGenerators/sariKitap';
import { 
    processPencereContent, 
    processNoktaContent, 
    processKopruContent, 
    interleaveTexts 
} from '../../../services/offlineGenerators/sariKitap/heceMotoru';

const AI_GENERATORS: Record<string, Function> = {
    'pencere': generatePencereFromAI,
    'nokta': generateNoktaFromAI,
    'kopru': generateKopruFromAI,
    'cift_metin': generateCiftMetinFromAI,
    'bellek': generateBellekFromAI,
    'hizli_okuma': generateHizliOkumaFromAI,
};

export function useSariKitapGenerator() {
    const {
        config,
        generationMode,
        isGenerating,
        setGenerating,
        setContent,
        setError,
    } = useSariKitapStore();

    const generate = useCallback(async () => {
        if (isGenerating) return;

        setGenerating(true);
        setError(null);

        try {
            if (generationMode === 'offline') {
                const content = generateOffline(config);
                setContent(content);
            } else {
                // Direct AI generation for sari kitap modules
                const generator = AI_GENERATORS[config.type] || generatePencereFromAI;
                const result = await generator(config);
                
                // AI generators return array, take first item
                const content = Array.isArray(result) ? result[0] : result;
                
                // --- AI Adapter: Convert AI output to match heceMotoru structure ---
                let rawText = content.text || '';
                
                if (config.type === 'pencere' && content.paragraphs) {
                    rawText = content.paragraphs.map((p: any) => p.text).join('\n\n');
                    content.heceRows = processPencereContent(config, rawText);
                } else if (config.type === 'nokta') {
                    content.heceRows = processNoktaContent(config, rawText);
                } else if (config.type === 'kopru') {
                    content.heceRows = processKopruContent(config, rawText);
                } else if (config.type === 'cift_metin' && content.sourceA && content.sourceB) {
                    content.sourceTexts = {
                        a: { title: content.sourceA.title, text: content.sourceA.text },
                        b: { title: content.sourceB.title, text: content.sourceB.text }
                    };
                    rawText = interleaveTexts(content.sourceA.text, content.sourceB.text, (config as any).interleaveMode || 'satir', (config as any).interleaveRatio || 1);
                } else if (config.type === 'bellek' && content.phases) {
                    const phaseA = content.phases.find((p: any) => p.phase === 'A') || content.phases[0] || {};
                    const phaseB = content.phases.find((p: any) => p.phase === 'B') || {};
                    const phaseC = content.phases.find((p: any) => p.phase === 'C') || {};
                    
                    content.memoryData = {
                        studyWords: phaseA.studyWords || [],
                        blankIndices: phaseB.blankIndices || [],
                        distractors: phaseC.distractors || [],
                        sentencePrompts: [] // AI prompt doesn't currently generate this
                    };
                }

                content.rawText = rawText;
                // ------------------------------------------------------------------

                // Ensure required fields exist
                if (!content.title) {
                    content.title = `${config.type} Etkinliği`;
                }
                if (!content.instructions) {
                    content.instructions = 'Yönergeler yakında eklenecek.';
                }
                if (!content.generatedAt) {
                    content.generatedAt = new Date().toISOString();
                }
                if (!content.targetSkills) {
                    content.targetSkills = config.targetSkills || [];
                }
                
                setContent(content);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Üretim sırasında hata oluştu';
            setError(message);

            // AI fail → offline fallback otomatik
            if (generationMode === 'ai') {
                try {
                    const fallback = generateOffline(config);
                    setContent(fallback);
                    setError(null);
                } catch {
                    setError('Çevrimdışı üretim de başarısız oldu.');
                }
            }
        } finally {
            setGenerating(false);
        }
    }, [config, generationMode, isGenerating, setGenerating, setContent, setError]);

    return { generate, isGenerating };
}
