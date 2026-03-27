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
YANIT FORMATI:
Hiçbir JSON yapısı kullanma. Sadece yüksek kaliteli bir Markdown dökümanı döndür. # H1 Başlık ile başla.
`;

    return prompt;
}
