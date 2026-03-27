import { IPromptBuilderContext } from '../registry';
import { KelimeBilgisiSettings } from './types';

export default function buildKelimeBilgisiPrompt(context: IPromptBuilderContext<KelimeBilgisiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    const wordTypesText = settings.wordTypes.map(t => {
        switch (t) {
            case 'es-anlamli': return 'Es Anlamli Kelimeler';
            case 'zit-anlamli': return 'Zit Anlamli Kelimeler';
            case 'es-sesli': return 'Es Sesli Kelimeler';
            default: return t;
        }
    }).join(', ');

    let prompt = `
[KELIME BILGISI - SOZEL ZEKE ATOLYESI]
Sen kelime dacarcigi ve anlam bilgisi uzmani bir ozel egitim ogretmenisin. "${topic}" konusu etrafinda, "${wordTypesText}" becerilerini gelistiren premium bir etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (KELIME TURU ODAĞI): Su kelime turlerini icer: ${wordTypesText}.
- Kural 2 (DISLEKSI DOSTU): Kelimeleri buyuk punto ile yaz, Lexend font kullan, satir araligini 1.8 yap.
`;

    if (settings.aiSettings.includeExamples) {
        prompt += `
- Kural 3 (CUMLE ICINDE): Her kelime cifti/grubu icin en az 1 cumle icinde kullanım ornegi ver.
`;
    }

    if (settings.aiSettings.includeMnemonics) {
        prompt += `
- Kural 4 (AKILDA KALICI IPUCLARI): Her kelime icin hafiza ipucu veya kisaltma (mnemonik) ekle.
`;
    }

    if (settings.aiSettings.themeBased) {
        prompt += `
- Kural 5 (TEMATIK GRUPAMA): Kelimeleri tematik kategorilere ayir (Ornk: Duygular, Doga, Okul vb.).
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
- GOREV 1'de: "Eslestirme + Boyama + Tablo" kombinasyonu
- GOREV 2'de: "Bosluk Doldurma + Cumle Kurma + Renk Kodlama" kombinasyonu
- GOREV 3'te: "Kelime Avi + Bulmaca + Eslestirme" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor" kombinasyonu
- Gorsel elementler: Her bolumde farkli tip SVG ikon veya sembol kullan.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Kelime Cifti Bulma): Verilen ${settings.aiSettings.wordCount} adet kelime icin es/zit/es sesli kelime bulma. Eslestirme tablosu kullan. Renk kodlu kartlar (Mavi: Es Anlamli, Kirmizi: Zit Anlamli, Yesil: Es Sesli).
- GOREV 2 (Cumle Icinde Kullanim): Kelimeleri dogru baglama uygun cumlelerde kullanma. Bosluklu cumle etkinligi. Mnemonik ipucu kutusu ekle.
- GOREV 3 (Kelime Avi ve Bulmaca): Harf tablosu icinde gizli kelimeleri bulma. Tablo/izgara formatinda sun.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Kelime Bilgisi Calismasi",
  "content": "Buraya tum yonerge, kelime calismalari, sorular ve gorsel ogeleri iceren yuksek kaliteli Markdown blogunu yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya. Hangi kelime turune (es/zit/es sesli) odaklanildigini ve disleksi stratejilerini belirt."
}
Icerik zengin, ogretici ve eglenceli olsun. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
