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
YANIT FORMATI:
Hiçbir JSON yapısı kullanma. Sadece yüksek kaliteli bir Markdown dökümanı döndür. Başlıkta mutlaka konuyu (${topic}) ve hedef harfleri belirt. # H1 Başlık ile başla.
`;

    return prompt;
}
