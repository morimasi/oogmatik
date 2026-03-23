
import { generateWithSchema } from '../geminiClient.js';
import { MathProblemConfig } from '../../types/math.js';

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
    const problemTypesText = (config.problemTypes && config.problemTypes.length > 0)
        ? config.problemTypes.map(t => {
            if (t === 'standard') return 'Standart Sözel';
            if (t === 'fill-in') return 'Boşluk Doldurma (Örn: 23 + ___ = 41)';
            if (t === 'true-false') return 'Doğru/Yanlış (Örn: 15x3=40 -> Yanlış)';
            if (t === 'comparison') return 'Karşılaştırma (Örn: 45 ___ 54 -> <)';
            return t;
        }).join(', ')
        : 'Standart Sözel';

    const prompt = `
    [ROL: MATEMATİK MÜFREDAT UZMANI ve ÖZEL EĞİTİM PEDAGOGU]
    
    GÖREV: Aşağıdaki **KESİN MATEMATİKSEL KISITLAMALARA** uyarak özgün problemler üret.
    
    KONFİGÜRASYON:
    - **Adet:** ${config.count} tane problem.
    - **Konu/Tema:** ${config.topic || 'Günlük Yaşam'}.
    - **Soru Tipleri:** ${problemTypesText} (Bu soru formatlarını karışık kullan).
    - **Öğrenci Adı:** ${config.studentName || 'Öğrenci'}.
    - **Konu Başlıkları:** SADECE ${selectedOpsText}. (Başka işlem kullanma!)
    - **Sayı Aralığı:** ${config.numberRange} (Sonuçlar ve ara işlemler bu aralıkta kalmalı).
    - **Zorluk Seviyesi:** ${config.difficulty} (Bu seviyeye kesinlikle uy!)
    - **Problem Yapısı:** ${complexityDesc}.
    - **Tarz:** ${config.problemStyle === 'story' ? 'Hikayeleştirilmiş, uzun betimlemeli' : config.problemStyle === 'logic' ? 'Mantık bulmacası tarzında' : 'Kısa, net ve anlaşılır'}.
    ${config.generateImages ? '- **Görsel İpucu:** Her soru için uygun bir İngilizce "imagePrompt" üret (dall-e tarzı).' : ''}

    ZORLUK SEVİYELERİ:
    - Başlangıç: 1 basamak, somut nesne referansları, çok basit dil
    - Temel: 2 basamak, günlük yaşam senaryoları
    - Orta: 2-3 basamak, bağlamsal hikaye
    - İleri: 3+ basamak, çok adımlı, mantık + aritmetik kombine
    - Uzman: Stratejik düşünme, çok katmanlı, tuzak şıklı

    PEDAGOJİK KURALLAR (DİSLEKSİ & DİSKALKULİ DOSTU):
    1. Cümleler kısa ve net olsun. Devrik cümle kullanma.
    2. Gereksiz sayısal kalabalık yapma. 
    3. İşlem ipucu (operationHint) alanına, hangi işlemin yapılacağını kısaca yaz (örn: "Toplama işlemi").
    4. Cevap anahtarı kesinlikle doğru hesaplanmış olmalı.
    5. Kademeli zorluk: İlk problemler kolay, son problemler ${config.difficulty} seviyesinde olsun.
    6. "type" alanına "standard", "fill-in", "true-false", veya "comparison" yaz.
    7. "options" alanına (eğer soru test veya D/Y ise) şıkları yaz, değilse boş dizi bırak.

    ÇIKTI FORMATI (JSON):
    {
      "instruction": "Tüm bu problemler için genel, motive edici, giriş niteliğinde tek bir Türkçe yönerge/talimat cümlesi yaz (örn: 'Uzay mekiği kalkışa hazırlanıyor! Gerekli güvenlik şifrelerini hesaplayarak Astronot Ali'ye yardım et.')",
      "problems": [
        {
          "text": "Problem metni buraya...",
          "answer": "Sadece sayısal cevap (örn: 15, D/Y, veya <)",
          "operationHint": "Hangi işlemin yapılacağı (örn: 5 ile 3'ü topla)",
          "type": "standard",
          ${config.generateImages ? '"imagePrompt": "A simple flat illustration of 3 apples on a table", // Ingilizce' : ''}
          "options": [],
          "steps": ["Adım 1: ...", "Adım 2: ..."]
        }
      ]
    }
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            instruction: { type: 'STRING' },
            problems: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        text: { type: 'STRING' },
                        answer: { type: 'STRING' },
                        operationHint: { type: 'STRING' },
                        type: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' },
                        options: { type: 'ARRAY', items: { type: 'STRING' } },
                        steps: { type: 'ARRAY', items: { type: 'STRING' } }
                    },
                    required: ['text', 'answer', 'operationHint', 'type']
                }
            }
        },
        required: ['instruction', 'problems']
    };

    // Fix: Using stable gemini-3-flash for maximum speed and cost efficiency
    return await generateWithSchema(prompt, schema);
};
