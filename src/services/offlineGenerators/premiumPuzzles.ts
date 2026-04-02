import { GeneratorOptions, SingleWorksheetData, ActivityType } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getRandomItems, shuffle, getRandomInt, getWordsForDifficulty } from './helpers';

/**
 * premiumPuzzles.ts — Premium Bulmaca & Dikkat Offline Motorları
 *
 * 12 bulmaca/dikkat aktivitesi için özel offline jeneratörler.
 */

// ═══════════════════════════════════════════════════════════════
// ANAGRAM
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumAnagram(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Rastgele' } = options;
  const words = getWordsForDifficulty(difficulty, topic);
  const selected = getRandomItems(words, 12);

  const categories: Record<string, string> = {
    'hayvanlar': '🐾 Hayvan', 'meyveler': '🍎 Meyve', 'meslekler': '👷 Meslek',
    'renkler': '🎨 Renk', 'okul': '📚 Okul', 'Rastgele': '🎯 Genel'
  };

  const items = selected.map(word => ({
    original: word,
    scrambled: shuffle(word.split('')).join(''),
    hint: categories[topic] || '🎯 Genel',
    length: word.length
  }));

  // Zorluk sıralama: kısadan uzuna
  items.sort((a, b) => a.length - b.length);

  const builder = new WorksheetBuilder(ActivityType.ANAGRAM, 'Anagram Çöz!')
    .addPremiumHeader()
    .setInstruction('Karışık harfleri doğru sıraya koyarak anlamlı kelimeyi bul. İpuçlarını kullan!')
    .addPedagogicalNote('Anagram çözme, fonolojik manipülasyon ve kelime hafızasını geliştirir. Harfleri zihinsel olarak yeniden düzenleme, çalışma belleği kapasitesini artırır ve yazma becerisini destekler.')
    .addPrimaryActivity('table', {
      title: '🔤 Harfleri Doğru Sıraya Koy',
      headers: ['#', 'Karışık Harf', 'İpucu', 'Harf Sayısı', 'Doğru Kelime'],
      rows: items.map((item, i) => [
        `${i + 1}`,
        item.scrambled.toLocaleUpperCase('tr'),
        item.hint,
        `${item.length} harf`,
        '________________'
      ])
    })
    .addSupportingDrill('Cümle Anagramı', {
      text: 'Aşağıdaki karışık cümlelerdeki kelimeleri doğru sıraya koy:',
      questions: [
        '"GÜZELDİ ÇOK HAVA BUGÜN" → ________________________________',
        '"OKUYORUm KİTAP AKŞAM HER" → ________________________________'
      ]
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// ÇAPRAZ BULMACA (CROSSWORD)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumCrossword(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Rastgele' } = options;

  // Basit çapraz bulmaca veri seti
  const crosswordSets: Record<string, { word: string; clue: string; dir: 'yatay' | 'dikey'; row: number; col: number }[]> = {
    'hayvanlar': [
      { word: 'KEDİ', clue: 'Miyavlayan evcil hayvan', dir: 'yatay', row: 0, col: 0 },
      { word: 'KÖPEK', clue: 'İnsanın en iyi dostu', dir: 'dikey', row: 0, col: 0 },
      { word: 'ASLAN', clue: 'Ormanların kralı', dir: 'yatay', row: 2, col: 1 },
      { word: 'BALIK', clue: 'Suda yaşayan canlı', dir: 'dikey', row: 0, col: 3 },
      { word: 'FİL', clue: 'En büyük kara hayvanı', dir: 'yatay', row: 4, col: 2 },
      { word: 'TAVŞAN', clue: 'Havuç seven hayvan', dir: 'dikey', row: 2, col: 5 },
      { word: 'KARTAL', clue: 'Gökyüzünün efendisi', dir: 'yatay', row: 6, col: 0 },
      { word: 'YUNUŞ', clue: 'Akıllı deniz memelisi', dir: 'dikey', row: 4, col: 2 },
    ],
    'okul': [
      { word: 'KALEM', clue: 'Yazı yazdığımız araç', dir: 'yatay', row: 0, col: 0 },
      { word: 'KİTAP', clue: 'Okuduğumuz nesne', dir: 'dikey', row: 0, col: 0 },
      { word: 'SİLGİ', clue: 'Yanlışları düzelten', dir: 'yatay', row: 2, col: 1 },
      { word: 'SINIF', clue: 'Ders gördüğümüz oda', dir: 'dikey', row: 0, col: 4 },
      { word: 'TAHTA', clue: 'Öğretmenin yazdığı yer', dir: 'yatay', row: 4, col: 0 },
      { word: 'DEFTER', clue: 'Not aldığımız', dir: 'dikey', row: 2, col: 3 },
      { word: 'BOYA', clue: 'Resim yaparken kullandığımız', dir: 'yatay', row: 6, col: 2 },
    ]
  };

  const setKey = Object.keys(crosswordSets).includes(topic.toLowerCase()) ? topic.toLowerCase() : 'hayvanlar';
  const clues = crosswordSets[setKey];

  const yatay = clues.filter(c => c.dir === 'yatay');
  const dikey = clues.filter(c => c.dir === 'dikey');

  // 10x10 grid
  const gridSize = 10;
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => '■')
  );

  clues.forEach(c => {
    for (let i = 0; i < c.word.length; i++) {
      if (c.dir === 'yatay' && c.col + i < gridSize && c.row < gridSize) {
        grid[c.row][c.col + i] = ' ';
      } else if (c.dir === 'dikey' && c.row + i < gridSize && c.col < gridSize) {
        grid[c.row + i][c.col] = ' ';
      }
    }
  });

  const builder = new WorksheetBuilder(ActivityType.CROSSWORD, 'Çapraz Bulmaca')
    .addPremiumHeader()
    .setInstruction('İpuçlarını okuyarak bulmacadaki boş kutuları doldur.')
    .addPedagogicalNote('Çapraz bulmaca, sözcük dağarcığını genişletir ve çapraz referans (cross-referencing) becerisini geliştirir. Kesişen harfler, doğru kelimeyi bulmada görsel ipucu sağlar.')
    .addPrimaryActivity('grid', {
      title: '📰 Çapraz Bulmaca',
      matrix: grid,
      gridSize: { rows: gridSize, cols: gridSize }
    })
    .addSupportingDrill('İpuçları', {
      horizontal: yatay.map((c, i) => `${i + 1}. ${c.clue}`),
      vertical: dikey.map((c, i) => `${i + 1}. ${c.clue}`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// FARKLIYI BUL (ODD_ONE_OUT)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumOddOneOut(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const groups = [
    { items: ['Elma', 'Armut', 'Çilek', 'Kalem'], odd: 'Kalem', reason: 'Meyve değil' },
    { items: ['Kedi', 'Köpek', 'Masa', 'Tavşan'], odd: 'Masa', reason: 'Canlı değil' },
    { items: ['Kırmızı', 'Mavi', 'Yeşil', 'Otobüs'], odd: 'Otobüs', reason: 'Renk değil' },
    { items: ['Doktor', 'Öğretmen', 'Bardak', 'Pilot'], odd: 'Bardak', reason: 'Meslek değil' },
    { items: ['Türkiye', 'İstanbul', 'Fransa', 'Almanya'], odd: 'İstanbul', reason: 'Ülke değil, şehir' },
    { items: ['Daire', 'Üçgen', 'Kare', 'Balon'], odd: 'Balon', reason: 'Geometrik şekil değil' },
    { items: ['Piyano', 'Gitar', 'Resim', 'Keman'], odd: 'Resim', reason: 'Müzik aleti değil' },
    { items: ['Yaz', 'Kış', 'Salı', 'İlkbahar'], odd: 'Salı', reason: 'Mevsim değil' },
    { items: ['Göz', 'Kulak', 'Burun', 'Kitap'], odd: 'Kitap', reason: 'Duyu organı değil' },
    { items: ['Deniz', 'Göl', 'Nehir', 'Orman'], odd: 'Orman', reason: 'Su kütlesi değil' },
  ];

  const shuffledGroups = groups.map(g => ({
    ...g,
    items: shuffle([...g.items])
  }));

  const builder = new WorksheetBuilder(ActivityType.ODD_ONE_OUT, 'Farklıyı Bul')
    .addPremiumHeader()
    .setInstruction('Her satırdaki 4 öğeden farklı olanı bul, daire içine al ve nedenini yaz.')
    .addPedagogicalNote('Kategorize etme ve tümdengelimsel akıl yürütme becerilerini geliştirir. Ortak özellik çıkarımı, soyut düşünmenin temelidir.')
    .addPrimaryActivity('table', {
      title: '🔍 Hangisi Farklı?',
      headers: ['#', 'Öğe 1', 'Öğe 2', 'Öğe 3', 'Öğe 4', 'Farklı', 'Neden?'],
      rows: shuffledGroups.map((g, i) => [
        `${i + 1}`, g.items[0], g.items[1], g.items[2], g.items[3], '______', '________________'
      ])
    })
    .addSupportingDrill('Kendi Grubunu Yaz', {
      text: 'Sende 4 öğeli bir grup oluştur. 3\'ü aynı kategoriden, 1\'i farklı olsun:',
      inputs: ['Öğeler: _______, _______, _______, _______', 'Farklı olan: _______ Neden: _____________']
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// KAVRAM EŞLEŞTİRME (CONCEPT_MATCH)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumConceptMatch(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const pairs = shuffle([
    { concept: 'Güneş', definition: 'Dünyamızı ısıtan yıldız' },
    { concept: 'Kalp', definition: 'Kanı pompalayan organ' },
    { concept: 'Kütüphane', definition: 'Kitapların bulunduğu yer' },
    { concept: 'Okyanuz', definition: 'En büyük su kütlesi' },
    { concept: 'Teleskop', definition: 'Uzaktaki nesneleri yakınlaştıran alet' },
    { concept: 'Pusula', definition: 'Yön bulmaya yarayan araç' },
    { concept: 'Fossils', definition: 'Taşlaşmış canlı kalıntısı' },
    { concept: 'Atlas', definition: 'Harita kitabı' },
    { concept: 'Termometre', definition: 'Sıcaklık ölçen alet' },
    { concept: 'Dürbün', definition: 'Kuş gözlemcilerin kullandığı' },
  ]);

  const shuffledDefs = shuffle(pairs.map(p => p.definition));

  const builder = new WorksheetBuilder(ActivityType.CONCEPT_MATCH, 'Kavram Eşleştirme')
    .addPremiumHeader()
    .setInstruction('Sol sütundaki kavramları, sağ sütundaki tanımlarla çizgiyle eşleştir.')
    .addPedagogicalNote('Kavram eşleştirme, anlamsal ağ (semantic network) oluşturmayı ve sözcük bilgisini geliştirir. Tanım-kelime ilişkisi kurma, okuduğunu anlama becerisinin temelini oluşturur.')
    .addPrimaryActivity('dual_column', {
      left: {
        title: '📝 Kavramlar',
        items: pairs.map((p, i) => `${i + 1}. ${p.concept}`)
      },
      right: {
        title: '📖 Tanımlar',
        items: shuffledDefs.map((d, i) => `${String.fromCharCode(65 + i)}. ${d}`)
      }
    });

  // Cümle tamamlama
  builder.addSupportingDrill('Cümlede Kullan', {
    questions: pairs.slice(0, 5).map((p, i) =>
      `${i + 1}. ______________ ${p.definition.toLowerCase().replace(p.concept.toLowerCase(), '___')}dir.`
    )
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// MANTIK IZGARASI (LOGIC_GRID_PUZZLE)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumLogicGridPuzzle(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const puzzles = [
    {
      people: ['Ali', 'Elif', 'Can'],
      items: ['Kırmızı', 'Mavi', 'Yeşil'],
      pets: ['Kedi', 'Köpek', 'Kuş'],
      clues: [
        'Ali\'nin evcil hayvanı köpek değildir.',
        'Mavi rengi seven kişinin kedisi vardır.',
        'Elif yeşil rengi sever.',
        'Can\'ın kuşu vardır.',
        'Kırmızı rengi seven kişi Ali\'dir.',
      ],
      solution: { 'Ali': { color: 'Kırmızı', pet: 'Kedi' }, 'Elif': { color: 'Yeşil', pet: 'Köpek' }, 'Can': { color: 'Mavi', pet: 'Kuş' } }
    }
  ];

  const puzzle = puzzles[0];

  const builder = new WorksheetBuilder(ActivityType.LOGIC_GRID_PUZZLE, 'Mantık Izgarası')
    .addPremiumHeader()
    .setInstruction('İpuçlarını oku, ızgaraya ✓ ve ✗ koy, doğru eşleşmeyi bul!')
    .addPedagogicalNote('Mantık ızgarası, tümdengelimsel mantık ve organizasyonel strateji becerilerini geliştirir. Eleme yöntemiyle sistematik problem çözme, yönetici işlevleri güçlendirir.')
    .addPrimaryActivity('text', {
      content: '📌 İPUÇLARI:\n\n' + puzzle.clues.map((c, i) => `${i + 1}. ${c}`).join('\n')
    })
    .addPrimaryActivity('table', {
      title: '📊 Mantık Tablosu — Renkler',
      headers: ['', ...puzzle.items],
      rows: puzzle.people.map(p => [p, ...puzzle.items.map(() => '☐')])
    })
    .addPrimaryActivity('table', {
      title: '📊 Mantık Tablosu — Hayvanlar',
      headers: ['', ...puzzle.pets],
      rows: puzzle.people.map(p => [p, ...puzzle.pets.map(() => '☐')])
    })
    .addSupportingDrill('Sonuç Tablosu', {
      table: {
        headers: ['Kişi', 'Renk', 'Hayvan'],
        rows: puzzle.people.map(p => [p, '____________', '____________'])
      }
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// NOKTALAMA LABİRENTİ (PUNCTUATION_MAZE)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumPunctuationMaze(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const textWithout = 'Bugün hava çok güzel Ali parkta top oynuyor Elif ise kitap okuyor Annem bize limonata yaptı ne kadar lezzetli Akşama doğru eve döneceğiz Yarın okul var erken yatmalıyız';
  
  const correctedText = 'Bugün hava çok güzel. Ali parkta top oynuyor. Elif ise kitap okuyor. Annem bize limonata yaptı. Ne kadar lezzetli! Akşama doğru eve döneceğiz. Yarın okul var, erken yatmalıyız.';

  const wrongPunctuation = [
    { text: 'Ali eve geldi, ve Ödevini yaptı.', error: 'Gereksiz virgül', correct: 'Ali eve geldi ve ödevini yaptı.' },
    { text: 'Bugün pazartesi.', error: 'Gün ismi büyük harf olmalı', correct: 'Bugün Pazartesi.' },
    { text: 'ne güzel bir gün!', error: 'Cümle küçük harfle başlamış', correct: 'Ne güzel bir gün!' },
    { text: 'Kedi, köpek ve. kuş bahçede.', error: 'Yanlış yere nokta', correct: 'Kedi, köpek ve kuş bahçede.' },
    { text: 'nereye gidiyorsun.', error: 'Soru işareti olmalı', correct: 'Nereye gidiyorsun?' },
  ];

  const builder = new WorksheetBuilder(ActivityType.PUNCTUATION_MAZE, 'Noktalama Labirenti')
    .addPremiumHeader()
    .setInstruction('Bölüm 1: Metne noktalama işaretlerini ekle. Bölüm 2: Yanlış noktalamayı düzelt.')
    .addPedagogicalNote('Noktalama farkındalığı, metin organizasyonu ve dilbilgisi becerilerini geliştirir. Prosodik ipuçlarını yazılı metne aktarma, okuduğunu anlama için kritiktir.')
    .addPrimaryActivity('text', {
      content: `📝 BÖLÜM 1: Noktalama İşaretlerini Ekle\n\n(Nokta, virgül, ünlem ve soru işareti ekleyerek metni düzelt)\n\n"${textWithout}"`
    })
    .addSupportingDrill('📝 BÖLÜM 2: Hataları Düzelt', {
      questions: wrongPunctuation.map((wp, i) =>
        `${i + 1}. "${wp.text}"\n   Hata: __________________\n   Doğrusu: __________________`
      )
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// UZAMSAL IZGARA (SPATIAL_GRID)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumSpatialGrid(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const gridSize = 6;
  const columns = 'ABCDEF'.split('');

  const commands = [
    `A1'e bir yıldız (★) çiz`,
    `C3'e bir üçgen (△) çiz`,
    `F6'ya bir kare (□) çiz`,
    `B4'e bir daire (○) çiz`,
    `D2'den E5'e bir çizgi çek`,
    `A6'ya bir kalp (♥) çiz`,
    `E1'e bir ok (→) çiz`,
    `C5'e adının baş harfini yaz`,
  ];

  const questions = [
    'Yıldız hangi koordinatta?',
    'Üçgenin sağında hangi hücre var?',
    'Karenin altında hangi hücre var?',
    'Hangi şekiller aynı sütunda?',
  ];

  const builder = new WorksheetBuilder(ActivityType.SPATIAL_GRID, 'Uzamsal Izgara')
    .addPremiumHeader()
    .setInstruction('Komutları okuyarak ızgaraya şekilleri çiz. Sonra soruları cevapla.')
    .addPedagogicalNote('Uzamsal ızgara, koordinat sistemini anlama, yön-konum ilişkisi ve uzamsal kodlama becerilerini geliştirir. Matematiksel düşünmenin ve geometrik algının temelini oluşturur.')
    .addPrimaryActivity('grid', {
      title: '📍 6×6 Koordinat Izgarası',
      matrix: Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => ' ')
      ),
      columnLabels: columns,
      rowLabels: ['1', '2', '3', '4', '5', '6']
    })
    .addPrimaryActivity('text', {
      content: '📋 KOMUTLAR:\n\n' + commands.map((c, i) => `${i + 1}. ${c}`).join('\n')
    })
    .addSupportingDrill('❓ Sorular', {
      questions: questions.map((q, i) => `${i + 1}. ${q}\n   Cevap: ____________`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// NOKTA BOYAMA (DOT_PAINTING)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumDotPainting(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const colorCount = difficulty === 'Zor' ? 8 : difficulty === 'Orta' ? 6 : 4;

  const allColors = [
    { num: 1, color: 'Kırmızı', emoji: '🔴' },
    { num: 2, color: 'Mavi', emoji: '🔵' },
    { num: 3, color: 'Yeşil', emoji: '🟢' },
    { num: 4, color: 'Sarı', emoji: '🟡' },
    { num: 5, color: 'Turuncu', emoji: '🟠' },
    { num: 6, color: 'Mor', emoji: '🟣' },
    { num: 7, color: 'Kahverengi', emoji: '🟤' },
    { num: 8, color: 'Pembe', emoji: '💗' },
  ];

  const colors = allColors.slice(0, colorCount);

  // Bölge haritası (basit kelebek deseni)
  const regions = [
    { id: 'A', description: 'Kanat üst sol', colorNum: 1 },
    { id: 'B', description: 'Kanat üst sağ', colorNum: 1 },
    { id: 'C', description: 'Kanat alt sol', colorNum: 2 },
    { id: 'D', description: 'Kanat alt sağ', colorNum: 2 },
    { id: 'E', description: 'Gövde', colorNum: 3 },
    { id: 'F', description: 'Kanat desen 1', colorNum: 4 },
    { id: 'G', description: 'Kanat desen 2', colorNum: 4 },
    { id: 'H', description: 'Anten', colorNum: 3 },
    { id: 'I', description: 'Zemin', colorNum: colorCount > 4 ? 5 : 1 },
    { id: 'J', description: 'Çiçek', colorNum: colorCount > 5 ? 6 : 4 },
  ];

  const builder = new WorksheetBuilder(ActivityType.DOT_PAINTING, 'Sayıya Göre Boya')
    .addPremiumHeader()
    .setInstruction('Renk anahtarına bakarak her bölgeyi doğru renge boya.')
    .addPedagogicalNote('Sayıya göre boyama, sayı-renk eşleştirme, ince motor kontrol ve görsel dikkat becerilerini geliştirir. Bölgeleri doğru boyama, sınır algısını güçlendirir.')
    .addPrimaryActivity('table', {
      title: '🎨 Renk Anahtarı',
      headers: colors.map(c => `${c.num} = ${c.emoji}`),
      rows: [colors.map(c => c.color)]
    })
    .addPrimaryActivity('text', {
      content: '🦋 KELEBEK DESENİ\n\nAşağıdaki bölgeleri belirtilen numaraya göre boya:\n\n' +
        regions.map(r => `  Bölge ${r.id} (${r.description}): ${r.colorNum} numaralı renk`).join('\n')
    })
    .addSupportingDrill('Sayma Soruları', {
      questions: [
        'Kaç bölge kırmızı (1) ile boyanacak?',
        'En çok hangi renk kullanıldı?',
        'Toplam kaç farklı bölge var?',
      ]
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// ŞEKİL SUDOKU (SHAPE_SUDOKU)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumShapeSudoku(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const shapes4 = ['▲', '■', '●', '◆'];
  // Geçerli 4x4 sudoku çözümleri
  const solutions4: number[][] = [
    [0, 1, 2, 3],
    [2, 3, 0, 1],
    [1, 0, 3, 2],
    [3, 2, 1, 0]
  ];

  // %40 gösterilen
  const puzzle4a = solutions4.map(row => row.map(v => Math.random() > 0.4 ? shapes4[v] : ''));
  const puzzle4b = solutions4.map(row => row.map(v => Math.random() > 0.4 ? shapes4[v] : ''));

  // 6x6 şekil sudoku
  const shapes6 = ['▲', '■', '●', '◆', '★', '♥'];
  const solutions6: number[][] = [
    [0, 1, 2, 3, 4, 5],
    [3, 4, 5, 0, 1, 2],
    [1, 2, 0, 5, 3, 4],
    [4, 5, 3, 2, 0, 1],
    [2, 0, 4, 1, 5, 3],
    [5, 3, 1, 4, 2, 0]
  ];
  const puzzle6 = solutions6.map(row => row.map(v => Math.random() > 0.45 ? shapes6[v] : ''));

  const builder = new WorksheetBuilder(ActivityType.SHAPE_SUDOKU, 'Şekil Sudoku')
    .addPremiumHeader()
    .setInstruction('Kural: Her satır ve sütunda her şekil yalnızca BİR KEZ bulunur. Boş hücreleri doldur!')
    .addPedagogicalNote('Şekil sudoku, mantıksal eliminasyon, uzamsal düzenleme ve sistematik problem çözme becerilerini geliştirir. Sayı sudokunun aksine, görsel-sembolik düşünmeyi teşvik eder.')
    .addPrimaryActivity('grid', {
      title: `🧩 Sudoku 1 (4×4) — Şekiller: ${shapes4.join(' ')}`,
      matrix: puzzle4a,
      gridSize: { rows: 4, cols: 4 }
    })
    .addPrimaryActivity('grid', {
      title: `🧩 Sudoku 2 (4×4) — Şekiller: ${shapes4.join(' ')}`,
      matrix: puzzle4b,
      gridSize: { rows: 4, cols: 4 }
    })
    .addSupportingDrill(`İleri Seviye: 6×6 Sudoku (${shapes6.join(' ')})`, {
      grid: puzzle6,
      gridSize: { rows: 6, cols: 6 }
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// TEMATİK FARKLIYI BUL (THEMATIC_ODD_ONE_OUT)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumThematicOddOneOut(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const groups = [
    { items: ['Mars', 'Venüs', 'Jüpiter', 'Ay', 'Satürn'], odd: 'Ay', theme: 'Gezegenler' },
    { items: ['Kalem', 'Silgi', 'Defter', 'Bisiklet', 'Cetvel'], odd: 'Bisiklet', theme: 'Okul malzemesi' },
    { items: ['Su', 'Çay', 'Kek', 'Süt', 'Ayran'], odd: 'Kek', theme: 'İçecekler' },
    { items: ['Televizyon', 'Bilgisayar', 'Tablet', 'Masa', 'Telefon'], odd: 'Masa', theme: 'Teknoloji' },
    { items: ['İstanbul', 'Ankara', 'Paris', 'İzmir', 'Bursa'], odd: 'Paris', theme: 'Türk şehirleri' },
    { items: ['Piyano', 'Gitar', 'Davul', 'Tablo', 'Flüt'], odd: 'Tablo', theme: 'Müzik aletleri' },
    { items: ['Çiçek', 'Ağaç', 'Çimen', 'Taş', 'Yaprak'], odd: 'Taş', theme: 'Bitkiler' },
    { items: ['Yüzmek', 'Koşmak', 'Uyumak', 'Tırmanmak', 'Atlamak'], odd: 'Uyumak', theme: 'Spor hareketleri' },
  ];

  const shuffledGroups = groups.map(g => ({ ...g, items: shuffle([...g.items]) }));

  const builder = new WorksheetBuilder(ActivityType.THEMATIC_ODD_ONE_OUT, 'Tematik Farklıyı Bul')
    .addPremiumHeader()
    .setInstruction('Her grupta 5 öğe var. 4\'ü aynı temadan, 1\'i farklı. Hem farklıyı hem temayı bul!')
    .addPedagogicalNote('Tematik farklıyı bulma, kategorizasyon ve soyut düşünme becerilerini geliştirir. Tema çıkarımı (gizli ortak özellik bulma), bilişsel esnekliğin üst düzey bir göstergesidir.')
    .addPrimaryActivity('table', {
      title: '🔎 Tema Nedir? Farklı Kim?',
      headers: ['#', 'Öğe 1', 'Öğe 2', 'Öğe 3', 'Öğe 4', 'Öğe 5', 'Farklı', 'Tema'],
      rows: shuffledGroups.map((g, i) => [
        `${i + 1}`, ...g.items, '______', '____________'
      ])
    })
    .addSupportingDrill('Kendi Grubunu Oluştur', {
      text: '5 öğeli bir grup yaz. 4\'ü aynı temadan, 1\'i farklı olsun:',
      inputs: ['Öğeler: _______, _______, _______, _______, _______', 'Tema: _____________ Farklı: _____________']
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// DİKKAT GELİŞTİRME (ATTENTION_DEVELOPMENT)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumAttentionDevelopment(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  // Bölüm 1: Ardışık dikkat — 3'ün katlarını işaretle
  const numberSequence = Array.from({ length: 60 }, () => getRandomInt(1, 30));

  // Bölüm 2: Bölünmüş dikkat
  const mixedSequence = Array.from({ length: 40 }, () => {
    const isLetter = Math.random() > 0.5;
    return isLetter
      ? 'ABCÇDEFGH'[getRandomInt(0, 8)]
      : String(getRandomInt(1, 9));
  });

  // Bölüm 3: Sembol sayma
  const symbols = ['★', '♦', '♣', '♠', '♥'];
  const symbolGrid = Array.from({ length: 100 }, () => symbols[getRandomInt(0, symbols.length - 1)]);

  const builder = new WorksheetBuilder(ActivityType.ATTENTION_DEVELOPMENT, 'Dikkat Geliştirme')
    .addPremiumHeader()
    .setInstruction('Her bölümü sırayla tamamla. Süre tutabilirsin!')
    .addPedagogicalNote('Çok bölümlü dikkat çalışması: ardışık dikkat (sequential), bölünmüş dikkat (divided) ve sürdürülebilir dikkat (sustained) becerilerini hedefler. DEHB profillerinde kritik bir müdahale alanıdır.')
    .addPrimaryActivity('text', {
      content: '📌 BÖLÜM 1: 3\'ün katlarını daire içine al\n\n' +
        numberSequence.map(String).join('  ') +
        '\n\nToplam bulduğun: _______ Süren: _______ sn'
    })
    .addPrimaryActivity('text', {
      content: '📌 BÖLÜM 2: Harfleri altını çiz, sayıları daire içine al\n\n' +
        mixedSequence.join('  ') +
        '\n\nToplam harf: _______ Toplam sayı: _______ Süren: _______ sn'
    })
    .addSupportingDrill('📌 BÖLÜM 3: Her sembolü say', {
      text: symbolGrid.join(' ') +
        '\n\n' + symbols.map(s => `${s}: _______`).join('   ') +
        '\nSüren: _______ sn'
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// DİKKAT VE ODAKLANMA (ATTENTION_FOCUS)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumAttentionFocus(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const gridSize = difficulty === 'Zor' ? 15 : difficulty === 'Orta' ? 12 : 8;

  const pool = ['★', '♦', '♣', '♠', '♥', 'A', 'B', '2', '5', '7', '3', '9'];
  const matrix = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => pool[getRandomInt(0, pool.length - 1)])
  );

  // Hedefleri say
  const targetStar = matrix.flat().filter(c => c === '★').length;
  const targetEven = matrix.flat().filter(c => ['2'].includes(c)).length;

  const builder = new WorksheetBuilder(ActivityType.ATTENTION_FOCUS, 'Dikkat ve Odaklanma')
    .addPremiumHeader()
    .setInstruction(`Matristeki hedefleri bul ve say. Parmağınla takip etme, sadece gözünle!`)
    .addPedagogicalNote('Çoklu hedef takibi, seçici dikkat yoğunluğu ve görsel tarama hızını ölçer. Okuma sırasında belirli harfleri/kelimeleri tanıma becerisinin temelini oluşturur.')
    .addPrimaryActivity('grid', {
      title: `🎯 ${gridSize}×${gridSize} Sembol Matrisi`,
      matrix,
      gridSize: { rows: gridSize, cols: gridSize }
    })
    .addSupportingDrill('Görevler', {
      questions: [
        `Görev 1: Tüm ★ sembollerini bul ve say → _______`,
        `Görev 2: Tüm çift sayıları (2) bul ve say → _______`,
        `Görev 3: Tüm harfleri (A, B) bul ve toplamını yaz → _______`,
        `Süren: _______ saniye`,
      ]
    });

  return builder.addSuccessIndicator().build();
}
