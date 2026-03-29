import { IPromptBuilderContext } from '../registry';
import { SozVarligiSettings } from './types';

export default function buildSozVarligiPrompt(context: IPromptBuilderContext<SozVarligiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[SOZ VARLIGI VE ANLAM BILGISI - ZIHINSEL SOZLUK]
PROFIL: Cocuklarin kelime dacarcigini gelistiren uzman eğitimci.
GOREV: "${topic}" konusu etrafinda anlam bilgisine odaklanan premium etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (ICERIK): Su kategorilerden ${settings.count} adet madde sec: ${settings.itemTypes.join(', ')}.
- Kural 2 (ANLAMLANDIRMA): Her maddenin anlamini sade bir dille acikla.
`;

    if (settings.visualAnalogy) {
        prompt += `
- Kural 3 (GORSEL BENZETME): Her deyim veya atasozu icin basit SVG ikon kodu uret.
`;
    }

    if (settings.contextualUsage) {
        prompt += `
- Kural 4 (BAGLAMSAL OGRENME): Bosluklu cumleler kur ve deyim/atasozu yerlestirt.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Emoji Eslestirme + Gorsel Yorum + Aciklama"
- GOREV 2'de: "Senaryo Okuma + Deyim Secimi + Baglam Balonu"
- GOREV 3'te: "Cumle Kurma + Kelime Koprusu + Eslestirme"
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Emojilerle Deyim Avi): Deyimleri ikonlarla cozme.
- GOREV 2 (Durum Senaryosu): Uygun deyimi buldurma.
- GOREV 3 (Baglam Kullanimi): Deyimle yaratci cumle kurma.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Soz Varligi Calismasi",
  "content": "Tum yonerge, calisma sorulari ve gorsel analogiler.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
