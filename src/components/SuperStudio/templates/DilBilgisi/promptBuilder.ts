import { IPromptBuilderContext } from '../registry';
import { DilBilgisiSettings } from './types';

export default function buildDilBilgisiPrompt(context: IPromptBuilderContext<DilBilgisiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;
    const [h1, h2] = settings.targetDistractors !== 'none' ? settings.targetDistractors.split('-') : ['', ''];

    let prompt = `
[DIL BILGISI VE HARF ALGISI - TYPO-HUNTER MIMARISI]
Sen ozel egitim alaninda uzman, disleksi dostu icerikler ureten bir dil bilimcisin. "${topic}" konusu etrafinda, harf farkindaligina odaklanan premium bir calisma sayfasi hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
`;

    if (settings.hintBox) {
        prompt += `
- Kural 1 (IPUCU KUTUSU): Sayfanin en basina, konuyu ve harf kuralini anlatan cerceveli bir "Hatirlatma Kutusu" ekle.
`;
    }

    if (settings.targetDistractors !== 'none') {
        prompt += `
- Kural 2 (AYNA HARF CELDIRICILERI): "${h1}" ve "${h2}" harflerinin karistirilmasini onlemek icin; bu harfleri iceren kelimelerden olusan bir "Dogruyu Bulma" veya "Eksik Harfi Tamamlama" etkinligi kurgula. (Ornk: b-d karistiriyorsa, ba-da, bak-dak gibi kelime ciftlerini kullan).
`;
    }

    if (settings.syllableSimulation) {
        prompt += `
- Kural 3 (HECELEME MODU): Etkinlikteki TUM kelimeleri hecelerine ayirarak yaz (Ornk: [Ki-tap-lik], [He-ce-le-me]). Koseli parantez kullanarak hece sinirlarini belirginlestir.
`;
    }

    if (settings.gridSize !== 'none' || settings.camouflageGrid) {
        const size = settings.gridSize !== 'none' ? settings.gridSize : '4x4';
        prompt += `
- Kural 4 (HARF AVI IZGARA SISTEMI): Metnin yanina veya altina ${size} boyutunda bir HTML/Markdown tablosu (Grid) olustur. Bu tabloda gizli kelimeler veya hedef harfler (${settings.targetDistractors}) kamuflajli bir sekilde dagilsin. Ogrenciden bu harfleri bulup boyamasini iste.
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
- GOREV 1'de: "Sifre Cozme + Eslestirme + Boyama" kombinasyonu
- GOREV 2'de: "Kelime Treni + Tablo + Harf Analizi" kombinasyonu
- GOREV 3'te: "Harf Avi + Grid + Boyama + Sayma" kombinasyonu
- GOREV 4'te: "Mini Test + Kelime Avi + Arkadasa Sor" kombinasyonu
- Hedef harfler icin blok göstergeleri ekle.
- Gorsel elementler: Her bolumde farkli tip SVG ikon veya sembol kullan.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Sifre Cozucu): Ayna harflerle (b-d, p-q) yazilmis yanlis kelimelerin dogolusunu bulma etkinligi. Ayna harf ktrlari gorseli ekle.
- GOREV 2 (Kelime Treni): Son harfle baslayan yeni kelime turetme ama temaya uygun olanlari. Harf timsali (karakter figuru) acklamsi ekle.
- GOREV 3 (Harf Avi Grid): Verilen hedef harfleri 8x8 kamuflaj grid icinde bulup isaretlemelerini iste. Genisletilmis tablo kullan.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Harf Farkindaligi Etkinligi",
  "content": "Buraya tum yonerge, metin ve harf farkindaligi calismalarini iceren yuksek kaliteli Markdown blogunu yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya."
}
Baslikta konuyu (${topic}) ve hedef harfleri belirt. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
