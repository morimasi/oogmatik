import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

interface BrainTeaserPuzzle {
  id: string;
  type: 'riddle' | 'lateral_thinking' | 'visual_math' | 'sequence_find';
  category: string;
  difficulty_stars: number;
  q: string;
  hint: string;
  visual: null;
  a: string;
}

interface BrainTeasersData {
  id: string;
  activityType: 'BRAIN_TEASERS';
  title: string;
  instruction: string;
  difficultyLevel: string;
  ageGroup: string;
  profile: string;
  puzzles: BrainTeaserPuzzle[];
}

const riddles = [
  { q: "Ben herkesin dilindeyim ama kimse beni tutamaz. Benim neyim?", a: "Söz", hint: "İletişimle ilgili" },
  { q: "Ne kadar çok alırsan, o kadar çok bırakırsın. Ben neyim?", a: "Adım", hint: "Yürüyüşle ilgili" },
  { q: "Gözleri var ama göremez, ağzı var ama konuşamaz. Bu ne?", a: "İğne", hint: "Dikişle ilgili" },
  { q: "Delikleri olmasına rağmen su tutabilen şey nedir?", a: "Sünger", hint: "Temizlikle ilgili" },
  { q: "Düştüğünde asla kırılmaz ama suya girince dağılır. Nedir bu?", a: "Kağıt", hint: "Yazı yazmakla ilgili" },
  { q: "Sana aittir ama başkaları onu senden daha çok kullanır. Nedir o?", a: "İsmin", hint: "Kimliğinle ilgili" },
  { q: "Sabahları dört, öğlenleri iki, akşamları üç ayakla yürüyen nedir?", a: "İnsan", hint: "Hayat evreleri" },
  { q: "Benim ağzım yok ama fısıldarım. Kanatlarım yok ama uçarım. Ben neyim?", a: "Rüzgar", hint: "Hava durumu" },
  { q: "Hiçbir şey yemem ama sürekli büyürüm. Sudan korkarım. Ben neyim?", a: "Ateş", hint: "Sıcaklıkla ilgili" },
  { q: "Kolu var eli yok, yakası var başı yok. Bu nedir?", a: "Gömlek", hint: "Giyim" },
  { q: "İçi ateş, dışı taş, yarı kuru, yarı yaş. Nedir bu?", a: "Dünya", hint: "Gezegen" },
  { q: "Gündüz uyur, gece uyanır. Gökyüzünde parlar. Nedir bu?", a: "Yıldız", hint: "Gökyüzü" },
  { q: "Kanadı var uçamaz, iğnesi var sokamaz. Bu nedir?", a: "Rüzgar Gülü", hint: "Oyuncak" },
  { q: "Kuyruğu var at değil, kanadı var kuş değil. Nedir bu?", a: "Balık", hint: "Deniz" },
  { q: "Bacakları var ama yürüyemez. Bu nedir?", a: "Masa", hint: "Mobilya" }
];

