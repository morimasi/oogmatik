import { IPromptBuilderContext } from '../registry';
import { HeceSesSettings } from './types';

export default function buildHeceSesPrompt(context: IPromptBuilderContext<HeceSesSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[HECE VE SES OLAYLARI - BILISSEL DIL BECERILERI]
Sen disleksi-fonolojik farkindalik uzmani bir dil ogretmenisin. "${topic}" konusu etrafinda, ses bilgisine odaklanan premium bir etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (SES OLAYLARI ODAĞI): Su olaylari kapsayan ${settings.wordCount} adet kelime sec: ${settings.focusEvents.join(', ')}.
- Kural 2 (ANLATIM): Ses olaylarini (Ornk: k -> g yumusamasi) basit ve somut orneklerle goster.
`;

    if (settings.syllableHighlight) {
        prompt += `
- Kural 3 (HECE GORSELLESTIRME): Kelimeleri hecelerine ayirirken koseli parantez kullan (Ornk: [Ki-tap-ci], [A-ra-ba]).
`;
    }

    if (settings.multisensorySupport) {
        prompt += `
- Kural 4 (ISITSEL VURGU): Kelimelerin icindeki ses olayinin gercekleshtigi veya vurgulanmasi gereken harfi BUYUK yaz (Ornk: kiTAbi - b harfinin p'den yumusadigini hissettir).
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
- GOREV 1'de: "Heceleme + Boyama + Eslestirme" kombinasyonu
- GOREV 2'de: "Kelime Turetime + Harf Sayma + Tablo" kombinasyonu
- GOREV 3'te: "Bosluk Doldurma + Renk Kodlama + Bulmaca" kombinasyonu
- GOREV 4'te: "Mini Test + Kelime Avi + Arkadasa Sor" kombinasyonu
- Kelime seçimlerinde varyasyon: Ayni hece sayisina sahip en az 3 farkli kelime kullan.
- Gorsel elementler: Her bolumde farkli tip SVG ikon veya sembol kullan.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Hecelerine Ayir): Verilen kelimelerin arasina tire "-" konarak hecelenmesi gorevi. Renk kodlu hece kutulari kullan (mavi-yesil-turuncu).
- GOREV 2 (Daginik Heceleri Topla): Karisik verilen hecelerden (Ornk: le-ma-ka) anlamli kelime (makale) turetime gorevi. Hece sayisi grafigi ekle.
- GOREV 3 (Eksik Hece Pesinde): Kelime icindeki bos birakilan (alt tire ile) veya hecesi eksik olan kismi bulma gorevi. Multisensory ikon ekle.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Hece ve Ses Olaylari",
  "content": "Fonolojik farkindalik ve heceleme dizeyindeki tüm egzersizleri iceren yuksek kaliteli Markdown blogunu buraya yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya."
}
Icerik pedagojik, net ve disleksi uyumlu olsun. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
