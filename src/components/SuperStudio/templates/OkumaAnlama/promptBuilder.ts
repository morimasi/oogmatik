import { IPromptBuilderContext } from '../registry';
import { OkumaAnlamaSettings } from './types';

export default function buildOkumaAnlamaPrompt(context: IPromptBuilderContext<OkumaAnlamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[OKUMA ANLAMA - BİLİŞSEL DEKODER MİMARİSİ]
Sen disleksi ve DEHB uzmanı bir klinik öğretmensin. Aşağıdaki katı kurallara TAM OLARAK uyarak "${topic}" konulu bir okuma metni ve etkinlik üreteceksin.
${studentName ? `Bu etkinlik özel olarak "${studentName}" isimli öğrencinin seviyesine göre hazırlanmaktadır.` : ''}
Zorluk Seviyesi: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1: Dili çok sade tut. Sadece Etken (Active) cümle çatısı kullan. Mecaz, deyim veya dolaylı anlatım ASLA kullanma.
- Kural 2 (BİLİŞSEL YÜK LİMİTİ): HİÇBİR CÜMLE ${settings.cognitiveLoadLimit} kelimeden daha uzun OLAMAZ. Eğer uzun bir fikir varsa, nokta koyup ikiye böl. VEYA bağlacı kullanmak yerine yeni cümle kur.
`;

    if (settings.chunkingEnabled) {
        prompt += `
- Kural 3 (MODÜLER PARÇALAMA - CHUNKING): Düz bir metin bloku yazma. Metni küçük lokmalara böl. Her 2 cümlenin ardından "Bölüm Sorusu" diye bir başlık aç ve o iki cümleyle ilgili anında cevaplanacak 1 basit soru sor. Toplam ${settings.questionCount} bölüm (dolayısıyla ${settings.questionCount} soru) oluştur.
`;
    } else {
        prompt += `
- Kural 3: Normal bir metin oluştur ve en altına metnin tamamıyla ilgili ${settings.questionCount} adet soru listele.
`;
    }

    if (settings.visualScaffolding) {
        prompt += `
- Kural 4 (GÖRSEL DESTEK): Oluşturduğun her paragrafın veya bölümün başına o bölümün temasını çok net anlatan SİYAH BEYAZ, basit, disleksi dostu minik bir SVG kodu koy (Örn: \`\`\`svg <svg viewBox="0 0...>\`\`\`).
`;
    }

    if (settings.typographicHighlight) {
        prompt += `
- Kural 5 (KÖK-EK FARKINDALIĞI): Metin içindeki hareket veya duygu bildiren KÖK kelimeleri Markdown ile **kalın (bold)** yaz. Örnek: "**Gel**iyorum", "**Bak**tı". (Sadece kök kısmı kalın olmalı).
`;
    }

    prompt += `
- Kural 6 (5N1K ZİHİN HARİTASI): Etkinliğin en sonuna mutlaka bir "5N1K Tablosu" çiz (Markdown Grid formatında). Sütunlar: Soru, Cevap.

[KRİTİK ÜRETİM TALİMATI]
- Metin en az 3 paragraf ve 100-150 kelime arasında olmalıdır (ZPD uyumu için).
- Giriş, gelişme ve sonuç bölümleri net olmalıdır.
- Hikaye sonunda öğrencinin muhakeme yeteneğini ölçecek ${settings.questionCount} adet özgün soru üretilmelidir.
`;

    prompt += `
[DOLU DOLU A4 ÜRETIM KURALI — ZORUNLU]
- Üretilen içerik A4 beyaz kağıdın %95'İNİ doldurmalıdır. Boş alan bırakılmamalıdır.
- Kenar boşlukları: Üst 2cm, Alt 2cm, Sol 2.5cm, Sağ 2cm (minimum).
- İçerik yoğunluğu: Yoğun ama okunabilir — disleksi standardı (satır aralığı 1.6-1.8).
- GÖREV blokları arası geçiş görsel ayraçlarla (██▓▓██ gibi) yapılmalı.

[ZENGİN & VARIASYONLU İÇERİK KURALI — ZORUNLU]
- Her GÖREV içinde EN AZ 2 farklı alt-aktivite veya soru tipi bulunmalıdır.
- GÖREV 1'de: "Okuma + Anlama Soruları + Kelime Bulutu" kombinasyonu
- GÖREV 2'de: "Dedektiflik + 5N1K + Açık Uçlu Soru" kombinasyonu
- GÖREV 3'te: "5N1K Grid + Doğru/Yanlış + Tablo" kombinasyonu
- GÖREV 4'te: "Mini Yarışma + Düşündürücü Soru" kombinasyonu
- Paragraf chunking: Her 2-3 cümlede bir göz işareti SVG ikonu ekle (⟳ gibi).
- Metin içinde sesli okuma sembolü (🔇) kullan — disleksi okuma desteği için.

[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 4 GÖREV yapısında kurgula:
- GÖREV 1 (Okuma Parçası): Parçalı okuma (chunking) destekli, göz yormayan metin. Her paragraf arasına okuma hızı ipucu grafiği (⟳) koy.
- GÖREV 2 (Dedektiflik): Metne bilerek sızdırılmış 1 mantıksız/komik kelimeyi bulma. Bulgulanınca 5N1K ile analiz ettir.
- GÖREV 3 (5N1K Grid ve Doğru/Yanlış): Klasik anlama sorularının yanında yargı doğrulama. Tablo formatında sun.
- GÖREV 4 (🏆 Aklımızda Kalacak): Öğrencinin arkadaşına sorabileceği 1 "Mini Yarışma Sorusu" veya akılda kalıcı bir "Tüyo" kutusu ekle.

[PAGINATION KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

[YANIT FORMATI]:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Bilişsel Okuma Çalışması",
  "content": "Buraya tüm yönerge, okuma metni, sorular ve varsa SVG kodlarını içeren yüksek kaliteli Markdown bloğunu yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya. Hangi disleksi alt tipine (fonolojik, görsel-mekansal vb.) hitap edildiğini belirt."
}
Öğrenci için güvenli, okunaklı ve heyecan verici olsun. content alanındaki Markdown bloğuna dikkat çekici bir # H1 Başlık ile başla.
`;

    return prompt;
}
