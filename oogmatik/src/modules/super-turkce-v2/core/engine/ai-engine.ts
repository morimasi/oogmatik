import { GradeLevel, TargetAudience, EngineMode } from '../types';
import { generateCreativeMultimodal } from '../../../../services/geminiClient';

// V2 Yeni Standart: Sadece 2.0 Flash kullanıyoruz
const MASTER_MODEL = 'gemini-2.0-flash';

export interface AIEngineRequest {
    grade: GradeLevel;
    topic: string; // Öğrenme Kazanımı (Objective)
    audience: TargetAudience;
    promptText: string;
    schema: any;
}

export interface AIEngineResponse {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Super Türkçe V2: Premium Merkezi Yapay Zeka Motoru
 */
export class SuperTurkceAIEngine {

    /**
     * Stüdyolardan gelen isteği işler ve modele gönderir.
     */
    static async generateWorksheetData(req: AIEngineRequest): Promise<AIEngineResponse> {

        try {
            console.log(`[SuperTürkçe V2] AI Engine tetiklendi: ${req.topic} (${req.grade}.Sınıf)`);

            // 1. Pedagojik Sistem Çerçevesi (System Instruction)
            const systemInstruction = this.buildMasterPersona(req.audience);

            // 2. Özel Prompt İçine Detay Ekleme
            const finalPrompt = `
Sınıf Seviyesi: ${req.grade}. Sınıf
Konu/Kazanım: ${req.topic}
Kitle Hassasiyeti: ${this.getAudienceProfile(req.audience)}

[GÖREV KAPSAMI]
${req.promptText}

[ZORUNLU FORMAT]
Döndüreceğin yanıt KESİNLİKLE VE SADECE tanımlanan JSON şemasına uymak zorundadır. JSON dışında tek bir kelime, markdown ( \`\`\`json vb.) karakter kullanma.
`;

            // 3. Multimodal Çalıştırma
            const rawResponse = await generateCreativeMultimodal({
                prompt: finalPrompt,
                systemInstruction: systemInstruction,
                schema: req.schema,
                temperature: 0.2, // Yaratıcılık ama yapı dengesi
                model: MASTER_MODEL
            });

            // 4. Sonuç Analizi
            if (!rawResponse) throw new Error("Yapay zeka boş yanıt döndürdü.");

            // Eğer string döndüyse (bazı proxy durumlarında), JSON olarak parçala
            let parsedData = rawResponse;
            if (typeof rawResponse === 'string') {
                const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(cleaned);
            }

            return {
                success: true,
                data: parsedData
            };

        } catch (error: any) {
            console.error('[SuperTürkçe V2] AI Engine Hatası:', error);
            return {
                success: false,
                error: error.message || 'Bilinmeyen bir üretim hatası oluştu.'
            };
        }
    }

    /**
     * Motorun Çekirdek Personası (Disleksi Uzmanı Eğitimci)
     */
    private static buildMasterPersona(audience: TargetAudience): string {
        const basePersona = `
Sen, Türkiye Cumhuriyeti MEB müfredatına (2025) tam hakim, "Özel Öğrenme Güçlüğü (Disleksi/Disgrafi)" 
alanında uzmanlaşmış "Premium" bir Materyal Geliştirme Profesörüsün.
Görevin, okullarda öğrencilere dağıtılacak / PDF olarak basılacak profesyonel akademik etkinlik kağıtları üretmektir.
Çıktıların, basit, hatasız, derinlemesine analiz yeteneği kazandıran ve "matbaa kalitesinde" içerikler olmalıdır.
        `.trim();

        if (audience === 'hafif_disleksi') {
            return basePersona + `\n\nEK DİKKAT [Hafif Disleksi]: Cümleleri çok karmaşıklaştırma. Yönergelerde doğrudan eyleme odaklan. Soyut kavramları somutlaştır.`;
        } else if (audience === 'derin_disleksi') {
            return basePersona + `\n\nKRİTİK DİKKAT [Derin Disleksi]: Öğrencinin harf/mekan algısı çok zayıf. En fazla 4-5 kelimelik, tek yargı bildiren süper basit cümleler kur. Mecaz ASLA kullanma. Tamamen somut veri ile etkinlik üret.`;
        }

        return basePersona;
    }

    private static getAudienceProfile(aud: TargetAudience): string {
        if (aud === 'derin_disleksi') return "Derin Disleksi (Aşırı Kısa Yönerge, Somut Kavramlar)";
        if (aud === 'hafif_disleksi') return "Hafif Disleksi (Net, Karmaşık olmayan anlatım)";
        return "Normal Gelişim Gösteren (LGS/PISA standartlarına hazırlık)";
    }
}
