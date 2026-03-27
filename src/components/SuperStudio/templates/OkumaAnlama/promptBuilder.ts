import { IPromptBuilderContext } from '../registry';
import { OkumaAnlamaSettings } from './types';

export default function buildOkumaAnlamaPrompt(context: IPromptBuilderContext<OkumaAnlamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[OKUMA ANLAMA - BILISSEL DEKODER]
PROFIL: Disleksi ve DEHB uzmani, klinik ogretmen.
GOREV: "${topic}" konulu bir okuma metni ve etkinlik uret.
${studentName ? `Bu etkinlik ozel olarak "${studentName}" isimli ogrenci icindir.` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1: Dili cok sade tut. Sadece etken (active) cumle catisi kullan. Mecaz, deyim veya dolayli anlatim kullanma.
- Kural 2 (BILISSEL YUK LIMITI): HICBIR CUMLE ${settings.cognitiveLoadLimit} kelimeden daha uzun OLAMAZ. Uzun fikirleri nokta ile bol.
`;

    if (settings.chunkingEnabled) {
        prompt += `
- Kural 3 (MODULER PARCALAMA): Metni kucuk lokmalara bol. Her 2 cumlenin ardindan "Bolum Sorusi" basligi ac ve 1 basit soru sor. Toplam ${settings.questionCount} bolum olustur.
`;
    } else {
        prompt += `
- Kural 3: Normal metin olustur ve en altina ${settings.questionCount} adet soru ekle.
`;
    }

    if (settings.visualScaffolding) {
        prompt += `
- Kural 4 (GORSEL DESTEK): Her paragrafin basina kucuk bir SVG ikon koy.
`;
    }

    if (settings.typographicHighlight) {
        prompt += `
- Kural 5 (KOK-EK FARKINDALIGI): Metindeki kok kelimeleri **bold** yaz. Ornk: "**Gel**iyorum", "**Bak**ti". (Sadece kok kismi kalin olmali).
`;
    }

    prompt += `
- Kural 6 (5N1K): Etkinlik sonuna "5N1K Tablosu" ekle.

[KRITIK URETIM TALIMATI]
- Metin en az 3 paragraf ve 100-150 kelime olmali.
- Giris, gelisme, sonuc bolumleri net olmali.
- Hikaye sonunda ${settings.questionCount} adet ozgun soru ekle.
`;

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.
- Icerik yogun ama okunabilir olmali (satir araligi 1.6-1.8).

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Okuma + Anlama Sorulari + Kelime Bulutu"
- GOREV 2'de: "Dedektiflik + 5N1K + Acik Uclu Soru"
- GOREV 3'te: "5N1K Grid + Dogru/Yanlis + Tablo"
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru"
- Paragraf aralarina gozu isareti ikonu koy.

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Okuma Parçasi): Parcali okuma destekli metin.
- GOREV 2 (Dedektiflik): Metne gizlenmis 1 mantiksz kelimeyi buldur.
- GOREV 3 (5N1K Grid ve Dogru/Yanlis): Tablo formatinda sorular.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Bilissel Okuma Calismasi",
  "content": "Tum yonerge, metin, sorular ve SVG kodlarini iceren Markdown blogu.",
  "pedagogicalNote": "Ogretmene ozel pedagojik aciklama."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
