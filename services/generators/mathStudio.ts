
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { MathProblemConfig } from '../../types/math';

export const generateMathProblemsAI = async (config: MathProblemConfig) => {
    // Operations text build
    const opsMap: Record<string, string> = {
        'add': 'Toplama (+)',
        'sub': 'Çıkarma (-)',
        'mult': 'Çarpma (x)',
        'div': 'Bölme (÷)'
    };
    
    const selectedOpsText = config.selectedOperations.length > 0 
        ? config.selectedOperations.map(op => opsMap[op]).join(' ve ')
        : 'Dört İşlem Karışık';

    const complexityDesc = config.complexity === '1-step' ? 'Tek işlemli, doğrudan çözüm gerektiren' 
        : config.complexity === '2-step' ? 'İki aşamalı (Önce topla sonra çıkar gibi)' 
        : 'Çok adımlı ve düşündürücü';

    const prompt = `
    [ROL: MATEMATİK MÜFREDAT UZMANI ve ÖZEL EĞİTİM PEDAGOGU]
    
    GÖREV: Aşağıdaki **KESİN MATEMATİKSEL KISITLAMALARA** uyarak özgün sözel problemler üret.
    
    KONFİGÜRASYON:
    - **Adet:** ${config.count} tane problem.
    - **Konu/Tema:** ${config.topic || 'Günlük Yaşam'}.
    - **Öğrenci Adı:** ${config.studentName || 'Öğrenci'}.
    - **Konu Başlıkları:** SADECE ${selectedOpsText}. (Başka işlem kullanma!)
    - **Sayı Aralığı:** ${config.numberRange} (Sonuçlar ve ara işlemler bu aralıkta kalmalı).
    - **Problem Yapısı:** ${complexityDesc}.
    - **Tarz:** ${config.problemStyle === 'story' ? 'Hikayeleştirilmiş, uzun betimlemeli' : config.problemStyle === 'logic' ? 'Mantık bulmacası tarzında' : 'Kısa, net ve anlaşılır'}.

    PEDAGOJİK KURALLAR (DİSLEKSİ & DİSKALKULİ DOSTU):
    1. Cümleler kısa ve net olsun. Devrik cümle kullanma.
    2. Gereksiz sayısal kalabalık yapma. 
    3. İşlem ipucu (operationHint) alanına, hangi işlemin yapılacağını kısaca yaz (örn: "Toplama işlemi").
    4. Cevap anahtarı kesinlikle doğru hesaplanmış olmalı.

    ÇIKTI FORMATI (JSON):
    [
      {
        "text": "Problem metni buraya...",
        "answer": "Sadece sayısal cevap (örn: 15)",
        "operationHint": "Hangi işlemin yapılacağı (örn: 5 ile 3'ü topla)",
        "steps": ["Adım 1: ...", "Adım 2: ..."]
      }
    ]
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            problems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        answer: { type: Type.STRING },
                        operationHint: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['text', 'answer', 'operationHint']
                }
            }
        },
        required: ['problems']
    };

    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return await generateWithSchema(prompt, schema);
};
