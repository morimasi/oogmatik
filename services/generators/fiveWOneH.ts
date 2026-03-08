import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, FiveWOneHData } from '../../types';

export const generateFiveWOneH = async (options: GeneratorOptions): Promise<FiveWOneHData> => {
    const difficulty = options.difficulty || 'orta';
    const topic = options.topic || 'Genel Çocuk Hikayesi';
    const textLength = options.textLength || 'kısa'; // kısa: 1 paragraf, orta: 2 paragraf, uzun: 3+
    const questionStyle = options.questionStyle || 'test_and_open'; // test_and_open, only_test, only_open_ended
    const student = options.studentContext;

    let lengthInstruction = '3-4 satırlık çok kısa tek bir paragraf olmalıdır.';
    if (textLength === 'orta') lengthInstruction = 'Yaklaşık 5-7 cümlelik 2 paragraftan oluşmalıdır.';
    if (textLength === 'uzun') lengthInstruction = 'Olay örgüsü daha karmaşık 3 paragraflık bir hikaye olmalıdır.';

    let studentInstruction = '';
    if (student) {
        studentInstruction = `Lütfen metni ${student.age} yaşındaki, ${student.grade} sınıf öğrencisi (${student.learningStyle} öğrenme stiline sahip) ${student.name} isimli çocuk için özel olarak kurgulayın. Eğlenceli ve kendisini ana karakterin yerine koyabileceği şekilde olsun.`;
    }

    const questionCount = 6; // 5N1K (6 adet)

    const basePrompt = `
Sen Özel Öğrenme Güçlüğü (Disleksi) uzmanı bir sınıf öğretmenisin.
Öğrencinin seviyesine ("${difficulty}") ve ilgisine ("${topic}") uygun, pedagojik olarak 5N1K (Ne, Nerede, Ne Zaman, Nasıl, Neden, Kim) okuma-anlama etkinliği hazırlayacaksın.

ÖZEL İSTEKLER:
1. Konu: ${topic}
2. Uzunluk: ${lengthInstruction}
${studentInstruction}

Görev 1: Hikayeyi yaz.
Görev 2: Hikaye ile birebir ilgili 5N1K metodolojisine uygun ${questionCount} adet soru hazırla. ("Kim, Ne, Nerede, Zaman, Nasıl, Neden"). Ek olarak 'inference' yani çıkarım (Ana Fikir/Düşünce) sorusu ekleyebilirsin.

Soru Tipi (Style): ${questionStyle === 'test_and_open' ? 'Hem şıklı hem açık uçlu sorular (karışık)' : questionStyle === 'only_test' ? 'Sadece 3 şıklı (A-B-C) test soruları' : 'Sadece doğrudan cevabın yazılacağı açık uçlu sorular'} olsun.

Lütfen çıktını AŞAĞIDAKİ JSON YAPISINDA ve GEÇERLİ BİR FORMATTA ver. (Markdown kullanma, sadece JSON dök).

{
    "id": "5n1k_unique_id",
    "activityType": "FIVE_W_ONE_H",
    "title": "Hikaye Başlığı",
    "settings": {
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "textLength": "${textLength}",
        "syllableColoring": ${!!options.syllableColoring},
        "fontFamily": "${options.fontFamily || 'Comic Sans MS'}",
        "questionStyle": "${questionStyle}"
    },
    "content": {
        "title": "Kısa Çarpıcı Bir Başlık",
        "text": "Tüm hikayenin düz metin hali. Paragraflara ayırmak için satır sonlarına \n\n bırakabilirsin",
        "paragraphs": ["Paragraf 1", "Paragraf 2"] 
    },
    "questions": [
        {
            "id": "q1",
            "type": "who",
            "questionText": "Soru metni (Örn: Ormana kem kim gitti?)",
            "answerType": "open_ended", // open_ended, multiple_choice, fill_in_the_blank
            "options": ["Şık 1 (Eğer soruda şık varsa)", "Şık 2"],
            "correctAnswer": "Doğru Cevabın Açık Hali"
        }
    ]
}`;

    const parsedData = await generateCreativeMultimodal({
        prompt: basePrompt,
        temperature: 0.7
    });

    return parsedData as FiveWOneHData;
}
