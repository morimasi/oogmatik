/**
 * AI Generator for ÇİFT METİN (Dual Text) Module
 * Uses full SariKitapConfig for topic, difficulty, age, interleaveMode, colors, styles
 */

import { generateWithSchema } from '../../geminiClient.js';
import type { CiftMetinConfig } from '../../../types/sariKitap.js';

export const generateCiftMetinFromAI = async (config: CiftMetinConfig): Promise<any[]> => {
    const generationSeed = Date.now() + Math.random();
    
    const topic = config.topics.join(', ');
    const interleaveModeLabel = config.interleaveMode === 'kelime' ? 'kelime kelime' : config.interleaveMode === 'satir' ? 'satır satır' : 'paragraf paragraf';
    
    const prompt = `
    "${config.difficulty}" seviyesinde, '${topic}' temalı ÇİFT METİN okuma materyali üret.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - İki farklı kaynak, farklı metinler
    - Yaş grubu: ${config.ageGroup}
    - Profil: ${config.profile}
    
    ÇİFT METİN NEDİR?
    - İki farklı metin ${interleaveModeLabel} karıştırılarak gösterilir
    - Karşılaştırma ve analiz becerisini geliştirir
    - Okuduğunu anlama ve eleştirel düşünceyi artırır
    
    GÖREV:
    1. Seçilen konu '${topic}' ile ilgili iki FARKLI perspektiften metin yaz
    2. Yaş grubuna (${config.ageGroup}) ve zorluk seviyesine (${config.difficulty}) uygun kelime karmaşıklığı kullan
    3. Kaynak A ve Kaynak B olarak işaretle
    4. Karışım modu: ${interleaveModeLabel}
    5. 5N1K ENTEGRASYONU: Her bir metin (Metin A ve Metin B) için o metne özel 3 adet 5N1K (Okuduğunu Anlama) sorusu hazırla.
       - Sorular: Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin sorularından en uygun 3 tanesi olsun.
       - Cevapları da kısa ve net şekilde belirt.
    
    PEDAGOJİK NOT: Bu etkinliğin pedagojik amacını kısaca açıkla (neden bu format, hangi beceriyi geliştirir).
    `;
    
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye verilen yönerge' },
            sourceA: {
                type: 'OBJECT',
                description: 'Birinci kaynak metin',
                properties: {
                    title: { type: 'STRING', description: 'Kaynak A başlığı' },
                    text: { type: 'STRING', description: 'Kaynak A metni' },
                    questions: {
                        type: 'ARRAY',
                        description: '5N1K anlama soruları',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                q: { type: 'STRING', description: 'Soru metni' },
                                a: { type: 'STRING', description: 'Cevap metni' }
                            },
                            required: ['q', 'a']
                        }
                    }
                },
                required: ['title', 'text', 'questions']
            },
            sourceB: {
                type: 'OBJECT',
                description: 'İkinci kaynak metin',
                properties: {
                    title: { type: 'STRING', description: 'Kaynak B başlığı' },
                    text: { type: 'STRING', description: 'Kaynak B metni' },
                    questions: {
                        type: 'ARRAY',
                        description: '5N1K anlama soruları',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                q: { type: 'STRING', description: 'Soru metni' },
                                a: { type: 'STRING', description: 'Cevap metni' }
                            },
                            required: ['q', 'a']
                        }
                    }
                },
                required: ['title', 'text', 'questions']
            },
            interleaveMode: { type: 'STRING', description: 'Metin karıştırma modu', enum: ['kelime', 'satir', 'paragraf'] },
            interleaveRatio: { type: 'INTEGER', description: 'Karışım oranı (yüzde)' },
        },
        required: ['title', 'instruction', 'sourceA', 'sourceB', 'interleaveMode']
    };
    
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<any[]>;
};
