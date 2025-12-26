
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { getMathPrompt } from './prompts';

export const generateBasicOperationsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, itemCount, studentContext, selectedOperations, allowCarry, allowBorrow } = options;
    
    const operationRule = `
    - İşlemler: ${selectedOperations?.join(', ') || 'Karışık'}.
    - Eldeli Toplama: ${allowCarry ? 'Serbest' : 'KESİNLİKLE YASAK (Yeni öğrenenler için)'}.
    - Onluk Bozma: ${allowBorrow ? 'Serbest' : 'KESİNLİKLE YASAK'}.
    - Adet: ${itemCount || 25} işlem.
    - Matematiksel Doğruluk: Her işlem kesinlikle doğru sonuçlanmalı ve kısıtlamalara uymalıdır.
    `;

    const prompt = getMathPrompt("Dört İşlem Alıştırması", difficulty, operationRule, studentContext);

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            operations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        num1: { type: Type.INTEGER },
                        num2: { type: Type.INTEGER },
                        num3: { type: Type.INTEGER, nullable: true },
                        operator: { type: Type.STRING },
                        answer: { type: Type.INTEGER }
                    },
                    required: ['num1', 'num2', 'operator', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'operations', 'pedagogicalNote', 'imagePrompt']
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateClockReadingFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, itemCount, studentContext } = options;
    const rule = `
    - Seviye: ${difficulty}.
    - Görev: Analog saatleri okuma ve dijital karşılığını bulma.
    - Zorluk: ${difficulty === 'Başlangıç' ? 'Sadece tam ve yarım saatler' : difficulty === 'Orta' ? 'Çeyrek saatler dahil' : 'Tüm dakika varyasyonları'}.
    - Adet: ${itemCount || 8} saat.
    `;
    const prompt = getMathPrompt("Saat Okuma", difficulty, rule, studentContext);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                clocks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            hour: { type: Type.INTEGER },
                            minute: { type: Type.INTEGER },
                            displayType: { type: Type.STRING, enum: ['analog', 'digital'] },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING }
                        },
                        required: ['hour', 'minute', 'displayType', 'correctAnswer']
                    }
                }
            },
            required: ['title', 'instruction', 'clocks']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateMoneyCountingFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, itemCount, studentContext } = options;
    const rule = `
    - Seviye: ${difficulty}.
    - Görev: Türk Lirası (TL) madeni ve kağıt paralarını sayma.
    - Zorluk: ${difficulty === 'Başlangıç' ? '1-20 TL arası, sadece madeni paralar' : '100 TL\'ye kadar, kağıt ve madeni karışık'}.
    - Adet: ${itemCount || 4} bulmaca.
    `;
    const prompt = getMathPrompt("Para Sayma", difficulty, rule, studentContext);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            totalAmount: { type: Type.NUMBER },
                            coins: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, count: { type: Type.INTEGER } } } },
                            notes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, count: { type: Type.INTEGER } } } },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            correctAnswer: { type: Type.NUMBER }
                        },
                        required: ['totalAmount', 'question', 'correctAnswer']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateMathMemoryCardsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, itemCount, studentContext } = options;
    const rule = `
    - Hafıza kartı oyunu içeriği üret.
    - Her çift: Bir işlem (veya görsel temsil) ve onun sonucu.
    - Kart tipi karışık olsun (Görsel temsil: domino noktaları, 10'luk çerçeve vb.)
    `;
    const prompt = getMathPrompt("Matematik Hafıza Kartları", difficulty, rule, studentContext);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            card1: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    type: { type: Type.STRING, enum: ['operation', 'visual', 'text'] },
                                    value: { type: Type.STRING },
                                    visualType: { type: Type.STRING },
                                    num: { type: Type.INTEGER }
                                },
                                required: ['type', 'value']
                            },
                            card2: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    type: { type: Type.STRING },
                                    value: { type: Type.STRING }
                                },
                                required: ['type', 'value']
                            }
                        },
                        required: ['card1', 'card2']
                    }
                }
            },
            required: ['title', 'pairs']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, numberRange, codeLength, useThirdNumber, worksheetCount, itemCount, studentContext } = options;
    
    // Total items to generate across all pages
    const totalItems = itemCount || (worksheetCount * 4);
    
    const rule = `
    [GÖREV]: Üst düzey "Sayısal Mantık Bilmeceleri" üret.
    [MODEL]: gemini-3-flash-preview (Multimodal, uzamsal zeka odaklı).
    [ZORLUK]: ${difficulty}
    [SAYI ARALIĞI]: ${numberRange || '1-50'}
    [BİLMECE YAPISI]: Her bilmece ${codeLength || 3} adet profesyonel mantıksal ipucu içermelidir.
    [BÜYÜK TOPLAM]: ${useThirdNumber ? 'AKTİF - Sayfadaki tüm doğru cevapların toplamı tam olarak alt kutudaki HEDEF SAYI etmelidir.' : 'Pasif'}.
    [MİKTAR]: Toplam ${totalItems} bilmece üret. 
    
    TASARIM KURALLARI:
    - Bir A4 sayfasını tam dolduracak şekilde her sayfada 4 büyük bilmece kartı planla.
    - JSON çıktısında bilmeceleri sayfalara (pages) böl.
    - "boxes": Her bilmece için 5 adet kutu grubu. Her grupta 2-3 adet sayı olsun. Doğru cevap bu sayılardan biri olmalı.
    - "options": 4 adet şık (A, B, C, D) ve sayı değerleri.
    - "sumTarget": Her sayfa için o sayfadaki bilmecelerin cevaplarının toplamını hesapla.

    İPUCU ÖRNEKLERİ:
    - ${difficulty === 'Başlangıç' ? '12\'den küçüğüm, çiftim, 5\'in 1 fazlasıyım.' : difficulty === 'Orta' ? 'Onlar basamağım 3, rakamlarım toplamı tek sayı, 4\'e bölünürüm.' : 'Asal sayıyım, 2 basamaklı en büyük asal sayıdan 10 küçüğüm, rakamlarım çarpımı 12.'}
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
                            boxes: { 
                                type: Type.ARRAY, 
                                items: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                            },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['riddle', 'boxes', 'options', 'answer', 'answerValue']
                    }
                }
            },
            required: ['title', 'puzzles', 'sumTarget']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, gridSize, worksheetCount, studentContext } = options;
    const size = gridSize || 4;
    const rule = `
    - Kendoku (KenKen) bulmacası üret.
    - Izgara boyutu: ${size}x${size}.
    - Matematiksel kafesler (cages) oluştur.
    - Her kafes bir hedef sayı ve işlem (+, -, *, /) içermelidir.
    `;
    const prompt = getMathPrompt("Kendoku Bulmacası", difficulty, rule, studentContext);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            size: { type: Type.INTEGER },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER, nullable: true } } },
                            cages: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } },
                                        operation: { type: Type.STRING },
                                        target: { type: Type.INTEGER }
                                    },
                                    required: ['cells', 'target']
                                }
                            }
                        },
                        required: ['size', 'grid', 'cages']
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, pyramidType, worksheetCount, studentContext } = options;
    const rule = `
    - Sayı Piramidi üret.
    - İşlem tipi: ${pyramidType || 'Toplama'}.
    - Bazı kutucukları boş bırak (null olarak gönder).
    - Piramit mantıklı ve çözülebilir olmalıdır.
    `;
    const prompt = getMathPrompt("Sayı Piramidi", difficulty, rule, studentContext);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                pyramids: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER, nullable: true } } }
                        },
                        required: ['rows']
                    }
                }
            },
            required: ['title', 'pyramids']
        }
    };
    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};
