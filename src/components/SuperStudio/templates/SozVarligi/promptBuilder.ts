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
YANIT FORMATI:
Sadece Markdown. JSON yasak. İçerik zengin, öğretici ve eğlenceli olsun. # H1 Başlık ile başla.
`;

    return prompt;
}
