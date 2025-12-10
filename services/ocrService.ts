
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, BasicOperationsData, StoryData, WordConnectData, FindTheDifferenceData } from '../types';

export const ocrService = {
    processImage: async (base64Image: string): Promise<any> => {
        const prompt = `
        [ROL: UZMAN EĞİTİM MATERYALİ MİMARI]
        
        GÖREV: Yüklenen görseldeki çalışma kağıdını analiz et, "Pedagojik Mantığını" çöz ve bu mantığa uygun **YENİ İÇERİK** üret.
        
        ADIM 1: ANALİZ
        - Bu etkinlik ne istiyor? (Eşleştirme, Hesaplama, Okuma, Fark Bulma, Sıralama?)
        - Zorluk seviyesi nedir?
        - Kullanılan nesneler/kavramlar neler?

        ADIM 2: EŞLEŞTİRME (EN ÖNEMLİ)
        Görseli aşağıdaki kategorilerden en uygun olanına ata:
        - "MATH": Matematik işlemleri, sayı örüntüleri.
        - "READING": Okuma parçası, 5N1K, hikaye.
        - "MATCHING": İki sütunu eşleştirme, kelime-resim eşleme.
        - "DIFFERENCE": Farklı olanı bulma, görsel dikkat.
        
        ADIM 3: ÜRETİM (KOPYALAMA YAPMA, VARYASYON ÜRET)
        - Görseldeki içeriğin AYNISINI değil, MANTIĞINI kopyala.
        - Eğer görselde "Elma - Kırmızı" eşleşmesi varsa, sen "Muz - Sarı", "Yaprak - Yeşil" gibi YENİ örnekler üret.
        - Bir A4 sayfasını dolduracak kadar (en az 5-10 adet) yeni veri üret.

        ÇIKTI FORMATI (JSON):
        Eğer MATH ise: "mathItems" dizisi (num1, operator, num2, answer).
        Eğer READING ise: "readingText" (yeni bir hikaye) ve "questions" (sorular).
        Eğer MATCHING ise: "pairs" dizisi (item1, item2 - örn: zıt anlamlılar, eş anlamlılar veya ilişkili kavramlar).
        Eğer DIFFERENCE ise: "rows" dizisi (items: string[], correctIndex: number).
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING, enum: ['MATH', 'READING', 'MATCHING', 'DIFFERENCE', 'UNKNOWN'] },
                title: { type: Type.STRING, description: "Etkinlik için uygun bir başlık" },
                description: { type: Type.STRING, description: "Etkinliğin mantığı (Örn: Zıt anlamlıları eşleştirme)" },
                // MATH
                mathItems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            num1: { type: Type.STRING },
                            num2: { type: Type.STRING },
                            operator: { type: Type.STRING },
                            answer: { type: Type.STRING }
                        }
                    }
                },
                // READING
                readingText: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                },
                // MATCHING
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            left: { type: Type.STRING },
                            right: { type: Type.STRING }
                        },
                        required: ['left', 'right']
                    }
                },
                // DIFFERENCE
                rows: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            items: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.INTEGER }
                        }
                    }
                }
            },
            required: ['detectedType', 'title', 'description']
        };

        return await analyzeImage(base64Image, prompt, schema);
    },

    convertToWorksheetData: (ocrData: any): { type: ActivityType, data: any[] } => {
        // 1. MATCHING ACTIVITY (Word Connect)
        if (ocrData.detectedType === 'MATCHING' && ocrData.pairs?.length > 0) {
            const points: any[] = [];
            ocrData.pairs.forEach((pair: any, index: number) => {
                // Left item
                points.push({
                    word: pair.left,
                    pairId: index,
                    x: 0,
                    y: index,
                    color: '#000', // Default, Sheet handles colors
                    imagePrompt: pair.left // Try to get image
                });
                // Right item (shuffled visually by sheet, but we assign logic here)
                points.push({
                    word: pair.right,
                    pairId: index,
                    x: 1,
                    y: index, // Sheet logic handles shuffling positions usually
                    color: '#000',
                    imagePrompt: pair.right
                });
            });

            const sheetData: WordConnectData = {
                title: ocrData.title || "Eşleştirme Etkinliği",
                instruction: `İlişkili olanları çizgilerle eşleştirin. (${ocrData.description})`,
                pedagogicalNote: "İlişkisel düşünme ve kavram eşleştirme.",
                gridDim: ocrData.pairs.length,
                points: points
            };
            return { type: ActivityType.WORD_CONNECT, data: [sheetData] };
        }

        // 2. MATH ACTIVITY
        if (ocrData.detectedType === 'MATH' && ocrData.mathItems?.length > 0) {
            const operations = ocrData.mathItems.map((item: any) => ({
                num1: parseInt(item.num1) || 0,
                num2: parseInt(item.num2) || 0,
                operator: item.operator || '+',
                answer: parseInt(item.answer) || 0
            }));
            
            const sheetData: BasicOperationsData = {
                title: ocrData.title || "Matematik Alıştırması",
                instruction: "İşlemleri yapınız.",
                pedagogicalNote: `Bu etkinlik, ${ocrData.description} becerisini hedefler.`,
                isVertical: true,
                operations: operations
            };
            return { type: ActivityType.BASIC_OPERATIONS, data: [sheetData] };
        } 
        
        // 3. READING ACTIVITY
        if (ocrData.detectedType === 'READING' || ocrData.readingText) {
            const sheetData: StoryData = {
                title: ocrData.title || "Okuma Parçası",
                story: ocrData.readingText || "",
                instruction: "Metni okuyun ve soruları cevaplayın.",
                pedagogicalNote: "Okuduğunu anlama çalışması.",
                mainIdea: ocrData.description || "Genel anlama",
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

        // 4. FIND DIFFERENCE / ODD ONE OUT
        if (ocrData.detectedType === 'DIFFERENCE' && ocrData.rows?.length > 0) {
            const sheetData: FindTheDifferenceData = {
                 title: ocrData.title || "Farklı Olanı Bul",
                 instruction: "Her satırda farklı olanı bulup işaretleyin.",
                 pedagogicalNote: "Görsel ayrıştırma ve dikkat.",
                 rows: ocrData.rows.map((r: any) => ({
                     items: r.items,
                     correctIndex: r.correctIndex,
                     visualDistractionLevel: 'medium'
                 }))
            };
            return { type: ActivityType.FIND_THE_DIFFERENCE, data: [sheetData] };
        }

        // Fallback generic
        return { 
            type: ActivityType.STORY_COMPREHENSION, 
            data: [{
                title: "Analiz Sonucu",
                story: `Görsel analiz edildi ancak belirli bir şablona tam oturtulamadı.\n\nAlgılanan İçerik:\n${JSON.stringify(ocrData, null, 2)}`,
                questions: [],
                instruction: "İçeriği inceleyin.",
                mainIdea: "", characters: [], setting: ""
            }] 
        };
    }
};