const lateralThinking = [
  { q: "Bir odada 3 ampül var. Odanın dışında 3 anahtar var. Sadece bir kez odaya girerek hangi anahtarın hangi ampüle aitini nasıl bulursun?", a: "Birinciyi 5 dk yak, kapat. İkinciyi yak. Odaya gir: Sıcak olan ilk, yanan ikinci, soğuk üçüncü.", hint: "Isıyı düşün" },
  { q: "Adam her gün asansörle 10'dan iner, dönüşte sadece yağmurlu günlerde 10'a çıkar. Neden?", a: "Adam kısadır. Sadece şemsiyesi olduğunda 10. düğmeye basabilir.", hint: "Fiziksel bir engel" },
  { q: "Siyah bir köpeğin üzerine siyah bir arabayla geliyorsun. Sokak lambaları bozuk ve farların kapalı. Köpeğe çarpmadan nasıl durabildin?", a: "Gündüz vaktiydi.", hint: "Zamanla ilgili" },
  { q: "Bir adam bir pencere temizleyicisi olarak çalışıyor ve 50 katlı binanın dış camlarını siliyor. Bir anda düşüyor ve hiçbir yara almadan kurtuluyor. Nasıl olabilir?", a: "Zemin katta temizlik yapıyordu.", hint: "Yükseklik detayı" },
  { q: "İki baba ve iki oğul balık tutmaya gider. Her biri 1 balık tutar. Toplamda sadece 3 balık tutmuşlardır. Nasıl?", a: "Dede, baba ve oğul gitmiştir.", hint: "Akrabalık zinciri" },
  { q: "Bir adam pazar günü atıyla şehre gider. Şehirde üç gün kalır ve yine pazar günü döner. Nasıl?", a: "Atının adı Pazar'dır.", hint: "İsim" },
  { q: "Ayların bazılarında 30, bazılarında 31 gün vardır. Kaç ayda 28 gün vardır?", a: "Tüm aylarda (hepsinde en az 28 gün vardır).", hint: "Takvim oyunları" },
  { q: "Polis, hırsızın girdiği evi araştırırken masada açık bir şişe zehir ve iki fincan çay bulur. Fincanların ikisi de zehirlidir ama sadece ev sahibi ölmüştür. Neden?", a: "Ev sahibi çayını zehir etkisini göstermeden hızlıca içmiştir (zehir çayda değil buzdur).", hint: "Zamanla eriyen bir şey" },
  { q: "Elinde sadece bir kibrit var. Karanlık ve soğuk bir odaya girdin. Odada mum, soba ve gaz lambası var. Önce hangisini yakarsın?", a: "Kibriti.", hint: "Sıralama" },
  { q: "Babanın tek çocuğu, annenin tek çocuğu. Ama sen değilsin. Kim?", a: "Sensin! Soru şaşırtmacalı.", hint: "Kendine dön" }
];

const visualMath = [
  { q: "Devamı ne olmalı: 2, 6, 12, 20, 30, ?", a: "42 (Sırayla 4, 6, 8, 10, 12 ekleniyor)", hint: "Artan farklar" },
  { q: "Saat 3'te iken, akrep ve yelkovan arasındaki açı kaç derecedir?", a: "90 derece", hint: "Saat kadranı (360 derece)" },
  { q: "1, 1, 2, 3, 5, 8, 13 serisinin devamı nedir?", a: "21 (Fibonacci dizisi, son ikisinin toplamı)", hint: "Önceki iki sayı" },
  { q: "Şu seride eksik sayı nedir? 3, 9, 27, 81, ?", a: "243 (Hep 3 ile çarpılıyor)", hint: "Çarpım" },
  { q: "100'ü 8 adet 8 kullanarak nasıl elde edersin? (Sadece toplama kullanarak)", a: "88 + 8 + 8 + 8 + 8 = 100", hint: "Sayıları yan yana yazabilirsin" },
  { q: "Eğer 3 kedi 3 fareyi 3 dakikada yakalarsa, 100 kedi 100 fareyi kaç dakikada yakalar?", a: "3 dakikada (Her kedi bir fareyi 3 dakikada yakalar)", hint: "Birim zaman" },
  { q: "Hangi sayının karesi kendisiyle aynıdır?", a: "0 ve 1", hint: "Çarpma işlemi" },
  { q: "Sepette 5 elma var. 5 çocuğa birer elma dağıtırsan sepette nasıl 1 elma kalır?", a: "Son çocuğa elmayı sepetle birlikte verirsin.", hint: "Kutu detayı" },
  { q: "Yarımın yarısının yarısı kaçtır?", a: "1/8", hint: "Kesirler" },
  { q: "1'den 100'e kadar olan sayıların toplamı kaçtır?", a: "5050 (Formül: n*(n+1)/2)", hint: "Gauss formülü" },
  { q: "Çiftlikte tavuklar ve tavşanlar var. Toplam 35 baş ve 94 ayak var. Kaç tavşan var?", a: "12 tavşan (Tavşan x4, Tavuk x2 denkleminden)", hint: "Ayak sayıları" }
];

