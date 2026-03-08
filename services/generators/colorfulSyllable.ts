import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, ColorfulSyllableReadingData } from '../../types';

export const generateColorfulSyllableReading = async (options: GeneratorOptions): Promise<ColorfulSyllableReadingData> => {
    const difficulty = options.difficulty || 'orta';
    const topic = options.topic || 'Genel Doğa Hikayesi';
    const textLength = options.textLength || 'kısa';
    const wpmTarget = options.wpmTarget || 60;
    const highlightType = options.highlightType || 'syllables'; // syllables, vowels_only, words
    const colorPalette = options.colorPalette || 'red_blue';
    const student = options.studentContext;

    let lengthInstruction = 'Anaokulu / 1. Sınıf seviyesine uygun, çok kısa yaklaşık 20 kelimelik tek bir paragraf.';
    if (textLength === 'orta') lengthInstruction = 'İlkokul seviyesine uygun, toplamda yaklaşık 50 kelimelik 2 paragraf.';
    if (textLength === 'uzun') lengthInstruction = 'Daha akıcı okuyanlar için yaklaşık 80 kelimelik 3 paragraf.';

    let studentInstruction = '';
    if (student) {
        studentInstruction = `Lütfen metni ${student.age} yaşındaki, ${student.grade} sınıf öğrencisi (${student.learningStyle} öğrenme stiline sahip) ${student.name} isimli çocuk için özel olarak kurgulayın. Eğlenceli ve cesaretlendirici bir ton kullan.`;
    }

    const basePrompt = `
Sen Özel Eğitim (Disleksi) ve Okuma Hızı (WPM) uzmanı bir öğretmensin.
Öğrencinin okuma hızını (WPM Hedefi: ${wpmTarget} kelime/dakika) destekleyecek ve "Renkli Hece/Vurgulu Okuma" mantığına göre analiz edilmiş harika bir okuma metni (Hikaye/Bilgi) üreteceksin. 

ÖZEL İSTEKLER:
1. Konu: ${topic}
2. Uzunluk Tipi: ${textLength} (${lengthInstruction})
3. Zorluk: ${difficulty}
${studentInstruction}

GÖREV:
1. Belirlenen konu, zorluk ve uzunluğa uygun, yazım ve noktalama işaretleri kusursuz bir metin hazırla.
2. Bu metni paragraflara böl.
3. Her paragraf için, metindeki HER BİR KELİMEYİ (noktalama işaretleri dahil ederek) tek tek hecelerine veya vurgu parçalarına ayır. 
   - Not: "vowels_only" seçildiyse: harfleri ayır, sesli harfleri ayrı parçala.
   - "syllables" seçildiyse (Varsayılan): Türkçe heceleme kurallarına göre hecele (Örn: "araba" -> ["a", "ra", "ba"]).
   - "words" seçildiyse: kelimeyi tek parça bırak ["araba"].

AŞAĞIDAKİ JSON FORMATINDA DÖNÜŞ YAP (Başka hiçbir açıklama ekleme):

{
    "id": "color_syll",
    "activityType": "COLORFUL_SYLLABLE_READING",
    "title": "Renkli Hece Okuma - ${topic}",
    "settings": {
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "textLength": "${textLength}",
        "wpmTarget": ${wpmTarget},
        "colorPalette": "${colorPalette}",
        "highlightType": "${highlightType}"
    },
    "content": {
        "title": "Hikaye Başlığı",
        "paragraphs": [
            {
                "text": "Orijinal paragraf metni",
                "syllabified": [
                    {
                        "word": "OrijinalKelime",
                        "parts": ["O", "ri", "ji", "nal", "Ke", "li", "me"] // Vurgu türüne göre ayrılmış dizi
                    }
                ]
            }
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: basePrompt,
        temperature: 0.6, // Dilbilgisi tutarlılığı için biraz düşük tutulur
    });

    return parsedData as ColorfulSyllableReadingData;
}
