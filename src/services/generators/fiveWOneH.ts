import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, FiveWOneHData } from '../../types';

export const generateFiveWOneHFromAI = async (options: GeneratorOptions): Promise<FiveWOneHData> => {
    const difficulty = options.difficulty || 'orta';
    const topic = options.topic || 'Genel Çocuk Hikayesi';
    const textLength = options.textLength || 'kısa'; // kısa: 1 paragraf, orta: 2 paragraf, uzun: 3+
    const questionStyle = options.questionStyle || 'test_and_open'; // test_and_open, only_test, only_open_ended
    const student = options.studentContext;

    // Yaş grubuna göre dil ve uzunluk ayarları (ZPD Uyumu)
    const age = student?.age || 8;
    let lengthInstruction = '';
    let complexityInstruction = '';

    if (age <= 7) {
        lengthInstruction = textLength === 'kısa' ? '3-4 cümlelik tek paragraf' : '2 kısa paragraf';
        complexityInstruction = 'Somut kavramlar, basit cümle yapıları, bol betimleme. Soyut ifadelerden kaçınılmalı.';
    } else if (age <= 10) {
        lengthInstruction = textLength === 'kısa' ? '5-6 cümlelik tek paragraf' : '2 orta boy paragraf';
        complexityInstruction = 'Neden-sonuç ilişkileri, günlük hayattan durumlar, biraz daha geniş kelime dağarcığı.';
    } else {
        lengthInstruction = textLength === 'kısa' ? '8-10 cümlelik tek paragraf' : '3 paragraflık olay örgüsü';
        complexityInstruction = 'Soyut düşünme, çıkarım yapmaya uygun derinlik, karşılaştırmalı durumlar.';
    }

    let studentInstruction = '';
    if (student) {
        studentInstruction = `ÖZEL ÖĞRENCİ PROFİLİ: Bu metni ${age} yaşındaki, ${student.grade || 'bilinmeyen'} sınıf öğrencisi ${student.name} için kurgula. ${student.learningStyle || ''} öğrenme stiline uygun, ilgisini çekecek öğeler ekle.`;
    }

    const basePrompt = `
Sen Türk Özel Eğitim sistemi ve MEB müfredatına hakim, Disleksi ve DEHB uzmanı bir öğretmenisin (Elif Yıldız rolündesin).
Öğrencinin seviyesine ("${difficulty}") ve ilgi alanına ("${topic}") uygun, pedagojik değeri yüksek benzersiz bir 5N1K okuma-anlama etkinliği hazırlayacaksın.

KRİTİK KURALLAR:
1. BENZERSİZ KURGU: Klasik masalları (Kırmızı Başlıklı Kız vb.) kullanma. Özgün, karakter derinliği olan, günlük hayattan veya fantastik ama tutarlı yeni bir senaryo yaz.
2. ZPD UYUMU: Metin karmaşıklığı ${complexityInstruction} düzeyinde olmalı.
3. KONU VE UZUNLUK: Konu "${topic}" olsun. Uzunluk ${lengthInstruction} olmalı.
4. 5N1K SORULARI: Metinle tam uyumlu 6 soru (Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin) hazırla.
5. PEDAGOJİK NOT: Bu aktivitenin "${age}" yaşındaki bir çocuk için neden yararlı olduğunu, hangi bilişsel beceriyi (işlemleme hızı, görsel hafıza, çıkarım yapma vb.) desteklediğini açıklayan profesyonel bir "pedagogicalNote" ekle.
6. DİSLEKSİ DOSTU: Kelime seçimleri disleksi dostu olsun. Karıştırılabilecek harfleri (b-d, p-q vb.) çok yoğun kullanma veya dikkat çekici bir bağlamda sun.

SORU TİPLERİ: ${questionStyle === 'test_and_open' ? 'Karma (Şıklı ve Açık Uçlu)' : questionStyle === 'only_test' ? 'Sadece 3 Şıklı Test' : 'Sadece Açık Uçlu'}.

Lütfen çıktını AŞAĞIDAKİ JSON YAPISINDA ve GEÇERLİ BİR FORMATTA ver (Markdown kullanma).

{
    "id": "5n1k_${Date.now()}",
    "title": "Aktivite Başlığı",
    "instruction": "Metni dikkatle oku ve yanındaki/altındaki soruları cevapla.",
    "pedagogicalNote": "Burada öğretmen için teknik açıklama yer almalı...",
    "settings": {
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "textLength": "${textLength}",
        "syllableColoring": ${!!options.syllableColoring},
        "fontFamily": "${options.fontFamily || 'Lexend'}",
        "questionStyle": "${questionStyle}"
    },
    "content": {
        "title": "Hikaye Başlığı",
        "text": "Hikayenin tüm metni...",
        "paragraphs": ["Paragraf 1", "Paragraf 2"] 
    },
    "questions": [
        {
            "id": "q1",
            "type": "who",
            "questionText": "...",
            "answerType": "multiple_choice",
            "options": ["A) ...", "B) ...", "C) ..."],
            "correctAnswer": "..."
        }
    ]
}`;

    const parsedData = await generateCreativeMultimodal({
        prompt: basePrompt,
        temperature: 0.8 // Yaratıcılık için hafif artırıldı
    });

    return parsedData as FiveWOneHData;
}
