import { IPromptBuilderContext } from '../registry';
import { DilBilgisiSettings } from './types';

export default function buildDilBilgisiPrompt(context: IPromptBuilderContext<DilBilgisiSettings>): string {
    const { topic, difficulty, studentName, settings } = context;
    const [h1, h2] = settings.targetDistractors !== 'none' ? settings.targetDistractors.split('-') : ['', ''];

    let prompt = `
[DIL BILGISI VE HARF ALGISI - TYPO-HUNTER]
PROFIL: Ozel egitim uzmani, disleksi dostu icerikler ureten dil bilimcisi.
GOREV: "${topic}" konusu etrafinda, harf farkindaligina odaklanan premium calisma sayfasi hazirla.
${studentName ? `Ogrenci: "${studentName}"` : ''}
Zorluk: ${difficulty}

[KATI PEDAGOJIK KURALLAR]
`;

    if (settings.hintBox) {
        prompt += `
- Kural 1 (IPUCU KUTUSU): Sayfanin basina konuyu ve harf kuralini anlatan hatirlatma kutusu ekle.
`;
    }

    if (settings.targetDistractors !== 'none') {
        prompt += `
- Kural 2 (AYNA HARFLER): "${h1}" ve "${h2}" harflerinin karistirilmasini onlemek icin etkinlik kurgula.
`;
    }

    if (settings.syllableSimulation) {
        prompt += `
- Kural 3 (HECELEME): Tum kelimeleri hecelerine ayirarak yaz. Koseli parantez kullanarak hece sinirlarini belirginlestir (Ornk: [Ki-tap-lik]).
`;
    }

    if (settings.gridSize !== 'none' || settings.camouflageGrid) {
        const size = settings.gridSize !== 'none' ? settings.gridSize : '4x4';
        prompt += `
- Kural 4 (HARF AVI IZGARA): ${size} boyutunda tablo olustur ve hedef harfleri gizle.
`;
    }

    prompt += `
[DOLU DOLU A4 URETIM KURALI]
- Uretilen icerik A4 kagidin %95'INI doldurmalidir.
- Kenar bosluklari: Ust 2cm, Alt 2cm, Sol 2.5cm, Sag 2cm.

[ZENGIN ICERIK KURALI]
- Her GOREV icinde EN AZ 2 farkli alt-aktivite bulunmalidir.
- GOREV 1'de: "Sifre Cozme + Eslestirme + Boyama"
- GOREV 2'de: "Kelime Treni + Tablo + Harf Analizi"
- GOREV 3'te: "Harf Avi + Grid + Boyama + Sayma"
- GOREV 4'te: "Mini Test + Kelime Avi + Arkadasa Sor"

[CALISMA KAGIDI YAPISI - ZORUNLU]
4 GOREV yapisi kullan:
- GOREV 1 (Sifre Cozucu): Ayna harflerle yazilmis kelimelerin dogolusu.
- GOREV 2 (Kelime Treni): Son harfle baslayan kelime turetime.
- GOREV 3 (Harf Avi Grid): 8x8 kamuflaj grid.
- GOREV 4 (Bonus): Mini yarisma sorusi veya tuyo kutusu.

[PAGINATION]
ICERIK UZUN OLURSA su ayraci koy ve yeni sayfaya gec:
===SAYFA_SONU===
Ayracti kelime ortasinda veya bitmemis bir gorev arasinda KULLANMA. Hep ana bolumler arasina koy.

[YANIT FORMATI]:
Gecerli JSON dondur:
{
  "title": "${topic} - Harf Farkindaligi",
  "content": "Tum yonerge ve calisma.",
  "pedagogicalNote": "ZORUNLU: Ogretmene yonelik en az 50 karakterlik detayli pedagojik aciklama. Bu etkinligin hangi becerileri gelistirdigini, disleksi destegi nasil sagladigini ve ogretmenin dikkat etmesi gereken noktalari acikla."
}
Markdown bloguna # H1 Baslik ile basla.
`;

    return prompt;
}
