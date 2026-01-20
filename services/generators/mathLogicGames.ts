
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, NumberLogicRiddleData } from '../../types';
import { getMathPrompt } from './prompts';

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { difficulty, itemCount = 6, gridSize = 3, studentContext } = options;
    
    const rule = `
    [KESİN TEKNİK ZORUNLULUK]: 
    1. Üretilecek Toplam Bilmece Sayısı: TAM OLARAK ${itemCount} ADET.
    2. Her Bilmece İçin İpucu Sayısı: TAM OLARAK ${gridSize} ADET. (Eksik veya fazla olamaz!)
    
    [İÇERİK STRATEJİSİ]:
    - Bilmeceler "${difficulty}" seviyesinde olmalı.
    - 'riddleParts' dizisi EKSİKSİZ ${gridSize} adet farklı ipucu içermelidir.
    - İpuçlarını şu kategorilere paylaştır: 'parity' (tek/çift), 'digits' (rakam toplamı/farkı), 'comparison' (büyüklük/küçüklük), 'arithmetic' (katlar/asal durum), 'range' (onluk/yüzlük dilimi).
    - İpucu sayısı 5'ten fazlaysa, her ipucu hedef sayıyı daraltan spesifik birer "filtre" gibi çalışmalıdır.
    
    [HATA KONTROLÜ]:
    - 'sumTarget': Tüm doğru cevapların toplamını KESİNLİKLE doğru hesapla.
    - 'visualDistraction': Sayfanın altına serpiştirilecek 5 adet "şüpheli sayı" üret.
    
    [DİKKAT]: Eğer ${gridSize} adet ipucu istenmişse, JSON 'riddleParts' dizisinde tam olarak ${gridSize} adet obje bulunmalıdır. Bu bir sistem kısıtlamasıdır.
    `;

    const prompt = getMathPrompt(`Gizemli Sayılar: Yüksek Hassasiyetli Analiz (Adet: ${itemCount}, İpucu: ${gridSize})`, difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sumTarget: { type: Type.INTEGER, description: "Tüm doğru cevap değerlerinin matematiksel toplamı" },
                sumMessage: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY,
                    description: `Tam olarak ${itemCount} adet bilmece nesnesi içermelidir.`,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            riddleParts: {
                                type: Type.ARRAY,
                                description: `BU DİZİ TAM OLARAK ${gridSize} ADET ÖĞE İÇERMELİDİR.`,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING, description: "Kısa ve net mantıksal ipucu cümlesi" },
                                        icon: { type: Type.STRING, description: "FontAwesome ikon adı (örn: fa-check)" },
                                        type: { type: Type.STRING, enum: ['parity', 'digits', 'comparison', 'arithmetic', 'range'] }
                                    },
                                    required: ['text', 'icon', 'type']
                                }
                            },
                            visualDistraction: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 adet seçenek (1 doğru, 3 çeldirici)" },
                            answer: { type: Type.STRING, description: "Doğru cevabın string hali" },
                            answerValue: { type: Type.INTEGER, description: "Doğru cevabın sayısal değeri" }
                        },
                        required: ['riddleParts', 'options', 'answer', 'answerValue']
                    }
                }
            }
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};
