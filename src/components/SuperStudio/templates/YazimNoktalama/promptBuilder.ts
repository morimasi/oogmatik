import { IPromptBuilderContext } from '../registry';
import { YazimNoktalamaSettings } from './types';

export default function buildYazimNoktalamaPrompt(context: IPromptBuilderContext<YazimNoktalamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YAZIM KURALLARI VE NOKTALAMA - HATA DEDEKTIFI]
Sen MEB mufredatina ve disleksi dostu eğitim materyallerine hakim bir dil uzmanisin. "${topic}" konusu etrafinda, yazim ve noktalama becerilerini olcen premium bir etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (ODAKLANILACAK KURALLAR): Etkinligi su yazim/noktalama kurallari cercevesinde kur: ${settings.focusRules.join(', ')}.
- Kural 2 (EGZERSIZ): Toplamda ${settings.exerciseCount} adet cumle veya kisa paragraf olustur.
`;

    if (settings.showRuleHint) {
        prompt += `
- Kural 3 (KURAL HATIRLATMA): Sayfanin basina veya etkinlik aralarina secilen kurallari ozetleyen (Ornk: "Ozel isimler buyuk harfle baslar.") minimalist birer "Bilgi Notu" ekle.
`;
    }

    if (settings.errorCorrectionMode) {
        prompt += `
- Kural 4 (HATA DUZELTME MODU): Cumleleri hatali yaz (Ornk: noktalama eksik, buyuk harf yanlis) ve ogrenciden bu "Hata Dedektifi" olup hatalari bulmasini ve dogulusunu alta yazmasini iste.
`;
    } else {
        prompt += `
- Kural 4 (UYGULAMA MODU): Cumleleri dogru ver ancak noktalama isaretlerinin veya buyuk harflerin oldugu yerleri bos birak ya da parantez ac.
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
- GOREV 1'de: "Noktalama Duzeltme + Kural Aciklamasi + Cetvel" kombinasyonu
- GOREV 2'de: "Senaryo Yazma + Isaret Koyma + Duygu Ifadesi" kombinasyonu
- GOREV 3'te: "Test + Eslestirme + XOX Puanlama" kombinasyonu
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor" kombinasyonu
- Her etkinlik aralarina "Kural Hatirlatici" mini karti ekle.
- Gorsel elementler: Nokta dedektifi cetveli, XOX puanlama tablosu, kural kartlari.

[COKLU BOLUM VE ZENGIN ICERIK YAPISI - ZORUNLU KURAL]
Bu etkinlik basit bir duz metin degil, "Kompakt ve Dolu Dolu Bir Calisma Kagidi" olmalidir. Ogrencinin doyurucu bir pratik yapmasi icin etkinligi asagidaki 4 GOREV yapisinda kurgula:
- GOREV 1 (Baglamsal Duzeltme): Noktalamsiz metni duzeltme (Kural dedektifi). Nokta dedektifi cetveli gorseli ekle.
- GOREV 2 (Senaryo Uretimi): "Çok sasirdigin bir ani dusun ve sonuna uygun isareti koyarak yaz" gibi kendi cumlelerini kurdur. Kural karti ekle.
- GOREV 3 (Test/Çoktan Secmeli): Hangisinde dogru kullanilmistir tarzi 2 test sorusu veya dogru/yanlis eslestirmesi. XOX puanlama matrisi ekle.
- GOREV 4 (Bonus - Akilda Kalacak): Ogrencinin arkadasina sorabilecegi 1 "Mini Yarisma Sorusi" veya akilda kalici bir "Tuyo" kutusu ekle.

[PAGINATION KURALI]
Eger urettigin toplam icerik hacmi bir A4 sayfasina (yaklasik 4 gorev blogu veya 250 kelime) sigmayacak kadar uzunsa, metnin uygun bir yerine tam olarak su ayraci yerlestirerek YENI SAYFA'ya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir cumle/gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Yanitini MUTLAKA gecerli bir JSON objesi olarak su yapida dondur:
{
  "title": "${topic} - Yazim ve Noktalama",
  "content": "Buraya tum yonerge, calisma sorulari ve kural hatirlatilari iceren yuksek kaliteli Markdown blogunu yaz.",
  "pedagogicalNote": "Ogretmene ozel pedagojik açiklama buraya."
}
Ogrenciyi tesvik eden bir dil kullan. content alanindaki Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
