import { IPromptBuilderContext } from '../registry';
import { HeceSesSettings } from './types';

export default function buildHeceSesPrompt(context: IPromptBuilderContext<HeceSesSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[HECE VE SES OLAYLARI - BİLİŞSEL DİL BECERİLERİ]
Sen disleksi-fonolojik farkındalık uzmanı bir dil öğretmenisin. "${topic}" konusu etrafında, ses bilgisine odaklanan premium bir etkinlik hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1 (SES OLAYLARI ODAĞI): Şu olayları kapsayan ${settings.wordCount} adet kelime seç: ${settings.focusEvents.join(', ')}.
- Kural 2 (ANLATIM): Ses olaylarını (örn: k -> ğ yumuşaması) basit ve somut örneklerle göster.
`;

    if (settings.syllableHighlight) {
        prompt += `
- Kural 3 (HECE GÖRSELLEŞTİRME): Kelimeleri hecelerine ayırırken köşeli parantez kullan (Örn: [Ki-tap-çı], [A-ra-ba]).
`;
    }

    if (settings.multisensorySupport) {
        prompt += `
- Kural 4 (İŞİTSEL VURGU): Kelimelerin içindeki ses olayının gerçekleştiği veya vurgulanması gereken harfi BÜYÜK yaz (Örn: kiTAbı - b harfinin p'den yumuşadığını hissettir).
`;
    }

    prompt += `
YANIT FORMATI:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Hece ve Ses Olayları",
  "content": "Fonolojik farkındalık ve heceleme düzeyindeki tüm egzersizleri içeren yüksek kaliteli Markdown bloğunu buraya yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya."
}
İçerik pedagojik, net ve disleksi uyumlu olsun. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
