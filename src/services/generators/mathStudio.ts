import { generateWithSchema } from '../geminiClient.js';
import { MathProblemConfig, MathProblem } from '../../types/math.js';
import { getRandomInt } from '../offlineGenerators/helpers.js';

/**
 * Offline Math Problem Fallback Generator
 * Disleksi, Diskalkuli ve DEHB profillerine tam uyumlu, MEB müfredatı standartlarında
 * deterministik ve pedagojik matematik problemleri üretir.
 */
export const generateOfflineMathStudioProblems = (config: MathProblemConfig): {
    pedagogicalNote: string;
    instruction: string;
    problems: MathProblem[];
} => {
    const studentName = config.studentName || 'Öğrenci';
    const topic = config.topic || 'Günlük Yaşam';
    const profile = config.learningProfile || 'dyslexia';
    const count = Math.max(1, Math.min(20, config.count || 4));

    // Sayı aralığı çözümleme
    let minNum = 1;
    let maxNum = 20;
    if (config.numberRange === '1-10') { minNum = 1; maxNum = 10; }
    else if (config.numberRange === '1-20') { minNum = 1; maxNum = 20; }
    else if (config.numberRange === '1-50') { minNum = 5; maxNum = 50; }
    else if (config.numberRange === '1-100') { minNum = 10; maxNum = 100; }
    else if (config.numberRange === '100-1000') { minNum = 100; maxNum = 999; }

    const ops = config.selectedOperations && config.selectedOperations.length > 0
        ? config.selectedOperations
        : ['add', 'sub'];

    // Profil bazlı pedagojik not
    let pedagogicalNote = 'Bu çalışma, temel aritmetik becerilerini pekiştirmek ve problem çözme stratejilerini geliştirmek üzere ZPD prensipleriyle yapılandırılmıştır.';
    if (profile === 'dyscalculia') {
        pedagogicalNote = 'Diskalkuli Desteği: Sorular somut nesneler, adım adım işlem basamakları ve görsel ayrıştırma ipuçları ile desteklenmiştir. Sayı hissini güçlendirmek için basamaklar net ayrılmıştır.';
    } else if (profile === 'dyslexia') {
        pedagogicalNote = 'Disleksi Desteği: Metinler kısa, açık ve devrik olmayan cümlelerle kurgulanmıştır. Sayısal veriler metin içinde belirginleştirilmiş ve bilişsel yük en aza indirilmiştir.';
    } else if (profile === 'adhd') {
        pedagogicalNote = 'DEHB Desteği: 5-7 dakikalık mikro-döngüye uygun, dikkat toplayıcı ve motive edici kısa görev adımları içermektedir.';
    }

    const instruction = `${studentName}, aşağıdaki ${topic} temalı matematik problemlerini dikkatlice oku, işlem adımlarını kutucuklara yazarak çözüme ulaş.`;

    const problems: MathProblem[] = [];

    // Problem kalıpları
    const problemTemplates = [
        {
            op: 'add',
            gen: (a: number, b: number) => ({
                text: `${studentName}, ${topic} etkinliği için ${a} adet yıldız kartı topladı. Öğretmeni ona ${b} yıldız kartı daha verdi. ${studentName}'nin toplam kaç yıldız kartı oldu?`,
                answer: String(a + b),
                hint: `${a} ile ${b} sayısını topla (+)`,
                type: 'standard' as const,
                steps: [`1. Adım: Başlangıçtaki kart sayısı = ${a}`, `2. Adım: Eklenen kart sayısı = ${b}`, `3. Adım: ${a} + ${b} = ${a + b}`],
                svgCode: `<svg viewBox="0 0 400 80" width="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><circle cx="60" cy="40" r="22" fill="#3b82f6" opacity="0.2"/><text x="60" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1d4ed8" text-anchor="middle">${a}</text><text x="120" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">+</text><circle cx="180" cy="40" r="22" fill="#10b981" opacity="0.2"/><text x="180" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="#047857" text-anchor="middle">${b}</text><text x="240" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">=</text><rect x="280" y="22" width="60" height="36" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><text x="310" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">?</text></svg>`
            })
        },
        {
            op: 'sub',
            gen: (a: number, b: number) => {
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                return {
                    text: `${topic} kutusunda ${big} adet boya kalemi vardı. Resim çalışması sırasında ${small} tanesi kullanıldı. Kutuda geriye kaç boya kalemi kaldı?`,
                    answer: String(big - small),
                    hint: `${big} sayısından ${small} sayısını çıkar (-)`,
                    type: 'standard' as const,
                    steps: [`1. Adım: Toplam kalem = ${big}`, `2. Adım: Kullanılan kalem = ${small}`, `3. Adım: ${big} - ${small} = ${big - small}`],
                    svgCode: `<svg viewBox="0 0 400 80" width="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><circle cx="60" cy="40" r="22" fill="#ef4444" opacity="0.2"/><text x="60" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="#b91c1c" text-anchor="middle">${big}</text><text x="120" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">-</text><circle cx="180" cy="40" r="22" fill="#f59e0b" opacity="0.2"/><text x="180" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="#b45309" text-anchor="middle">${small}</text><text x="240" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">=</text><rect x="280" y="22" width="60" height="36" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><text x="310" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">?</text></svg>`
                };
            }
        },
        {
            op: 'mult',
            gen: (a: number, b: number) => {
                const n1 = Math.max(2, Math.min(12, a % 12 || 3));
                const n2 = Math.max(2, Math.min(10, b % 10 || 4));
                return {
                    text: `${topic} sergisinde ${n1} sıra masa bulunmaktadır. Her masanın üzerinde ${n2} adet çalışma defteri olduğuna göre, sergide toplam kaç defter vardır?`,
                    answer: String(n1 * n2),
                    hint: `${n1} ile ${n2} sayısını çarp (×)`,
                    type: 'standard' as const,
                    steps: [`1. Adım: Sıra sayısı = ${n1}`, `2. Adım: Her sıradaki defter = ${n2}`, `3. Adım: ${n1} × ${n2} = ${n1 * n2}`],
                    svgCode: `<svg viewBox="0 0 400 80" width="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><text x="60" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#4f46e5" text-anchor="middle">${n1} grup</text><text x="130" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">×</text><text x="200" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0891b2" text-anchor="middle">${n2} nesne</text><text x="270" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">=</text><rect x="300" y="22" width="70" height="36" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><text x="335" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">?</text></svg>`
                };
            }
        },
        {
            op: 'div',
            gen: (a: number, b: number) => {
                const divisor = Math.max(2, Math.min(9, b % 9 || 3));
                const quotient = Math.max(2, Math.min(12, a % 12 || 4));
                const dividend = divisor * quotient;
                return {
                    text: `${studentName}, ${dividend} adet ${topic} pulunu ${divisor} arkadaşına eşit olarak paylaştırmak istiyor. Her bir arkadaşına kaçar pul düşer?`,
                    answer: String(quotient),
                    hint: `${dividend} sayısını ${divisor} sayısına böl (÷)`,
                    type: 'standard' as const,
                    steps: [`1. Adım: Paylaştırılacak toplam pul = ${dividend}`, `2. Adım: Arkadaş sayısı = ${divisor}`, `3. Adım: ${dividend} ÷ ${divisor} = ${quotient}`],
                    svgCode: `<svg viewBox="0 0 400 80" width="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8fafc" rx="12"/><text x="60" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0d9488" text-anchor="middle">${dividend}</text><text x="130" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">÷</text><text x="200" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#d97706" text-anchor="middle">${divisor}</text><text x="270" y="46" font-family="sans-serif" font-size="20" font-weight="bold" fill="#64748b" text-anchor="middle">=</text><rect x="300" y="22" width="70" height="36" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><text x="335" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">?</text></svg>`
                };
            }
        }
    ];

    for (let i = 0; i < count; i++) {
        const op = ops[i % ops.length];
        const tpl = problemTemplates.find(t => t.op === op) || problemTemplates[0];
        const val1 = getRandomInt(minNum, maxNum);
        const val2 = getRandomInt(minNum, Math.max(minNum + 1, Math.floor(maxNum / 2)));
        const res = tpl.gen(val1, val2);

        // Boşluk doldurma veya karşılaştırma varyasyonları
        let finalType: 'standard' | 'fill-in' | 'true-false' | 'comparison' = 'standard';
        let finalText = res.text;
        let finalAnswer = res.answer;
        let options: string[] = [];

        if (config.problemTypes && config.problemTypes.length > 0) {
            const requestedType = config.problemTypes[i % config.problemTypes.length];
            if (requestedType === 'fill-in') {
                finalType = 'fill-in';
                finalText = `${res.text}\nMatematiksel İfade: ${val1} ${op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mult' ? '×' : '÷'} ___ = ${res.answer}`;
            } else if (requestedType === 'true-false') {
                finalType = 'true-false';
                const isCorrect = i % 2 === 0;
                const fakeAns = Number(res.answer) + (isCorrect ? 0 : 3);
                finalText = `${res.text}\nİddia edilen sonuç: ${fakeAns}. Bu sonuç Doğru mu yoksa Yanlış mı?`;
                finalAnswer = isCorrect ? 'Doğru' : 'Yanlış';
                options = ['Doğru', 'Yanlış'];
            } else if (requestedType === 'comparison') {
                finalType = 'comparison';
                const compVal = Number(res.answer) + (i % 2 === 0 ? -2 : 2);
                finalText = `${res.text}\nBulduğun sonuç (${res.answer}) ile ${compVal} sayısını karşılaştır: [ < , > , = ]`;
                finalAnswer = Number(res.answer) > compVal ? '>' : '<';
                options = ['<', '=', '>'];
            }
        }

        problems.push({
            id: `p_offline_${Date.now()}_${i}`,
            text: finalText,
            answer: finalAnswer,
            operationHint: res.hint,
            type: finalType,
            options,
            steps: res.steps,
            svgCode: res.svgCode
        });
    }

    return {
        pedagogicalNote,
        instruction,
        problems
    };
};

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
    [ROL: MATEMATİK MÜFREDAT UZMANI, ÖZEL EĞİTİM PEDAGOGU ve ULTRA KAPSAMLI DİNAMİK SVG GÖRSEL ÜRETİCİSİ]
    
    GÖREV: Aşağıdaki **KESİN MATEMATİKSEL KISITLAMALARA** uyarak özgün problemler üret. Soru metniyle tam uyumlu statik, %100 harici kütüphanesiz (grafik/tablo vb. için) SVG çizimleri yap.
    
    KONFİGÜRASYON:
    - **Adet:** ${config.count} tane problem.
    - **Konu/Tema:** ${config.topic || 'Günlük Yaşam'}.
    - **Soru Tipleri:** ${problemTypesText} (Bu soru formatlarını karışık kullan).
    - **Öğrenci Adı:** ${config.studentName || 'Öğrenci'}.
    - **Yaş Grubu / Seviye:** ${config.ageGroup || '8-10 Yaş'}.
    - **Özel Öğrenme Profili:** ${config.learningProfile || 'Disleksi & Diskalkuli'}.
    - **Konu Başlıkları:** SADECE ${selectedOpsText}. (Başka işlem kullanma!)
    - **Sayı Aralığı:** ${config.numberRange} (Sonuçlar ve ara işlemler bu aralıkta kalmalı).
    - **Zorluk Seviyesi:** ${config.difficulty} (Bu seviyeye kesinlikle uy!)
    - **Problem Yapısı:** ${complexityDesc}.
    ${config.bepGoals && config.bepGoals.length > 0 ? `- **BEP Hedefleri (Kritik):** ${config.bepGoals.join(', ')} (Bu hedeflere yönelik içerik üret!)` : ''}
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

    SVG ÜRETİM KURALLARI (ULTRA ZENGİN YAPI):
    1. İstatistik (Sıklık/Çetele/Nesne Grafikleri), Geometri (Çokgen, Prizma, Açılar), Sayı Doğrusu, Cebir Fonksiyonları veya Olasılık Çarkı soruluyorsa MUHAKKAK svgCode alanı üret.
    2. D3.js, Chart.js gibi harici kütüphaneler YOK. Saf satır içi stillendirilmiş (inline styles) <svg> kodu olmalı.
    3. viewBox niteliği KESİNLİKLE doğru ayarlanmalı (örn: viewBox="0 0 500 400"), width="100%" kullanılmalı. Animasyon (<animate>) YASAK.
    4. Sadece soru metnini destekleyen durumlarda svgCode doldur. Yazılarda font-family="sans-serif", Arial kullan.
    5. Çocuklar için grid (ızgara) eksen arka planı kullan.

    ÇIKTI FORMATI (JSON):
    {
      "pedagogicalNote": "Öğretmen için not...",
      "instruction": "Tüm bu problemler için genel, motive edici, giriş niteliğinde tek bir Türkçe yönerge/talimat cümlesi yaz.",
      "problems": [
        {
          "text": "Problem metni buraya...",
          "answer": "Sadece sayısal cevap (örn: 15, D/Y, veya <)",
          "operationHint": "Hangi işlemin yapılacağı (örn: 5 ile 3'ü topla)",
          "type": "standard",
          ${config.generateImages ? '"imagePrompt": "A simple flat illustration of 3 apples on a table",' : ''}
          "svgCode": "<svg viewBox=\\"0 0 400 300\\" width=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
          "options": [],
          "steps": ["Adım 1: ...", "Adım 2: ..."]
        }
      ]
    }
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            pedagogicalNote: { type: 'STRING', description: 'Öğretmen için aktivitenin eğitsel amacı ve özel öğrenme güçlüğü olan öğrenciye (Disleksi/DEHB/Diskalkuli) faydası üzerine pedagojik not' },
            instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
            problems: {
                type: 'ARRAY', description: 'Matematik problemleri dizisi',
                items: {
                    type: 'OBJECT',
                    properties: {
                        text: { type: 'STRING', description: 'Problem metni' },
                        answer: { type: 'STRING', description: 'Doğru cevap' },
                        operationHint: { type: 'STRING', description: 'İşlem ipucu' },
                        type: { type: 'STRING', description: 'Soru tipi (standard/fill-in/vb.)' },
                        imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' },
                        svgCode: { type: 'STRING', description: 'SVG görsel kodu' },
                        options: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Şık seçenekleri' },
                        steps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Çözüm adımları' }
                    },
                    required: ['text', 'answer', 'operationHint', 'type']
                }
            }
        },
        required: ['pedagogicalNote', 'instruction', 'problems']
    };

    try {
        const response = (await generateWithSchema(prompt, schema)) as { problems?: MathProblem[]; instruction?: string; pedagogicalNote?: string };
        if (response && Array.isArray(response.problems) && response.problems.length > 0) {
            return response;
        }
        return generateOfflineMathStudioProblems(config);
    } catch {
        // Fallback to high quality offline generator
        return generateOfflineMathStudioProblems(config);
    }
};
