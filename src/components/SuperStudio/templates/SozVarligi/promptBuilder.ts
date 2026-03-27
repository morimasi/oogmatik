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
[DOLU DOLU A4 ÜRETIM KURALI — ZORUNLU]
- Üretilen içerik A4 beyaz kağıdın %95'İNİ doldurmalıdır. Boş alan bırakılmamalıdır.
- Kenar boşlukları: Üst 2cm, Alt 2cm, Sol 2.5cm, Sağ 2cm (minimum).
- İçerik yoğunluğu: Yoğun ama okunabilir — disleksi standardı (satır aralığı 1.6-1.8).
- GÖREV blokları arası geçiş görsel ayraçlarla (██▓▓██ gibi) yapılmalı.

[ZENGİN & VARIASYONLU İÇERİK KURALI — ZORUNLU]
- Her GÖREV içinde EN AZ 2 farklı alt-aktivite veya soru tipi bulunmalıdır.
- GÖREV 1'de: "Emoji Eşleştirme + Görsel Yorum + Açıklama" kombinasyonu
- GÖREV 2'de: "Senaryo Okuma + Deyim Seçimi + Bağlam Balonu" kombinasyonu
- GÖREV 3'te: "Cümle Kurma + Kelime Köprüsü + Eşleştirme" kombinasyonu
- GÖREV 4'te: "Mini Yarışma + Düşündürücü Soru + Arkadaşa Sor" kombinasyonu
- Görsel elementler: Deyim ikonu, bağlam balonu, kelime köprüsü diyagramı SVG.

[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 4 GÖREV yapısında kurgula:
- GÖREV 1 (Emojilerle Deyim Avı): Deyimleri SVG şekilleri veya zihinde canlandırılacak ikonlarla çözme. Görsel ikon + deyim açıklaması çifti sun.
- GÖREV 2 (Durum Senaryosu): Uzun bir duruma uygun deyimi buldurma. Bağlam balonu formatında senaryo sun.
- GÖREV 3 (Bağlam Kullanımı): Verilen deyim veya atasözü ile öğrencinin kendi yaratıcı cümlesini kurmasını isteme. Kelime köprüsü diyagramı ekle.
- GÖREV 4 (🏆 Aklımızda Kalacak): Öğrencinin arkadaşına sorabileceği 1 "Mini Yarışma Sorusu" veya akılda kalıcı bir "Tüyo" kutusu ekle.

[PAGINATION KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

[YANIT FORMATI]:
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
