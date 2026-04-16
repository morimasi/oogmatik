import { useState, useCallback } from 'react';
import { KelimeCumleConfig, KelimeCumleGeneratedContent, KelimeCumleActivityType } from '../../../types/kelimeCumle';
import { KELIME_CUMLE_SOURCES } from '../../../kaynak/kelimeCumle';
import { generateWithGemini } from '../../../services/geminiClient';

export const useKelimeCumleGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateOffline = useCallback((config: KelimeCumleConfig): KelimeCumleGeneratedContent => {
        const sourcePool = KELIME_CUMLE_SOURCES[config.type];
        
        if (!sourcePool || sourcePool.length === 0) {
            throw new Error(`Belirtilen tip için veri kaynağı bulunamadı: ${config.type}`);
        }

        // Tüm havuzu karıştır ve istenen adet kadar benzersiz öğe seç
        const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
        const selectedItems = shuffled.slice(0, Math.min(config.itemCount, shuffled.length));

        return {
            title: config.title || "Yeni Etkinlik",
            instructions: getInstructions(config.type),
            pedagogicalNote: getPedagogicalNote(config.type),
            items: selectedItems,
            activityType: config.type
        };
    }, []);

    const generateAI = useCallback(async (config: KelimeCumleConfig): Promise<KelimeCumleGeneratedContent> => {
        setIsGenerating(true);
        setError(null);
        try {
            const prompt = buildPrompt(config);
            const response = await generateWithGemini(prompt);
            const content = typeof response === 'string' ? JSON.parse(response) : response;
            return {
                ...content,
                activityType: config.type
            };
        } catch (err) {
            console.error('AI Generation Error:', err);
            setError('AI içerik üretirken bir hata oluştu. Lütfen tekrar deneyin.');
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        generateOffline,
        generateAI,
        isGenerating,
        error
    };
};

function getInstructions(type: KelimeCumleActivityType): string {
    switch (type) {
        case 'bosluk_doldurma': return 'Cümlelerdeki boşluklara uygun kelimeleri yazınız ve cümleleri yüksek sesle okuyunuz.';
        case 'test': return 'Soruları dikkatlice okuyup doğru seçeneği işaretleyiniz.';
        case 'kelime_tamamlama': return 'Verilen ipuçlarından yararlanarak eksik harfleri tamamlayıp kelimeleri bulunuz.';
        case 'karisik_cumle': return 'Karışık olarak verilen kelimeleri anlamlı ve kurallı cümleler haline getiriniz.';
        case 'zit_anlam': return 'Verilen kelimelerin zıt (karşıt) anlamlılarını yanlarındaki boşluklara yazınız.';
        default: return '';
    }
}

function getPedagogicalNote(type: KelimeCumleActivityType): string {
    switch (type) {
        case 'bosluk_doldurma': return 'Bağlamdan anlam çıkarma ve kelime dağarcığını geliştirme hedeflenmektedir.';
        case 'test': return 'Okuduğunu anlama ve seçenekler arasında eleme yapabilme becerisini ölçer.';
        case 'kelime_tamamlama': return 'Fonolojik farkındalık ve harf-ses ilişkisini güçlendirmek amaçlanır.';
        case 'karisik_cumle': return 'Cümle yapısı farkındalığı ve sözdizimi becerilerini geliştirir.';
        case 'zit_anlam': return 'Kavramsal düşünme ve kelime ilişkilerini kavrama becerisini destekler.';
        default: return '';
    }
}

function buildPrompt(config: KelimeCumleConfig): string {
    const difficultyRules = {
        'Başlangıç': '~60 kelime, kısa ve basit cümleler.',
        'Orta': '3x Başlangıç yoğunluğu, ~180 kelime, birleşik cümleler.',
        'İleri': '3x Orta yoğunluğu, ~500+ kelime, kompleks yapılar, tam dolu A4.',
        'Uzman': 'Maksimum A4 yoğunluğu, akademik/teknik dil.'
    };

    // İlgili türden rastgele örnekler çek (few-shot)
    const sources = KELIME_CUMLE_SOURCES[config.type];
    const randomSamples = [...sources].sort(() => Math.random() - 0.5).slice(0, 3);
    const exampleStr = JSON.stringify(randomSamples, null, 2);

    return `Sen bir disleksi eğitim uzmanısın. "Kelime-Cümle Stüdyosu" için profesyonel çalışma kağıdı içeriği üretiyorsun.

GÖREV: "${config.type}" türünde etkinlik üret.
YAŞ GRUBU: ${config.ageGroup}
ZORLUK SEVİYESİ: ${config.difficulty} (${difficultyRules[config.difficulty]})
ADET: ${config.itemCount}
KONULAR: ${config.topics.join(', ')}

REFERANS ÖRNEKLER (Bu kalite ve yapıda üret):
${exampleStr}

KURALLAR:
1. JSON formatında yanıt ver. Başka hiçbir açıklama ekleme.
2. Pedagojik olarak disleksi ve öğrenme güçlüğü çeken çocuklara uygun, sade ve net bir dil kullan. Tanı koyucu ("disleksisi var" gibi) ifadeler asla kullanma.
3. Her zaman "pedagogicalNote" alanı ekle.
4. "items" dizisi üretilen etkinlik maddelerini içermelidir.
5. ZORLUK ARTIŞI: Seviyeler arasında PROGRESİF (3x) artış olmalıdır. İleri ve Uzman seviyeleri sayfayı tamamen dolduracak kadar yoğun içerik içermelidir.
6. Gerçek hayattan, somut ve çocukların ZPD (Yakınsal Gelişim Alanı) seviyesine uygun örnekler seç.

ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "instructions": "string",
  "pedagogicalNote": "string",
  "items": [ ... ]
}

ETKİNLİK TÜRÜNE GÖRE ITEM YAPISI:
- bosluk_doldurma: { "sentence": "string (boşluk için ……… kullan)", "answer": "string" }
- test: { "question": "string", "options": ["string", "string", "string", "string"], "answer": "string" }
- kelime_tamamlama: { "word": "string (eksik harf için ... kullan)", "fullWord": "string", "clue": "string" }
- karisik_cumle: { "words": ["string", ...], "correctSentence": "string" }
- zit_anlam: { "word": "string", "antonym": "string" }
`;
}
