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
PROFIL: Kelime dacarcigi ve anlam bilgisi uzmani, ozel egitim ogretmeni.
GOREV: "${topic}" konusu etrafinda, "${wordTypesText}" becerilerini gelistiren premium etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (KELIME TURU): Su kelime turlerini icer: ${wordTypesText}.
- Kural 2 (DISLEKSI DOSTU): Kelimeleri buyuk punto ile yaz, Lexend font kullan, satir araligini 1.8 yap.
`;

    if (settings.aiSettings.includeExamples) {
        prompt += `
- Kural 3 (CUMLE ICINDE): Her kelime cifti icin en az 1 cumle icinde kullanım ornegi ver.
`;
    }

    if (settings.aiSettings.includeMnemonics) {
        prompt += `
- Kural 4 (HAFIZA IPUCLARI): Her kelime icin akilda kalici ipucu veya kisaltma ekle.
`;
    }

    if (settings.aiSettings.themeBased) {
        prompt += `
- Kural 5 (TEMATIK GRUPAMA): Kelimeleri tematik kategorilere ayir.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.
- Icerik yogun ama okunabilir olmali.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Eslestirme + Boyama + Tablo"
- GOREV 2'de: "Bosluk Doldurma + Cumle Kurma + Renk Kodlama"
- GOREV 3'te: "Kelime Avi + Bulmaca + Eslestirme"
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Kelime Cifti Bulma): ${settings.aiSettings.wordCount} adet kelime icin es/zit/es sesli bulma. Renk kodlu kartlar kullan.
- GOREV 2 (Cumle Icinde Kullanim): Kelimeleri cumlelerde kullanma.
- GOREV 3 (Kelime Avi ve Bulmaca): Harf tablosunda gizli kelimeleri bulma.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Kelime Bilgisi Calismasi",
  "content": "Tum yonerge, kelime calismalari, sorular ve gorsel ogeler.",
  "pedagogicalNote": "Ogretmene ozel pedagojik aciklama."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
