import { IPromptBuilderContext } from '../registry';
import { YazimNoktalamaSettings } from './types';

export default function buildYazimNoktalamaPrompt(context: IPromptBuilderContext<YazimNoktalamaSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YAZIM VE NOKTALAMA - HATA DEDEKTIFI]
PROFIL: MEB müfredatina hakim, disleksi dostu eğitim uzmani.
GOREV: "${topic}" konusu etrafinda yazim ve noktalama becerilerini olcen premium etkinlik hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (KURALLAR): Su kurallari kullan: ${settings.focusRules.join(', ')}.
- Kural 2 (EGZERSIZ): ${settings.exerciseCount} adet cumle veya paragraf olustur.
`;

    if (settings.showRuleHint) {
        prompt += `
- Kural 3 (KURAL HATIRLATMA): Her etkinlik arasina bilgi notu ekle.
`;
    }

    if (settings.errorCorrectionMode) {
        prompt += `
- Kural 4 (HATA DUZELTME): Cumleleri hatali yaz ve ogrenciden duzeltmesini iste.
`;
    } else {
        prompt += `
- Kural 4 (UYGULAMA): Cumleleri dogru ver ancak noktalama isaretlerinin veya buyuk harflerin oldugu yerleri bos birak ya da parantez ac.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Noktalama Duzeltme + Kural Aciklamasi + Cetvel"
- GOREV 2'de: "Senaryo Yazma + Isaret Koyma + Duygu Ifadesi"
- GOREV 3'te: "Test + Eslestirme + XOX Puanlama"
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Sor"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Baglamsal Duzeltme): Noktalamsiz metni duzeltme.
- GOREV 2 (Senaryo Uretimi): Kendi cumlelerini kurma.
- GOREV 3 (Test): Dogru/yanlis veya coktan secmeli sorular.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Yazim ve Noktalama",
  "content": "Tum yonerge, calisma sorulari ve kurallar.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
