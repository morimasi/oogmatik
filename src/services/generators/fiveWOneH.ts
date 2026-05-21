import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, FiveWOneHData } from '../../types';

export const generateFiveWOneHFromAI = async (options: GeneratorOptions): Promise<FiveWOneHData> => {
    const difficulty = options.difficulty || '7-8';
    const topic = options.topic || 'Genel Çocuk Hikayesi';
    const textLength = options.textLength || 'kısa'; // kısa: 1 paragraf, orta: 2 paragraf, uzun: 3+
    const questionStyle = options.questionStyle || 'test_and_open'; // test_and_open, only_test, only_open_ended
    const student = options.studentContext;
    const classLevel = Number(options.classLevel) || (typeof student?.grade === 'number' ? student.grade : 8);
    const generationMode = options.generationMode || 'ai';
    const premiumMode = options.premiumMode ?? false;

    const gradeLabel = `${classLevel}. Sınıf`;
    let lengthInstruction = '';
    let complexityInstruction = '';
    let gradeDescription = '';

    if (classLevel <= 2) {
        gradeDescription = '1-2. sınıf düzeyinde, kısa ve somut olay örgüsü';
        lengthInstruction = textLength === 'kısa' ? '4-5 cümlelik tek paragraf' : '2 kısa paragraf';
        complexityInstruction = 'Basit cümle yapıları, somut öğeler, net sonuç ve sık kullanılan sözcükler.';
    } else if (classLevel <= 4) {
        gradeDescription = '3-4. sınıf düzeyinde, günlük yaşama yakın bir kısa hikaye';
        lengthInstruction = textLength === 'kısa' ? '5-7 cümlelik tek paragraf' : '2 orta uzunlukta paragraf';
        complexityInstruction = 'Neden-sonuç ilişkisi içeren, somut örneklerle desteklenen metinler; kelime haznesi zengin fakat kolay okunur.';
    } else if (classLevel <= 6) {
        gradeDescription = '5-6. sınıf düzeyinde, orta düzey dil ve mantık içeren anlatım';
        lengthInstruction = textLength === 'kısa' ? '8-10 cümlelik tek paragraf' : '2-3 paragraflık hikaye';
        complexityInstruction = 'Çıkarımsal sorulara izin veren kelime haznesi, sebep-sonuç ve karşılaştırmalı ifadeler içerir.';
    } else {
        gradeDescription = '7-8. sınıf düzeyinde, daha olgun konulara ve kritik düşünmeye izin veren yapı';
        lengthInstruction = textLength === 'kısa' ? '10-12 cümlelik tek paragraf' : '3 paragraflık olay örgüsü';
        complexityInstruction = 'Soyut düşünme, anlatım bağlantıları ve mantık zinciri; detaylı 5N1K soruları için yeterli derinlik.';
    }

    let studentInstruction = '';
    if (student) {
        studentInstruction = `ÖZEL ÖĞRENCİ PROFİLİ: Bu metni ${(student as unknown as unknown as unknown as Record<string, unknown>).age || 'bilinmeyen'} yaşındaki, ${student.grade || 'bilinmeyen'} sınıf öğrencisi ${student.name} için kurgula. ${(student as unknown as unknown as unknown as Record<string, unknown>).learningStyle || ''} öğrenme stiline uygun, ilgisini çekecek öğeler ekle.`;
    }

    const basePrompt = `
Sen Türk Özel Eğitim sistemi ve MEB müfredatına hakim, Disleksi ve DEHB uzmanı bir öğretmenisin (Elif Yıldız rolündesin).
Öğrenci için gerçek sınıf seviyesine göre düzenlenmiş 5N1K etkinliği hazırla: "${gradeLabel}".
Seviye açıklaması: ${gradeDescription}.
Bu metni "${topic}" temasıyla ilişkilendir ve pedagojik açıdan "${difficulty}" olarak etiketle.

KRİTİK KURALLAR:
1. BENZERSİZ KURGU: Klasik masalları (Kırmızı Başlıklı Kız vb.) kullanma. Özgün, karakter derinliği olan, günlük hayattan veya fantastik ama tutarlı yeni bir senaryo yaz.
2. ZPD UYUMU: Metin karmaşıklığı ${complexityInstruction} düzeyinde olmalı.
3. KONU VE UZUNLUK: Konu "${topic}" olsun. Uzunluk ${lengthInstruction} olmalı.
4. 5N1K SORULARI: Metinle tam uyumlu 6 soru (Kim, Ne, Nerede, Ne Zaman, Nasıl, Niçin) hazırla.
5. DİSLEKSİ DOSTU: Kelime seçimleri disleksi dostu olsun. Karıştırılabilecek harfleri (b-d, p-q vb.) çok yoğun kullanma veya dikkat çekici bir bağlamda sun.
6. ${premiumMode ? 'PREMIUM TASARIM: Renk kodlu 5N1K kutuları, ekstra dikkat çekici ipuçları ve üst düzey öğretim sinyalleri kullan.' : 'Standart tasarım: temiz, odaklanılabilir ve pedagojik açıdan net.'}

Üretim modu: ${generationMode === 'fast' ? 'Hızlı' : 'AI Modu'}.

SORU TİPLERİ: ${questionStyle === 'test_and_open' ? 'Karma (Şıklı ve Açık Uçlu)' : questionStyle === 'only_test' ? 'Sadece 3 Şıklı Test' : 'Sadece Açık Uçlu'}.

Lütfen çıktını AŞAĞIDAKİ JSON YAPISINDA ve GEÇERLİ BİR FORMATTA ver (Markdown kullanma).

{
    "id": "5n1k_${Date.now()}",
    "title": "Aktivite Başlığı",
    "instruction": "Metni dikkatle oku ve yanındaki/altındaki soruları cevapla.",
    "settings": {
        "difficulty": "${difficulty}",
        "gradeLevel": "${gradeLabel}",
        "mode": "${generationMode}",
        "premiumMode": ${premiumMode},
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
        temperature: generationMode === 'fast' ? 0.35 : 0.8,
        thinkingBudget: generationMode === 'fast' ? 0 : 40
    });

    return parsedData as unknown as FiveWOneHData;
}
