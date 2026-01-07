
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ClockReadingData } from '../../types';
import { getMathPrompt } from './prompts';

export const generateClockReadingFromAI = async (options: GeneratorOptions): Promise<ClockReadingData[]> => {
    const { difficulty, worksheetCount, itemCount = 4, variant = 'analog-to-digital', studentContext, is24Hour, showNumbers, showTicks, showOptions, showHands } = options;
    
    const variantDesc = {
        'analog-to-digital': 'Analog saatten dijital saate dönüşüm.',
        'digital-to-analog': 'Dijital saati analog kadran üzerinde çizme.',
        'verbal-match': 'Sözel ifadeleri (çeyrek var, buçuk gibi) saatle eşleştirme.',
        'elapsed-time': 'Zaman aritmetiği ve geçen süre problemleri.'
    }[variant] || 'Zaman okuma';

    const rule = `
    [GÖREV]: Profesyonel Seviye Saat Okuma ve Zaman Algısı Etkinliği Üret.
    ZORLUK SEVİYESİ: ${difficulty}
    VARYANT: ${variantDesc}
    ADET: Sayfa başına ${itemCount} görev.
    
    GÖRSEL AYARLAR:
    - Format: ${is24Hour ? '24 Saat' : '12 Saat'}
    - Saat Rakamları: ${showNumbers ? 'GÖRÜNÜR' : 'GİZLİ'}
    - Dakika Çizgileri: ${showTicks ? 'GÖRÜNÜR' : 'GİZLİ'}
    - Seçenekler (Dijital): ${showOptions ? 'GÖSTER' : 'GİZLE (Öğrenci Yazacak)'}
    - Akrep/Yelkovan: ${showHands ? 'GÖSTER' : 'GİZLE (Öğrenci Çizecek)'}

    ÖZEL TALİMATLAR:
    1. Eğer varyant 'elapsed-time' ise: 'problemText' alanına günlük yaşamdan kısa bir hikaye yaz. 
    2. Eğer varyant 'verbal-match' ise: 'verbalTime' alanına Türkçedeki klasik saat söyleyişini yaz.
    `;

    const prompt = getMathPrompt("Gelişmiş Zaman Atölyesi", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                variant: { type: Type.STRING },
                clocks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            hour: { type: Type.INTEGER },
                            minute: { type: Type.INTEGER },
                            timeString: { type: Type.STRING },
                            verbalTime: { type: Type.STRING, nullable: true },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                            answer: { type: Type.STRING },
                            problemText: { type: Type.STRING, nullable: true }
                        },
                        required: ['id', 'hour', 'minute', 'timeString', 'answer']
                    }
                }
            },
            required: ['title', 'instruction', 'clocks']
        }
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.map((page: any) => ({
        ...page,
        settings: {
            showNumbers: showNumbers !== undefined ? showNumbers : true,
            is24Hour: !!is24Hour,
            showTicks: showTicks !== undefined ? showTicks : true,
            showOptions: showOptions !== undefined ? showOptions : true,
            showHands: showHands !== undefined ? showHands : true,
            difficulty
        }
    }));
};

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { 
        difficulty, 
        numberRange, 
        worksheetCount, 
        itemCount = 4, 
        studentContext,
        logicModel = 'identity',
        gridSize = 3,
        showSumTarget = true
    } = options;
    
    const modelDesc = {
        'identity': 'Sayı Kimliği: Sayının basamak değerleri, tek/çift durumu ve komşuluk ilişkilerine odaklan.',
        'exclusion': 'Eleme Mantığı: "X değildir", "Şundan küçüktür ama şu değildir" gibi dışlayıcı önermeler kullan.',
        'sequence': 'Dizi/Örüntü: Sayının bir aritmetik dizideki yerini veya katlarını ipucu olarak ver.',
        'cryptarithmetic': 'Şifreleme: Sayıyı oluşturan rakamları sembollerle veya toplamsal bulmacalarla anlat.'
    }[logicModel];

    const rule = `
    [KESİN GÖREV]: Sayısal Muhakeme ve Mantık Bilmeceleri Üret.
    [ZORLUK SEVİYESİ]: ${difficulty}
    [SAYI EVRENİ]: ${numberRange || '1-50'}
    [MANTIK MODELİ]: ${modelDesc}
    [İPUCU SAYISI]: Her bir bilmece için TAM OLARAK ${gridSize} ADET bağımsız ipucu/önerme yaz. Ne eksik ne fazla!
    [SAYFA YAPISI]: Bir sayfada ${itemCount} adet bağımsız bilmece kutusu olsun.
    
    HESAPLAMA KURALLARI:
    1. Zorluk seviyesine göre sayıları seç: Başlangıç (1-10), Orta (1-50), Zor (1-100), Uzman (100-999).
    2. İpuçları birbirini desteklemeli ve tek bir doğru cevaba götürmeli.
    3. ${showSumTarget ? "'sumTarget' alanına, bu sayfadaki tüm doğru cevapların matematiksel toplamını yaz." : ""}
    
    JSON formatında döndür. Her bilmece için 'riddle' alanı ipuçlarının birleşimi olsun. 'options' alanında 4 seçenek ver.
    `;

    const prompt = getMathPrompt("Gelişmiş Sayısal Mantık Bilmeceleri", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sumTarget: { type: Type.INTEGER },
                sumMessage: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            visualHint: { type: Type.STRING },
                            boxes: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['riddle', 'boxes', 'options', 'answer', 'answerValue']
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};
