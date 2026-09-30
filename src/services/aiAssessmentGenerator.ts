import { generateWithSchema } from './geminiClient.js';
import { CognitiveProfileMetrics } from '../components/assessment/services/cognitiveAdaptiveService.js';

export interface AIGeneratedTestItems {
    domain: string;
    studentName: string;
    adaptiveDifficultyLabel: string;
    pedagogicalGuidance: string;
    items: any[];
}

/**
 * Gemini 2.5 Flash AI motoru ile öğrenciye özel %100 özgün, dinamik değerlendirme soruları/içeriği üretir.
 */
export const generateAIAssessmentContent = async (
    domain: string,
    profile: CognitiveProfileMetrics
): Promise<AIGeneratedTestItems | null> => {
    const studentInfo = `
ÖĞRENCİ BİLGİLERİ VE KLİNİK PROFİL:
• Adı: ${profile.studentName}
• Yaş: ${profile.age} | Sınıf Seviyesi: ${profile.grade}
• Tanı/Özel Eğitim Bağlamı: ${profile.diagnosis.join(', ') || 'Özel eğitim tanısı yok (Standart gelişim takibi)'}
• Güçlü Yönler: ${profile.strengths.join(', ') || 'Genel bilişsel beceriler'}
• İhtiyaç Duyulan Destek/Zayıf Alanlar: ${profile.weaknesses.join(', ') || 'Belirtilmedi'}
• Ek Notlar/Gözlem: ${profile.notes || 'Yok'}
`;

    let domainPrompt = '';
    let schemaProps: any = {};

    switch (domain) {
        case 'verbal_comprehension':
            domainPrompt = `
GÖREV: Bu öğrencinin yaşına, sınıfına ve klinik durumuna özel ZPD (Yakınsak Gelişim Alanı) seviyesinde 6 adet ÖZGÜN Türkçe Kelime Anlamı / Zıt Anlam Değerlendirme Sorusu üret.
- Disleksi/okuma güçlüğü varsa sözcüklerin uzunluğunu ve karmaşıklığını dengeli ayarla.
- Sorular tek kelime ve 4 seçenekli olmalıdır.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            word: { type: 'STRING', description: 'Hedef kelime' },
                            options: { type: 'ARRAY', items: { type: 'STRING' }, description: '4 seçenek' },
                            correct: { type: 'STRING', description: 'Doğru cevap' }
                        },
                        required: ['word', 'options', 'correct']
                    }
                }
            };
            break;

        case 'logic_reasoning':
            domainPrompt = `
GÖREV: Öğrencinin yaşına ve zeka/mantık seviyesine uygun 5 adet ÖZGÜN Mantıksal Örüntü/Dizileme Sorusu üret.
- Izgara biçiminde emoji/sembol/sayı matrisleri kullan (örn: [['🔴', '🔴'], ['🔴', '?']]).
- Her soru için ipucu ve mantık kuralı açıklaması yaz.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'INTEGER' },
                            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                            options: { type: 'ARRAY', items: { type: 'STRING' } },
                            answer: { type: 'STRING' },
                            rule: { type: 'STRING' },
                            difficulty: { type: 'STRING' },
                            hint: { type: 'STRING' }
                        },
                        required: ['id', 'grid', 'options', 'answer', 'rule', 'difficulty', 'hint']
                    }
                }
            };
            break;

        case 'auditory_processing':
            domainPrompt = `
GÖREV: Öğrencinin yaşına uygun, sesle okunacak 6 adet İşitsel İşleme / Dinlediğini Anlama kelime seti oluştur.
- Hedef kelimeler net, sesletimi belirgin nesne/kavramlar olmalıdır.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            targetWord: { type: 'STRING' },
                            options: { type: 'ARRAY', items: { type: 'STRING' } }
                        },
                        required: ['targetWord', 'options']
                    }
                }
            };
            break;

        case 'phonological_loop':
            domainPrompt = `
GÖREV: Öğrenciye özel, artan zorluk seviyelerinde 5 adet Fonolojik Bellek Dizisi (hece, kelime, rakam karışımı) üret.
- Disleksik öğrenciler için ritmik hece ve kısa sözcük dizileri oluştur.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            level: { type: 'INTEGER' },
                            type: { type: 'STRING', description: 'syllable | word | digit | reverse | letter | mixed' },
                            items: { type: 'ARRAY', items: { type: 'STRING' } }
                        },
                        required: ['level', 'type', 'items']
                    }
                }
            };
            break;

        default:
            return null;
    }

    const fullPrompt = `
[ROL: Baş Nöropsikolog ve Uzman Bilişsel Değerlendirme AI Motoru]
${studentInfo}

BİLİŞSEL ALAN: ${domain}
${domainPrompt}

TALİMATLAR:
1. Öğrencinin tanısını, yaşını ve gelişimsel ihtiyaçlarını doğrudan dikkate alarak zorluk derecesini belirle.
2. Çıktı strict JSON olmalıdır.
3. adaptiveDifficultyLabel alanında belirlenen zorluk ve nedenini özetle (örn: "Disleksi profili nedeniyle 2. Sınıf sade hece dizilimi").
4. pedagogicalGuidance alanında öğretmene tavsiye notu yaz.
`;

    const schema = {
        type: 'OBJECT',
        properties: {
            domain: { type: 'STRING' },
            studentName: { type: 'STRING' },
            adaptiveDifficultyLabel: { type: 'STRING' },
            pedagogicalGuidance: { type: 'STRING' },
            ...schemaProps
        },
        required: ['domain', 'studentName', 'adaptiveDifficultyLabel', 'pedagogicalGuidance', 'items']
    };

    try {
        const result = await generateWithSchema(fullPrompt, schema);
        return result as unknown as AIGeneratedTestItems;
    } catch (err) {
        console.error('AI Test Generation Error:', err);
        return null;
    }
};
