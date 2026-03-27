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
YANIT FORMATI:
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
