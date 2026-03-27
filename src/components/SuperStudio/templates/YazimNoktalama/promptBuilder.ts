import { IPromptBuilderContext } from '../registry';
import { YazimNoktalamaSettings } from './types';

export default function buildYazimNoktalamaPrompt(context: IPromptBuilderContext<YazimNoktalamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YAZIM KURALLARI & NOKTALAMA - HATA DEDEKTİFİ]
Sen MEB müfredatına ve disleksi dostu eğitim materyallerine hakim bir dil uzmanısın. "${topic}" konusu etrafında, yazım ve noktalama becerilerini ölçen premium bir etkinlik hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1 (ODAKLANILACAK KURALLAR): Etkinliği şu yazım/noktalama kuralları çerçevesinde kur: ${settings.focusRules.join(', ')}.
- Kural 2 (EGZERSİZ): Toplamda ${settings.exerciseCount} adet cümle veya kısa paragraf oluştur.
`;

    if (settings.showRuleHint) {
        prompt += `
- Kural 3 (KURAL HATIRLATMA): Sayfanın başına veya etkinlik aralarına seçilen kuralları özetleyen (Örn: "Özel isimler büyük harfle başlar.") minimalist birer "Bilgi Notu" ekle.
`;
    }

    if (settings.errorCorrectionMode) {
        prompt += `
- Kural 4 (HATA DÜZELTME MODU): Cümleleri hatalı yaz (Örn: noktalama eksik, büyük harf yanlış) ve öğrenciden bu "Hata Dedektifi" olup hataları bulmasını ve doğrusunu alta yazmasını iste.
`;
    } else {
        prompt += `
- Kural 4 (UYGULAMA MODU): Cümleleri doğru ver ancak noktalama işaretlerinin veya büyük harflerin olduğu yerleri boş bırak ya da parantez aç.
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
- GÖREV 1'de: "Noktalama Düzeltme + Kural Açıklama + Cetvel" kombinasyonu
- GÖREV 2'de: "Senaryo Yazma + İşaret Koyma + Duygu İfadesi" kombinasyonu
- GÖREV 3'te: "Test + Eşleştirme + XOX Puanlama" kombinasyonu
- GÖREV 4'te: "Mini Yarışma + Düşündürücü Soru + Arkadaşa Sor" kombinasyonu
- Her etkinlik arasına "Kural Hatırlatıcı" mini kart ekle.
- Görsel elementler: Nokta dedektifi cetveli, XOX puanlama tablosu, kural kartları.

[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 4 GÖREV yapısında kurgula:
- GÖREV 1 (Bağlamsal Düzeltme): Noktalamasız metni düzeltme (Kural dedektifi). Nokta dedektifi cetveli görseli ekle.
- GÖREV 2 (Senaryo Üretimi): "Çok şaşırdığın bir anı düşün ve sonuna uygun işareti koyarak yaz" gibi kendi cümlelerini kurdur. Kural kartı ekle.
- GÖREV 3 (Test/Çoktan Seçmeli): Hangisinde doğru kullanılmıştır tarzı 2 test sorusu veya doğru/yanlış eşleştirmesi. XOX puanlama matrisi ekle.
- GÖREV 4 (🏆 Aklımızda Kalacak): Öğrencinin arkadaşına sorabileceği 1 "Mini Yarışma Sorusu" veya akılda kalıcı bir "Tüyo" kutusu ekle.

[PAGINATION KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

[YANIT FORMATI]:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Yazım ve Noktalama",
  "content": "Buraya tüm yönerge, çalışma soruları ve kural hatırlatıcıları içeren yüksek kaliteli Markdown bloğunu yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya."
}
Öğrenciyi teşvik eden bir dil kullan. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
