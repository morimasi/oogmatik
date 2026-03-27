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
[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 3 GÖREV yapısında kurgula:
- GÖREV 1 (Metni Restore Etme): Noktalaması veya yazımı tamamen bozulmuş bir paragraf verip altına doğrusunu yazmasını iste.
- GÖREV 2 (Senaryo Üretimi): "Çok şaşırdığın bir anı düşün ve sonuna uygun işareti koyarak yaz" gibi kendi cümlelerini kurdur.
- GÖREV 3 (Test/Çoktan Seçmeli): Hangisinde doğru kullanılmıştır tarzı 2 test sorusu veya doğru/yanlış eşleştirmesi.

[ÇOKLU SAYFA (PAGINATION) KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

YANIT FORMATI:
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
