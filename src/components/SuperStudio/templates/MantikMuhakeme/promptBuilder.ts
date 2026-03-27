import { IPromptBuilderContext } from '../registry';
import { MantikMuhakemeSettings } from './types';

export default function buildMantikMuhakemePrompt(context: IPromptBuilderContext<MantikMuhakemeSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[MANTIK & MUHAKEME - SIRALAMA ALGORİTMASI]
Sen disleksi dostu eğitim materyallerinde uzman bir bilişsel gelişim uzmanısın. "${topic}" konusu etrafında, öğrencinin muhakeme yeteneğini zorlayan premium bir etkinlik hazırla.
${studentName ? `Öğrenci Adı: "${studentName}"` : ''}
Zorluk Seviyesi: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1 (ARDIŞIKLIK): "${topic}" konusuna uygun, ${settings.sequenceSteps} aşamalı bir olay örgüsü kurgula. Bu cümleleri karışık sırada ver (Örn: A, B, C, D harfleriyle). Öğrenciden bu olayları oluş sırasına göre numaralandırmasını (1, 2, 3...) iste.
`;

    if (settings.logicMatrix) {
        prompt += `
- Kural 2 (SÖZEL SUDOKU / MATRİS): "${topic}" ile ilgili ${settings.matrixSize} boyutunda bir Mantık Matrisi (Tablo) oluştur. Sözel ipuçları ver (Örn: "Ali kırmızıyı sevmez", "Mavi olan en sağdadır"). Öğrenciden bu ipuçlarından yola çıkarak tabloyu doldurmasını iste.
`;
    }

    if (settings.detailDetective) {
        prompt += `
- Kural 3 (DETAY DEDEKTİFLİĞİ): Konuya dair kısa bir paragraf yaz. Ancak bu paragrafın içine ustaca, 1 adet bariz mantık hatası veya kronolojik bir tutarsızlık gizle. Öğrenciden "Dedektif" olup bu hatayı bulup altını çizmesini iste.
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
- GÖREV 1'de: "Matris + İpucu Çözme + Tablo Doldurma" kombinasyonu
- GÖREV 2'de: "Nedensellik + Açık Uçlu + Düşündürücü Soru" kombinasyonu
- GÖREV 3'te: "Örüntü + Tamamlama + Sıralama" kombinasyonu
- GÖREV 4'te: "Mini Yarışma + Mantık Oyunu + Arkadaşa Sor" kombinasyonu
- Her soru için "Kolay ←→ Zor" derecesi göstergesi ekle.
- 3 kademeli ipucu sistemi: 1. ipucu → 2. ipucu → cevap şeklinde sun.
- Görsel elementler: Zaman çizelgesi (timeline) SVG, mantık derecesi slider göstergesi.

[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 4 GÖREV yapısında kurgula:
- GÖREV 1 (Sözel Matris/Sudoku): Mantıksal çıkarım gerektiren, tabloya dayalı bir ipucu bulmacası. Zaman çizelgesi SVG ekle.
- GÖREV 2 (Zıt Kutup Bağı): Olaylar arası nedensellik (Eğer A soğuksa, B nedir vb.) kurdurtan muhakeme soruları. Mantık derecesi göstergesi ekle.
- GÖREV 3 (Örüntü Tamamlama): Kavramsal veya olay sırası olarak boş bırakılan yerleri tamamlattırma. İpucu kademesi sistemi ekle.
- GÖREV 4 (🏆 Aklımızda Kalacak): Öğrencinin arkadaşına sorabileceği 1 "Mini Yarışma Sorusu" veya akılda kalıcı bir "Tüyo" kutusu ekle.

[PAGINATION KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

[YANIT FORMATI]:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Mantık ve Muhakeme",
  "content": "Etkinliğin tamamını (olay örgüsü, matris, dedektiflik sorusu) içeren zengin Markdown bloğunu buraya yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama (ZPD ve bilişsel hedef) buraya."
}
Etkinliği çocuk için bir macera gibi kurgula. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
