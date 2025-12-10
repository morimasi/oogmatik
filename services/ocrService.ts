
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, BasicOperationsData, StoryData, OCRMathItem } from '../types';

export const ocrService = {
    processImage: async (base64Image: string): Promise<any> => {
        const prompt = `
        [ROL: EĞİTİM MATERYALİ ANALİSTİ]
        
        GÖREV: Bu görseli analiz et ve içindeki eğitim içeriğini dijitalleştir.
        
        ANALİZ ADIMLARI:
        1. Görseldeki metinleri, soruları ve matematiksel işlemleri tanı.
        2. İçerik türünü belirle (Matematik İşlemleri, Okuma Parçası, Soru Listesi).
        3. İçeriği temizle (OCR hatalarını düzelt, eksik kısımları mantıken tamamla).
        4. Aşağıdaki JSON şemasına uygun yapılandırılmış veri döndür.
        
        EĞER MATEMATİK İSE:
        - İşlemleri 'mathItems' dizisine ekle.
        - Sembolleri standartlaştır (+, -, x, ÷).
        
        EĞER OKUMA/SÖZEL İSE:
        - Ana metni 'readingText' alanına koy.
        - Soruları 'questions' dizisine ekle.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING, enum: ['math', 'reading', 'mixed'] },
                title: { type: Type.STRING },
                mathItems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            num1: { type: Type.STRING },
                            num2: { type: Type.STRING },
                            operator: { type: Type.STRING },
                            answer: { type: Type.STRING }
                        },
                        required: ['num1', 'operator', 'num2']
                    }
                },
                readingText: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['question']
                    }
                }
            },
            required: ['detectedType', 'title']
        };

        return await analyzeImage(base64Image, prompt, schema);
    },

    convertToWorksheetData: (ocrData: any): { type: any, data: any[] } => {
        if (ocrData.detectedType === 'math' && ocrData.mathItems?.length > 0) {
            // Convert to BasicOperationsData
            const operations = ocrData.mathItems.map((item: any) => ({
                num1: parseInt(item.num1) || 0,
                num2: parseInt(item.num2) || 0,
                operator: item.operator,
                answer: parseInt(item.answer) || (item.operator === '+' ? (parseInt(item.num1)+parseInt(item.num2)) : 0)
            }));
            
            const sheetData: BasicOperationsData = {
                title: ocrData.title || "Taranmış Matematik Etkinliği",
                instruction: "İşlemleri yapınız.",
                pedagogicalNote: "Dijitalleştirilmiş matematik alıştırması.",
                isVertical: true,
                operations: operations
            };
            
            return { type: ActivityType.BASIC_OPERATIONS, data: [sheetData] };
        } 
        
        if (ocrData.detectedType === 'reading' || ocrData.readingText) {
            // Convert to StoryData
            const sheetData: StoryData = {
                title: ocrData.title || "Okuma Parçası",
                story: ocrData.readingText || "",
                instruction: "Metni okuyun ve soruları cevaplayın.",
                pedagogicalNote: "Dijitalleştirilmiş okuma etkinliği.",
                mainIdea: "Taranmış içerik.",
                characters: [],
                setting: "",
                questions: (ocrData.questions || []).map((q: any) => ({
                    type: q.options && q.options.length > 0 ? 'multiple-choice' : 'open-ended',
                    question: q.question,
                    options: q.options || [],
                    answerIndex: 0
                }))
            };
             return { type: ActivityType.STORY_COMPREHENSION, data: [sheetData] };
        }

        // Fallback generic
        return { 
            type: ActivityType.STORY_COMPREHENSION, 
            data: [{
                title: "Taranmış Belge",
                story: "İçerik algılandı ancak tam sınıflandırılamadı.",
                questions: [],
                instruction: "İçeriği inceleyin.",
                mainIdea: "", characters: [], setting: ""
            }] 
        };
    }
};
