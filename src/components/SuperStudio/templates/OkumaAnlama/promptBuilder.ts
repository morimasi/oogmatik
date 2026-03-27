import { IPromptBuilderContext } from '../registry';
import { OkumaAnlamaSettings } from './types';

export default function buildOkumaAnlamaPrompt(context: IPromptBuilderContext<OkumaAnlamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[OKUMA ANLAMA - BILISSEL DEKODER MIMARISI]
Sen disleksi ve DEHB uzmani bir klinik ogretmenisin. Asagidaki kati kurallara TAM OLARAK uyarak "${topic}" konulu bir okuma metni ve etkinlik ureteceksin.
${studentName ? `Bu etkinlik ozel olarak "${studentName}" isimli ogrencinin seviyesine gore hazirlanmaktadir.` : ''}
Zorluk Seviyesi: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1: Dili cok sade tut. Sadece Etken (Active) cumle catisi kullan. Mecaz, deyim veya dolayli anlatim ASLA kullanma.
- Kural 2 (BILISSEL YUK LIMITI): HICBIR CUMLE ${settings.cognitiveLoadLimit} kelimeden daha uzun OLAMAZ. Eger uzun bir fikir varsa, nokta koyup ikive bol. VEYA baglaci kullanmak yerine yeni cumle kur.
`;

    if (settings.chunkingEnabled) {
        prompt += `
- Kural 3 (MODULER PARCALAMA - CHUNKING): Duz bir metin bloku yazma. Metni kucuk lokmalara bol. Her 2 cumlenin ardindan "Bolum Sorusi" diye bir baslik ac ve o iki cumleyle ilgili aninda cevaplanacak 1 basit soru sor. Toplam ${settings.questionCount} bolum (dolayisiyla ${settings.questionCount} soru) olustur.
`;
    } else {
        prompt += `
- Kural 3: Normal bir metin olustur ve en altina metnin tamamiyla ilgili ${settings.questionCount} adet soru listele.
`;
    }

    if (settings.visualScaffolding) {
        prompt += `
- Kural 4 (GORSEL DESTEK): Olusturdugun her paragrafin veya bolumun basina o bolumun temasini cok net anlatan SIYAH BEYAZ, basit, disleksi dostu minik bir SVG kodu koy (Ornk: \`\`\`svg <svg viewBox="0 0...>\`\`\`).
`;
    }

    if (settings.typographicHighlight) {
        prompt += `
- Kural 5 (KOK-EK FARKINDALIGI): Metin icindeki hareket veya duygu bildiren KOK kelimeleri Markdown ile **kalin (bold)** yaz. Ornk: "**Gel**iyorum", "**Bak**ti". (Sadece kok kismi kalin olmali).
`;
    }

    prompt += `
- Kural 6 (5N1K ZIHIN HARITASI): Etkinligin en sonuna mutlaka bir "5N1K Tablosu" ciz (Markdown Grid formatinda). Sutunlar: Soru, Cevap.

[KRITIK URETIM TALIMATI]
- Metin en az 3 paragraf ve 100-150 kelime arasinda olmalidir (ZPD uyumu icin).
- Giris, gelisme ve sonuc bolumleri net olmalidir.
- Hikaye sonunda ogrencinin muhakeme yetenegini olcecek ${settings.questionCount} adet ozgun soru uretilmelidir.
`;

    prompt += `
[DOLU DOLU A4 URETIM KURALI - ZORUNLU]
- Uretilen icerik A4 beyaz kagidin %95'INI doldurmalidir. Bos alan birakilmamalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm (minimum).
- Icerik yogunlugu: Yogun ama okunabilir - disleksi standardi (satir araligi 1.6-1.8).
- GOREV bloklari arasi gecis gorsel ayractlarla yapilmalidir.

[ZENGIN VE VARIYASYONLU ICERIK KURALI - ZORUNLU]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite veya soru tipi bulunmalidir.
- GOREV 1'de: "Okuma + Anlama Sorulari + Kelime Bulutu" kombinasyonu
- GOREV 2'de: "Dedektiflik + 5N1K + Acik Uclu Soru" kombinasyonu
- GOREV 3'te: "5N1K Grid + Dogru/Yanlis + Tablo" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru" kombinasyonu
- Paragraf chunking: Her 2-3 cumlede bir gozu isareti SVG ikonu ekle.
- Metin icinde sessiz okuma sembolu kullan - disleksi okuma destegi icin.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Okuma Parçasi): Parçali okuma (chunking) destekli, gozu yormayan metin. Her paragraf aralarina okuma hizi ipucu grafigi koy.
- GOREV 2 (Dedektiflik): Metne bilerek sizdirilmis 1 mantiksz/komik kelimeyi bulma. Bulgulaninca 5N1K ile analiz ettir.
- GOREV 3 (5N1K Grid ve Dogru/Yanlis): Klasik anlama sorularinin yaninda yargi dogrulama. Tablo formatinda sun.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Bilissel Okuma Calismasi",
  "content": "Buraya tum yonerge, okuma metni, sorular ve varsa SVG kodlarini iceren yuksek kaliteli Markdown blogunu yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya. Hangi disleksi alt tipine (fonolojik, gorsel-mekansal vb.) hitap edildigini belirt."
}
Ogrenci icin guvenli, okunakli ve heyecan verici olsun. content alanindaki Markdown bloguna dikkat cekici bir # H1 Baslik ile basla.
`;

    return prompt;
}
