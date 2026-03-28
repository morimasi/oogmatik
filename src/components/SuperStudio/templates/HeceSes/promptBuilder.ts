import { IPromptBuilderContext } from '../registry';
import { HeceSesSettings } from './types';

export default function buildHeceSesPrompt(context: IPromptBuilderContext<HeceSesSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[HECE VE SES OLAYLARI - BILISSEL DIL BECERILERI]
PROFIL: Disleksi-fonolojik farkindalik uzmani, dil ogretmeni.
GOREV: "${topic}" konusu etrafinda, ses bilgisine odaklanan premium etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (SES OLAYLARI): Su olaylari kapsayan ${settings.wordCount} adet kelime sec: ${settings.focusEvents.join(', ')}.
- Kural 2 (ANLATIM): Ses olaylarini basit ve somut orneklerle goster.
`;

    if (settings.syllableHighlight) {
        prompt += `
- Kural 3 (HECE GORSELLESTIRME): Kelimeleri hecelerine ayirirken koseli parantez kullan.
`;
    }

    if (settings.multisensorySupport) {
        prompt += `
- Kural 4 (ISITSEL VURGU): Hedef harfi BUYUK yaz.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.
- Icerik yogun ama okunabilir olmali.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Heceleme + Boyama + Eslestirme"
- GOREV 2'de: "Kelime Turetime + Harf Sayma + Tablo"
- GOREV 3'te: "Bosluk Doldurma + Renk Kodlama + Bulmaca"
- GOREV 4'te: "Mini Test + Kelime Avi + Arkadasa Sor"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Hecelerine Ayir): Kelimeleri hecelerine ayirma gorevi. Renk kodlu kutular kullan.
- GOREV 2 (Daginik Heceleri Topla): Karisik hecelerden anlamli kelime turetime.
- GOREV 3 (Eksik Hece Pesinde): Bos birakilan heceleri bulma.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Hece ve Ses Olaylari",
  "content": "Fonolojik farkindalik ve heceleme egzersizleri.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
