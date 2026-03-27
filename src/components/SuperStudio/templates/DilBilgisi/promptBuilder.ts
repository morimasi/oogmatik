import { IPromptBuilderContext } from '../registry';
import { DilBilgisiSettings } from './types';

export default function buildDilBilgisiPrompt(context: IPromptBuilderContext<DilBilgisiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;
    const [h1, h2] = settings.targetDistractors !== 'none' ? settings.targetDistractors.split('-') : ['', ''];

    let prompt = `
[DİL BİLGİSİ & HARF ALGISI - TYPO-HUNTER MİMARİSİ]
Sen özel eğitim alanında uzman, disleksi dostu içerikler üreten bir dil bilimcisin. "${topic}" konusu etrafında, harf farkındalığına odaklanan premium bir çalışma sayfası hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
`;

    if (settings.hintBox) {
        prompt += `
- Kural 1 (İPUCU KUTUSU): Sayfanın en başına, konuyu ve harf kuralını anlatan çerçeveli bir "Hatırlatma Kutusu" ekle.
`;
    }

    if (settings.targetDistractors !== 'none') {
        prompt += `
- Kural 2 (AYNA HARF ÇELDİRİCİLERİ): "${h1}" ve "${h2}" harflerinin karıştırılmasını önlemek için; bu harfleri içeren kelimelerden oluşan bir "Doğruyu Bulma" veya "Eksik Harfi Tamamlama" etkinliği kurgula. (Örn: b-d karıştırıyorsa, ba-da, bak-dak gibi kelime çiftlerini kullan).
`;
    }

    if (settings.syllableSimulation) {
        prompt += `
- Kural 3 (HECELEME MODU): Etkinlikteki TÜM kelimeleri hecelerine ayırarak yaz (Örn: [Ki-tap-lık], [He-ce-le-me]). Köşeli parantez kullanarak hece sınırlarını belirginleştir.
`;
    }

    if (settings.gridSize !== 'none' || settings.camouflageGrid) {
        const size = settings.gridSize !== 'none' ? settings.gridSize : '4x4';
        prompt += `
- Kural 4 (HARF AVI IZGARA SİSTEMİ): Metnin yanına veya altına ${size} boyutunda bir HTML/Markdown tablosu (Grid) oluştur. Bu tabloda gizli kelimeler veya hedef harfler (${settings.targetDistractors}) kamuflajlı bir şekilde dağılsın. Öğrenciden bu harfleri bulup boyamasını iste.
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
- GÖREV 1'de: "Şifre Çözme + Eşleştirme + Boyama" kombinasyonu
- GÖREV 2'de: "Kelime Treni + Tablo + Harf Analizi" kombinasyonu
- GÖREV 3'te: "Harf Avı + Grid + Boyama + Sayma" kombinasyonu
- GÖREV 4'te: "Mini Test + Kelime Avı + Arkadaşa Sor" kombinasyonu
- Hedef harfler için ▰▰▰ gibi blok göstergeleri ekle.
- Görsel elementler: Her bölümde farklı tip SVG ikon veya sembol kullan.

[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 4 GÖREV yapısında kurgula:
- GÖREV 1 (Şifre Çözücü): Ayna harflerle (b-d, p-q) yazılmış yanlış kelimelerin doğrusunu bulma etkinliği. Ayna harf kartları görseli ekle.
- GÖREV 2 (Kelime Treni): Son harfle başlayan yeni kelime türetme ama temaya uygun olanları. Harf timsali (karakter figürü) açıklaması ekle.
- GÖREV 3 (Harf Avı Grid): Verilen hedef harfleri 8x8 kamuflaj grid içinde bulup işaretlemelerini iste. Genişletilmiş tablo kullan.
- GÖREV 4 (🏆 Aklımızda Kalacak): Öğrencinin arkadaşına sorabileceği 1 "Mini Yarışma Sorusu" veya akılda kalıcı bir "Tüyo" kutusu ekle.

[PAGINATION KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

[YANIT FORMATI]:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Harf Farkındalığı Etkinliği",
  "content": "Buraya tüm yönerge, metin ve harf farkındalığı çalışmalarını içeren yüksek kaliteli Markdown bloğunu yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya."
}
Başlıkta konuyu (${topic}) ve hedef harfleri belirt. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
