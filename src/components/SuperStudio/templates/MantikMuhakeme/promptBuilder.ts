import { IPromptBuilderContext } from '../registry';
import { MantikMuhakemeSettings } from './types';

export default function buildMantikMuhakemePrompt(context: IPromptBuilderContext<MantikMuhakemeSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[MANTIK VE MUHAKEME - SIRALAMA ALGORITMASI]
Sen disleksi dostu eğitim materyallerinde uzman bir bilişsel gelişim uzmanısın. "${topic}" konusu etrafında, öğrencinin muhakeme yeteneğini zorlayan premium bir etkinlik hazirla.
${studentName ? `Öğrenci Adi: "${studentName}"` : ''}
Zorluk Seviyesi: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (ARDISIKLIK): "${topic}" konusuna uygun, ${settings.sequenceSteps} asamali bir olay orgusu kurgula. Bu cumleleri karisik sirada ver (Ornk: A, B, C, D harfleriyle). Ogrenciden bu olaylari olus sirasina gore numaralandirmasini (1, 2, 3...) iste.
`;

    if (settings.logicMatrix) {
        prompt += `
- Kural 2 (SOZEL SUDOKU / MATRIS): "${topic}" ile ilgili ${settings.matrixSize} boyutunda bir Mantik Matrisi (Tablo) olustur. Sozel ipuclari ver (Ornk: "Ali kirmiziyi sevmez", "Mavi olan en sagdadir"). Ogrenciden bu ipuclarindan yola cikarak tabloyu doldurmasini iste.
`;
    }

    if (settings.detailDetective) {
        prompt += `
- Kural 3 (DETAY DEDEKTIFLIGI): Konuya dair kisa bir paragraf yaz. Ancak bu paragrafin icine ustacea, 1 adet bariz mantik hatasi veya kronolojik bir tutarsizlik gizle. Ogrenciden "Dedektif" olup bu hatayi bulup altini cizmesini iste.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI - ZORUNLU]
- Uretilen icerik A4 beyaz kagidin %95'INI doldurmalidir. Bos alan birakilmamalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm (minimum).
- Icerik yogunlugu: Yogun ama okunabilir - disleksi standardi (satir araligi 1.6-1.8).
- GOREV bloklari arasi gecis gorsel ayractlarla yapilmalidir.

[ZENGIN VE VARIYASYONLU ICERIK KURALI - ZORUNLU]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite veya soru tipi bulunmalidir.
- GOREV 1'de: "Matris + Ispucu Cozme + Tablo Doldurma" kombinasyonu
- GOREV 2'de: "Nedensellik + Acik Uclu + Dustundurucu Soru" kombinasyonu
- GOREV 3'te: "Oruntu + Tamamlama + Siralama" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Mantik Oyunu + Arkadasa Sor" kombinasyonu
- Her soru icin "Kolay" ile "Zor" arasinda derece göstergesi ekle.
- 3 kademeli ipucu sistemi: 1. ipucu, 2. ipucu, cevap seklinde sun.
- Gorsel elementler: Zaman cizelgesi (timeline) SVG, mantik derecesi göstergesi.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Sozel Matris/Sudoku): Mantiksal cikarim gerektiren, tabloya dayali bir ipucu bulmacasi. Zaman cizelgesi SVG ekle.
- GOREV 2 (Zit Kutup Bagi): Olaylar arasi nedensellik (Ornk: A olayi gerceklesirse B sonucu ne olur) kurdurtan muhakeme sorulari. Mantik derecesi göstergesi ekle.
- GOREV 3 (Oruntu Tamamlama): Kavramsal veya olay sirasi olarak bos birakilan yerleri tamamlattirma. Ispucu kademesi sistemi ekle.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Mantik ve Muhakeme",
  "content": "Etkinligin tamamini (olay orgusu, matris, dedektiflik sorusu) iceren zengin Markdown blogunu buraya yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama (ZPD ve bilissel hedef) buraya."
}
Etkinligi cocuk icin bir macera gibi kurgula. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
