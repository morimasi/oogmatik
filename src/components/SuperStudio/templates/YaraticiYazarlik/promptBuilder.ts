import { IPromptBuilderContext } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export default function buildYaraticiYazarlikPrompt(context: IPromptBuilderContext<YaraticiYazarlikSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YARATICI YAZARLIK - OYUNLASTIRILMIS STUDYO]
Sen çocuklarin hayal gucunu tetikleyen bir yazarlik kocusun. "${topic}" konusu etrafinda, disleksi dostu bir yazma etkinligi kurgula.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (HIKAYE ZARLARI - STORY DICE): Konuya uygun ${settings.storyDiceCount} adet birbirinden bagimsiz, basit SVG ikon kodu uret (Ornk: Gunes, Kopek, Anahtar gibi). Ogrenciden bu ikonlari kullanarak birlestiricilik yapmasini iste.
`;

    if (settings.clozeFormat !== 'none') {
        prompt += `
- Kural 2 (BOSLUK DOLDURMA - CLOZE): Metnin icine ${settings.clozeFormat === 'fiil' ? 'fiilleri' : settings.clozeFormat === 'sifat' ? 'sifatlari' : 'rastgele her 5 kelimeden birini'} bos birakarak yerlestir. Bosluklari "__________" seklinde uzun cizgilerle belirt.
`;
    }

    if (settings.emotionRadar) {
        prompt += `
- Kural 3 (DUYGU RADARI): Yazma alaninin yanina veya altina, karakterin o andaki hislerini (Mutlu, Uzgun, Korkmus vb.) temsil eden basit SVG emojiler koy ve ogrenciden eslestirme yapmasini iste.
`;
    }

    prompt += `
- Hedef: Ogrenciden toplamda en az ${settings.minSentences} cumle kurmasini bekle. Yazma alanini cizgili kagit gibi Markdown bloklariyla gorsellestir.

[DOLU DOLU A4 URETIM KURALI - ZORUNLU]
- Uretilen icerik A4 beyaz kagidin %95'INI doldurmalidir. Bos alan birakilmamalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm (minimum).
- Icerik yogunlugu: Yogun ama okunabilir - disleksi standardi (satir araligi 1.6-1.8).
- GOREV bloklari arasi gecis gorsel ayractlarla yapilmalidir.

[ZENGIN VE VARIYASYONLU ICERIK KURALI - ZORUNLU]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite veya soru tipi bulunmalidir.
- GOREV 1'de: "Rol Yapma + Duygu Haritasi + Karakter Yaratma" kombinasyonu
- GOREV 2'de: "Kelime Kavanozu + Cumle Kurma + Hikaye Baslatma" kombinasyonu
- GOREV 3'te: "SVG Zar + Ilustrasyon + Yazma Alani" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Anlat" kombinasyonu
- Her bolumde duygu termometresi veya karakter karti sablonu ekle.
- Kelime kavanozu icin 5 kilit kelimeyi sishe gorseli icinde sun.
- Gorsel elementler: Karakter karti, duygu termometresi, kelime kavanozu SVG.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Rol Yapma): Ogrenciyi farkli bir baglama sokan (Ornk. bir uzaylisin, bir dedektifsin) kucuk bir yaratrici yazma isinmasi. Karakter karti ve duygu termometresi ekle.
- GOREV 2 (Kelime Kavanozu): Yazilacak asil hikayede MUTLAKA kullanilmasi gereken 5 "kilit" kelimenin listesini ver ve bunlari kullanarak hikayeyi baslatmasini iste. Sishe gorseli ekle.
- GOREV 3 (Hikaye Zarlari): Siyah-beyaz, basit SVG ikonlarindan olusan 3 adet rastgele "Gorsel Zar" ciz. Ogrencinin bu zarlardaki sekillerden esinlenerek hikayesini bitirmesini iste.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Yazarlik Stüdyosu",
  "content": "Etkinligi, yonergeleri ve yazma alanini iceren zengin Markdown blogunu buraya yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya."
}
Etkinlik çocuk icin eglenceli ve cesaretlendirici olmali. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
