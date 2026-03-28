import { IPromptBuilderContext } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export default function buildYaraticiYazarlikPrompt(context: IPromptBuilderContext<YaraticiYazarlikSettings>): string {
    const { topic, difficulty, studentName, settings } = context;

    let prompt = `
[YARATICI YAZARLIK - OYUNLASTIRILMIS STUDYO]
PROFIL: Cocuklarin hayal gucunu tetikleyen yazarlik kocu.
GOREV: "${topic}" konusu etrafinda disleksi dostu yazma etkinligi kurgula.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
- Kural 1 (HIKAYE ZARLARI): Konuya uygun ${settings.storyDiceCount} adet basit SVG ikon kodu uret.
`;

    if (settings.clozeFormat !== 'none') {
        prompt += `
- Kural 2 (BOSLUK DOLDURMA): Metne ${settings.clozeFormat === 'fiil' ? 'fiilleri' : settings.clozeFormat === 'sifat' ? 'sifatlari' : 'rastgele her 5 kelimeden birini'} bos birak.
`;
    }

    if (settings.emotionRadar) {
        prompt += `
- Kural 3 (DUYGU RADARI): Karakterin hislerini gosteren SVG emojiler ekle.
`;
    }

    prompt += `
- Hedef: Ogrenciden en az ${settings.minSentences} cumle kurmasini bekle.

[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Rol Yapma + Duygu Haritasi + Karakter Yaratma"
- GOREV 2'de: "Kelime Kavanozu + Cumle Kurma + Hikaye Baslatma"
- GOREV 3'te: "SVG Zar + Ilustrasyon + Yazma Alani"
- GOREV 4'te: "Mini Yarisma + Dustundurucu Soru + Arkadasa Anlat"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Rol Yapma): Ogrenciyi farkli bir baglama sokan yaratici yazma isinmasi. Karakter karti ekle.
- GOREV 2 (Kelime Kavanozu): 5 kilit kelime kullanarak hikaye baslatma.
- GOREV 3 (Hikaye Zarlari): 3 adet gorsel zar ciz ve hikaye tamamlatma.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Yazarlik Stüdyosu",
  "content": "Etkinlik, yonergeler ve yazma alani.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
