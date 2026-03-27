import { IPromptBuilderContext } from '../registry';
import { SozVarligiSettings } from './types';

export default function buildSozVarligiPrompt(context: IPromptBuilderContext<SozVarligiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[SOZ VARLIGI VE ANLAM BILGISI - ZIHINSEL SOZLUK]
Sen çocuklarin kelime dacarcigini gelistiren uzman bir eğitimcisin. "${topic}" konusu etrafinda, anlam bilgisine odaklanan premium bir etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (ICERIK SECIMI): Su kategorilerden ${settings.count} adet madde sec: ${settings.itemTypes.join(', ')}.
- Kural 2 (ANLAMLANDIRMA): Her maddenin anlamini çocuklara uygun, sade bir dille acikla.
`;

    if (settings.visualAnalogy) {
        prompt += `
- Kural 3 (GORSEL BENZETME): Her deyim veya atasozu icin, o durumu zihinde canlandiracak SIYAH BEYAZ, basit bir SVG ikon kodu uret (Ornk: \`\`\`svg <svg...>\`\`\`).
`;
    }

    if (settings.contextualUsage) {
        prompt += `
- Kural 4 (BAGLAMSAL OGRENME): Her madde icin bir bosluklu cumle kur ve ogrenciden o deyimi/atasozunu bu cumleye uygun sekilde yerlestirmesini iste.
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
- GOREV 1'de: "Emoji Eslestirme + Gorsel Yorum + Aciklama" kombinasyonu
- GOREV 2'de: "Senaryo Okuma + Deyim Secimi + Baglam Balonu" kombinasyonu
- GOREV 3'te: "Cumle Kurma + Kelime Koprusu + Eslestirme" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor" kombinasyonu
- Gorsel elementler: Deyim ikonu, baglam balonu, kelime koprusu diyagrami SVG.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Emojilerle Deyim Avi): Deyimleri SVG sekilleri veya zihinde canlandirilacak ikonlarla cozme. Gorsel ikon + deyim aciklamasi cifti sun.
- GOREV 2 (Durum Senaryosu): Uzun bir duruma uygun deyimi buldurma. Baglam balonu formatinda senaryo sun.
- GOREV 3 (Baglam Kullanimi): Verilen deyim veya atasozu ile ogrencinin kendi yaratci cumlesini kurmasini isteme. Kelime koprusu diyagrami ekle.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Soz Varligi Calismasi",
  "content": "Buraya tum yonerge, calisma sorulari ve gorsel analogileri iceren yuksek kaliteli Markdown blogunu yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya."
}
Icerik zengin, ogretici ve eglenceli olsun. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