const sequenceFind = [
  { q: "Dizi: △, ○, □, △, ○, ? Sonraki şekil ne?", a: "□ (Üçgen, Daire, Kare döngüsü)", hint: "Tekrarlayan desen" },
  { q: "A, C, F, J, O, ? Sonraki harf ne?", a: "U (+2, +3, +4, +5, +6 harf atlama)", hint: "Artan farklar" },
  { q: "O, Ş, M, N, M, H, ? (Ayların baş harfleri)", a: "T (Temmuz)", hint: "Takvim" },
  { q: "P, S, Ç, P, C, C, ? (Haftanın günleri)", a: "P (Pazar)", hint: "Zaman" },
  { q: "B, İ, Ü, D, B, A, ? (Rakamların baş harfleri)", a: "Y (Yedi)", hint: "Sayılar" },
  { q: "1, 4, 9, 16, 25, 36, ? Sonraki sayı ne?", a: "49 (Tam kare sayılar: 1², 2², 3², vb.)", hint: "Kareler" },
  { q: "2, 3, 5, 7, 11, 13, ? Sonraki sayı ne?", a: "17 (Asal sayılar dizisi)", hint: "Sadece kendisine bölünenler" },
  { q: "J, F, M, A, M, J, J, A, S, O, N, ? (İngilizce aylar)", a: "D (December)", hint: "Yabancı dil takvim" },
  { q: "■, □□, ■■■, □□□□, ? Sonraki desen ne?", a: "■■■■■ (Renk değişiyor, miktar artıyor)", hint: "Renk ve sayı" },
  { q: "G, B, K, S, M, Y, ? (Gökkuşağı renkleri)", a: "M (Mor)", hint: "Doğa olayı" }
];

export const generateOfflineBrainTeasers = async (options: GeneratorOptions): Promise<WorksheetData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    itemCount = 8, // Changed to 8 for denser pages
    ageGroup = '8-10',
    profile = 'general'
  } = options;

  const pages: BrainTeasersData[] = [];

  for (let p = 0; p < worksheetCount; p++) {
    const puzzles: BrainTeaserPuzzle[] = [];
    
    // Her kategoriden en az 1 tane seç
    const selectedRiddles = [...riddles].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedLateral = [...lateralThinking].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedMath = [...visualMath].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));
    const selectedSequence = [...sequenceFind].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(itemCount / 4));

    const allPuzzles = [
      ...selectedRiddles.map((p, i) => ({ ...p, id: `riddle-${i}`, type: 'riddle' as const, category: 'Dil', difficulty_stars: 2 })),
      ...selectedLateral.map((p, i) => ({ ...p, id: `lateral-${i}`, type: 'lateral_thinking' as const, category: 'Mantık', difficulty_stars: 3 })),
      ...selectedMath.map((p, i) => ({ ...p, id: `math-${i}`, type: 'visual_math' as const, category: 'Sayı', difficulty_stars: 3 })),
      ...selectedSequence.map((p, i) => ({ ...p, id: `seq-${i}`, type: 'sequence_find' as const, category: 'Görsel', difficulty_stars: 2 }))
    ];

    // Rastgele sırala ve istenen sayıda al
    puzzles.push(...allPuzzles.sort(() => 0.5 - Math.random()).slice(0, itemCount));

    pages.push({
      id: `brain-teasers-${p}`,
      activityType: 'BRAIN_TEASERS',
      title: 'Kafayı Çalıştır: Zeka Oyunları',
      instruction: 'Soruları dikkatlice oku ve yaratıcı düşünerek çöz.',
      difficultyLevel: difficulty,
      ageGroup: ageGroup,
      profile: profile,
      puzzles: puzzles.map((puzzle, i) => ({
        ...puzzle,
        id: `p${i + 1}`,
        visual: null
      }))
    });
  }

  return pages as WorksheetData[];
};
