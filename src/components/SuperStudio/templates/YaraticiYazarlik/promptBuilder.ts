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
[ÇOKLU BÖLÜM VE ZENGİN İÇERİK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir düz metin değil, "Kompakt ve Dolu Dolu Bir Çalışma Kağıdı" olmalıdır. Öğrencinin doyurucu bir pratik yapması için etkinliği aşağıdaki 3 GÖREV yapısında kurgula:
- GÖREV 1 (Rol Yapma): Öğrenciyi farklı bir bağlama sokan (örn. bir uzaylısın, bir dedektifsin) küçük bir yaratıcı yazma ısınması.
- GÖREV 2 (Kelime Kavanozu): Yazılacak asıl hikayede MUTLAKA kullanılması gereken 5 "kilit" kelimenin listesini ver ve bunları kullanarak hikayeyi başlatmasını iste.
- GÖREV 3 (Hikaye Zarları): Siyah-beyaz, basit SVG ikonlarından oluşan 3 adet rastgele "Görsel Zar" çiz. Öğrencinin bu zarlardaki şekillerden esinlenerek hikayesini bitirmesini iste.

[ÇOKLU SAYFA (PAGINATION) KURALI]
Eğer ürettiğin toplam içerik hacmi bir A4 sayfasına (yaklaşık 4 görev bloğu veya 250 kelime) sığmayacak kadar uzunsa, metnin uygun bir yerine tam olarak şu ayracı yerleştirerek YENİ SAYFA'ya geç:
===SAYFA_SONU===
Ayracı kelime ortasında veya bitmemiş bir cümle/görev arasında KULLANMA. Hep ana bölümler arasına koy.

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
