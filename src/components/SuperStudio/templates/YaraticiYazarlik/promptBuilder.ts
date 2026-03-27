import { IPromptBuilderContext } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export default function buildYaraticiYazarlikPrompt(context: IPromptBuilderContext<YaraticiYazarlikSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YARATICI YAZARLIK - OYUNLAŞTIRILMIŞ STÜDYO]
Sen çocukların hayal gücünü tetikleyen bir yazarlık koçusun. "${topic}" konusu etrafında, disleksi dostu bir yazma etkinliği kurgula.
${studentName ? `Öğrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJİK KURALLAR]
- Kural 1 (HİKAYE ZARLARI - STORY DICE): Konuya uygun ${settings.storyDiceCount} adet birbirinden bağımsız, basit SVG ikon kodu üret (Örn: Güneş, Köpek, Anahtar gibi). Öğrenciden bu ikonları kullanarak birleştiricilik yapmasını iste.
`;

    if (settings.clozeFormat !== 'none') {
        prompt += `
- Kural 2 (BOŞLUK DOLDURMA - CLOZE): Metnin içine ${settings.clozeFormat === 'fiil' ? 'fiilleri' : settings.clozeFormat === 'sifat' ? 'sıfatları' : 'rastgele her 5 kelimeden birini'} boş bırakarak yerleştir. Boşlukları "__________" şeklinde uzun çizgilerle belirt.
`;
    }

    if (settings.emotionRadar) {
        prompt += `
- Kural 3 (DUYGU RADARI): Yazma alanının yanına veya altına, karakterin o andaki hislerini (Mutlu, Üzgün, Korkmuş vb.) temsil eden basit SVG emojiler koy ve öğrenciden eşleştirme yapmasını iste.
`;
    }

    prompt += `
- Hedef: Öğrenciden toplamda en az ${settings.minSentences} cümle kurmasını bekle. Yazma alanını çizgili kağıt gibi Markdown bloklarıyla görselleştir.
`;

    prompt += `
YANIT FORMATI:
Yanıtını MUTLAKA geçerli bir JSON objesi olarak şu yapıda döndür:
{
  "title": "${topic} - Yazarlık Stüdyosu",
  "content": "Etkinliği, yönergeleri ve yazma alanını içeren zengin Markdown bloğunu buraya yaz.",
  "pedagogicalNote": "Öğretmene özel pedagojik açıklama buraya."
}
Etkinlik çocuk için eğlenceli ve cesaretlendirici olmalı. content alanındaki Markdown bloğuna # H1 Başlık ile başla.
`;

    return prompt;
}
