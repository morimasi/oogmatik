import { IPromptBuilderContext } from '../registry';
import { MantikMuhakemeSettings } from './types';

export default function buildMantikMuhakemePrompt(context: IPromptBuilderContext<MantikMuhakemeSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[MANTIK VE MUHAKEME - SIRALAMA ALGORITMASI]
PROFIL: Disleksi dostu eğitim materyalleri uzmani, bilissel gelisim ogment.
GOREV: "${topic}" konusu etrafinda, ogrencinin muhakeme yetenegini zorlayan premium etkinlik hazirla.
${studentName ? `Ogrenci Adi: "${studentName}"` : ''}
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
- Kural 3 (DETAY DEDEKTIFLIGI): Konuya dair kisa bir paragraf yaz. Bu paragrafin icine ustacea, 1 adet mantik hatasi veya kronolojik tutarsizlik gizle. Ogrenciden bu hatayi bulup altini cizmesini iste.
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
- 3 kademeli ipucu sistemi kullan: 1. ipucu, 2. ipucu, cevap.
- Gorsel elementler: Zaman cizelgesi (timeline) SVG, mantik derecesi göstergesi.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
BU OZEL BIR CALISMA KAGIDIDIR. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Sozel Matris Sudoku): Mantiksal cikarim gerektiren, tabloya dayali ipucu bulmacasi. Zaman cizelgesi SVG ekle.
- GOREV 2 (Zit Kutup Bagi): Olaylar arasi nedensellik (Ornk: A olayi gerceklesirse B sonucu ne olur) kurdurtan muhakeme sorulari. Mantik derecesi göstergesi ekle.
- GOREV 3 (Oruntu Tamamlama): Kavramsal veya olay sirasi olarak bos birakilan yerleri tamamlattirma. Ispucu kademesi sistemi ekle.
- GOREV 4 (Bonus): Ogrencinin arkadasina sorabilecegi 1 mini yarisma sorusi veya akilda kalici bir tuyo kutusu ekle.

[PAGINATION KURALI]
ICERIK COK UZUN OLURSA, uygun bir yere su ayraci koyarak YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti cumle ortasinda kullanma. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini gecerli JSON olarak su yapida dondur:
{
  "title": "${topic} - Mantik ve Muhakeme",
  "content": "Etkinligin tamamini iceren zengin Markdown blogunu buraya yaz.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Content alanina # H1 Baslik ile basla.
`;

    return prompt;
}
