import { IPromptBuilderContext } from '../registry';
import { SozVarligiSettings } from './types';

export default function buildSozVarligiPrompt(context: IPromptBuilderContext<SozVarligiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[SÖZ VARLIĞI & ANLAM BİLGİSİ - ZİHİNSEL SÖZLÜK]
Sen çocukların kelime dağarcığını geliştiren uzman bir eğitimcisin. "${topic}" konusu etrafında, anlam bilgisine odaklanan premium bir etkinlik hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1 (İÇERİK SEÇİMİ): Şu kategorilerden ${settings.count} adet madde seç: ${settings.itemTypes.join(', ')}.
- Kural 2 (ANLAMLANDIRMA): Her maddenin anlamını çocuklara uygun, sade bir dille açıkla.
`;

    if (settings.visualAnalogy) {
        prompt += `
- Kural 3 (GÖRSEL BENZETME): Her deyim veya atasözü için, o durumu zihinde canlandıracak SİYAH BEYAZ, basit bir SVG ikon kodu üret (Örn: \`\`\`svg <svg...>\`\`\`).
`;
    }

    if (settings.contextualUsage) {
        prompt += `
- Kural 4 (BAĞLAMSAL ÖĞRENME): Her madde için bir boşluklu cümle kur ve öğrenciden o deyimi/atasözünü bu cümleye uygun şekilde yerleştirmesini iste.
`;
    }

    prompt += `
[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 3 GÖREV yapısında kurgula:
- GÖREV 1 (Emojilerle Deyim/Atasözü Avı): SVG vb görsel sembollerle deyimlerin anlamlarını tahmin ettirme.
- GÖREV 2 (Durum Senaryosu): "Ahmet çok acıkmış ve midesi..." gibi bir durum metni verip ona uygun deyimi buldurma.
- GÖREV 3 (Bağlam Kullanımı): Verilen deyim veya atasözü ile öğrencinin kendi yaratıcı cümlesini kurmasını isteme.

[ÇOKLU SAYFA (PAGINATION) KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

YANIT FORMATI:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Söz Varlığı Çalışması",
  "content": "Buraya tüm yönerge, çalışma soruları ve görsel analojileri içeren yüksek kaliteli Markdown bloğunu yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya."
}
İçerik zengin, öğretici ve eğlenceli olsun. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
