<<<<<<< HEAD
import { GeneratorOptions, ActivityType } from '../../types.js';
import { generateFromRichPrompt } from './newActivities.js';
=======
import { GeneratorOptions, ActivityType } from '../../types';
import { generateFromRichPrompt } from './newActivities';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

const TEMPLATES: Record<string, string> = {
    'cloze': `[
        { "type": "header", "content": { "text": "Aşağıdaki metinlerde boş bırakılan yerleri tamamlayınız" } },
        { "type": "cloze_test", "content": { "text": "Konuyla ilgili temel ___, ___ ve ___ açıklanmalıdır." } }
    ]`,
    'match': `[
        { "type": "header", "content": { "text": "Sütunları Eşleştirin" } },
        { "type": "match_columns", "content": { "left": ["A", "B"], "right": ["1", "2"] } }
    ]`,
    'sort': `[
        { "type": "header", "content": { "text": "Sınıflandırma Yapınız" } },
        { "type": "categorical_sorting", "content": { "categories": ["Grup 1", "Grup 2"], "items": [{"label":"Öğe 1", "category":"Grup 1"}] } }
    ]`,
    'table': `[
        { "type": "header", "content": { "text": "Tabloyu Doldurunuz" } },
        { "type": "table", "content": { "cols": 2, "headers": ["Başlık 1", "Başlık 2"], "rows": [["Değer 1", "Değer 2"]] } }
    ]`,
    'logic': `[
        { "type": "header", "content": { "text": "Mantık Sorularını Yanıtlayın" } },
        { "type": "logic_card", "content": { "data": [["A"]], "options": ["Seçenek 1"] } }
    ]`
};

export const generateAiWorksheetConverterFromAI = async (options: GeneratorOptions) => {
    // Eğer OCR ya da custom resim atılmışsa, görseli baz alırız
    let structuralPrompt = "";

    if (options.customInput) {
        structuralPrompt = `Ekli GÖRSEL'in tam olarak görsel mimarisini, soru tiplerini, grid ve formlarını çıkar ve aynısını oluştur. Eğer bu bir OCR görseliyse ve mimari veremiyorsan dahi görsele en uygun klasik sayfa tasarımını kur. Konu: ${options.concept || options.topic}`;
    } else {
        const variant = typeof options.variant === 'string' ? options.variant : 'cloze';
        structuralPrompt = TEMPLATES[variant] || TEMPLATES['cloze'];

        if (options.concept) {
            structuralPrompt = `KONU BAĞLAMI: ${options.concept}\nİstenilen Mimari:\n${structuralPrompt}`;
        }
    }

    return await generateFromRichPrompt(ActivityType.AI_WORKSHEET_CONVERTER, structuralPrompt, {
        ...options,
        // customInput'u isExactClone parametresini yönetmek veya image olarak paslamak için saklayabiliriz.
        // geminiClient zaten base64 gelirse prompt kısmına görseli ekler mi? 
        // Normalde \`generateCreativeMultimodal\` (newActivities içinde) text-only schema ile çalışıyor, 
        // ancak Oogmatik projesindeki gen-ai entegrasyonuna bakıldığında ek base64 verisi varsa bunu imageParts olarak eklediği varsayılabilir (eğer prompt destekliyorsa).
        // Eğer görsel aktarılmıyorsa görselden text çıkaran OCRScanner ekranı zaten text gönderiyor. 
        // Biz burada structuralPrompt içine text'i koyduk.
    });
};
