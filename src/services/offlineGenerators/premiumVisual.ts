import { GeneratorOptions, SingleWorksheetData, ActivityType } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getRandomItems, shuffle, getRandomInt, getWordsForDifficulty, COLORS } from './helpers';

/**
 * premiumVisual.ts — Premium Görsel & Mekansal Offshore Motorları
 *
 * 6 görsel/mekansal aktivite türü için özel offline jeneratörler.
 */

// ═══════════════════════════════════════════════════════════════
// KARE KOPYALAMA (GRID_DRAWING)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumGridDrawing(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const gridSize = difficulty === 'Zor' ? 10 : difficulty === 'Orta' ? 8 : 6;

  // Desen oluştur: filled cells
  const filledCount = difficulty === 'Zor' ? 25 : difficulty === 'Orta' ? 16 : 10;
  const patterns: { row: number; col: number }[][] = [];

  for (let p = 0; p < 3; p++) {
    const filled = new Set<string>();
    while (filled.size < filledCount) {
      const r = getRandomInt(0, gridSize - 1);
      const c = getRandomInt(0, gridSize - 1);
      filled.add(`${r},${c}`);
    }
    patterns.push(Array.from(filled).map(s => {
      const [row, col] = s.split(',').map(Number);
      return { row, col };
    }));
  }

  const builder = new WorksheetBuilder(ActivityType.GRID_DRAWING, 'Kare Kopyalama (Grid Drawing)')
    .addPremiumHeader()
    .setInstruction('Sol taraftaki deseni sağ taraftaki boş ızgaraya birebir kopyala. Koordinatları kullan!')
    .addPedagogicalNote('Grid drawing, görsel-mekansal kopya becerisini ve el-göz koordinasyonunu geliştirir. Disleksi profillerinde, harflerin doğru yönde yazılması için gerekli uzamsal farkındalığı destekler.');

  patterns.forEach((pattern, idx) => {
    // Sol taraf: dolu grid
    const modelGrid: string[][] = Array.from({ length: gridSize }, () => 
      Array.from({ length: gridSize }, () => '○')
    );
    pattern.forEach(({ row, col }) => { modelGrid[row][col] = '●'; });

    // Sağ taraf: boş grid
    const emptyGrid: string[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => '○')
    );

    builder.addPrimaryActivity('dual_column', {
      left: {
        title: `📋 Desen ${idx + 1} (Örnek)`,
        grid: modelGrid
      },
      right: {
        title: `✏️ Kopyala`,
        grid: emptyGrid
      }
    });
  });

  builder.addSupportingDrill('Kendi Desenini Tasarla', {
    text: `${gridSize}×${gridSize} ızgaraya kendi desenini çiz. En az ${Math.floor(filledCount / 2)} kare doldur.`
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// SİMETRİ TAMAMLAMA (SYMMETRY_DRAWING)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumSymmetryDrawing(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const gridSize = 10;

  // Yatay simetri deseni oluştur (sol yarısı dolu)
  const createSymmetricPattern = () => {
    const half = Math.floor(gridSize / 2);
    const filled: { row: number; col: number }[] = [];
    const count = difficulty === 'Zor' ? 15 : 10;
    
    for (let i = 0; i < count; i++) {
      const r = getRandomInt(0, gridSize - 1);
      const c = getRandomInt(0, half - 1);
      filled.push({ row: r, col: c });
    }
    return filled;
  };

  const patterns = [
    { type: 'Yatay Simetri (Sol → Sağ)', filled: createSymmetricPattern() },
    { type: 'Yatay Simetri (Sol → Sağ)', filled: createSymmetricPattern() },
  ];

  // Dikey simetri
  const createVerticalPattern = () => {
    const half = Math.floor(gridSize / 2);
    const filled: { row: number; col: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const r = getRandomInt(0, half - 1);
      const c = getRandomInt(0, gridSize - 1);
      filled.push({ row: r, col: c });
    }
    return filled;
  };

  patterns.push({ type: 'Dikey Simetri (Üst → Alt)', filled: createVerticalPattern() });

  const builder = new WorksheetBuilder(ActivityType.SYMMETRY_DRAWING, 'Simetri Tamamlama')
    .addPremiumHeader()
    .setInstruction('Kalın çizgi simetri eksenidir. Verilen yarıyı ayna gibi tamamla.')
    .addPedagogicalNote('Simetri tamamlama, uzamsal akıl yürütme ve görsel-mekansal hafızayı geliştirir. Harflerin yönsel algısını destekler ve geometrik düşünmenin temelini oluşturur.');

  patterns.forEach((pattern, idx) => {
    const grid: string[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => '○')
    );
    pattern.filled.forEach(({ row, col }) => { 
      if (row < gridSize && col < gridSize) grid[row][col] = '●'; 
    });

    builder.addPrimaryActivity('grid', {
      title: `${idx + 1}. ${pattern.type}`,
      matrix: grid,
      symmetryAxis: pattern.type.includes('Yatay') ? 'vertical' : 'horizontal',
      gridSize: { rows: gridSize, cols: gridSize }
    });
  });

  builder.addSupportingDrill('Simetri Soruları', {
    questions: [
      'Hangi büyük harf simetrik şekle sahiptir? (A, B, C, D, E)',
      'Kelebek hangi simetri türüne örnektir?',
      'İnsan yüzü simetrik midir?'
    ]
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// KELİME BULMACA (WORD_SEARCH)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumWordSearch(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Rastgele' } = options;
  const gridSize = difficulty === 'Zor' ? 12 : difficulty === 'Orta' ? 10 : 8;

  const themes: Record<string, { title: string; words: string[] }> = {
    'hayvanlar': { title: 'Hayvanlar', words: ['KEDİ', 'KÖPEK', 'ASLAN', 'FİL', 'TAVŞAN', 'KARTAL', 'BALIK', 'KAPLUMBAĞA', 'PAPAĞAN', 'ZÜRAFA', 'PENGUEN', 'YUNUS'] },
    'meyveler': { title: 'Meyveler', words: ['ELMA', 'ARMUT', 'PORTAKAL', 'MUZ', 'ÇİLEK', 'KARPUZ', 'KİRAZ', 'KAVUN', 'ŞEFTALİ', 'NAR', 'ÜZÜM', 'İNCİR'] },
    'meslekler': { title: 'Meslekler', words: ['DOKTOR', 'ÖĞRETMEN', 'POLİS', 'İTFAİYECİ', 'AŞÇI', 'PİLOT', 'MİMAR', 'AVUKAT', 'MÜHENDİS', 'ÇOBAN', 'TERZI', 'FıRıNCı'] },
    'okul': { title: 'Okul', words: ['KALEM', 'SİLGİ', 'DEFTER', 'KİTAP', 'TAHTA', 'SIRA', 'ÇANTA', 'CETVEL', 'BOYA', 'SINIF', 'BAHÇE', 'TENEFFÜS'] },
  };

  const themeKey = Object.keys(themes).includes(topic.toLowerCase()) ? topic.toLowerCase() : 'hayvanlar';
  const theme = themes[themeKey];
  const selectedWords = getRandomItems(theme.words, Math.min(gridSize, theme.words.length));

  // Grid oluştur
  const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => alphabet[getRandomInt(0, alphabet.length - 1)])
  );

  // Kelimeleri yerleştir (basit: yatay)
  const placedWords: string[] = [];
  selectedWords.forEach((word, idx) => {
    if (word.length <= gridSize && idx < gridSize) {
      const row = idx;
      const startCol = getRandomInt(0, Math.max(0, gridSize - word.length));
      for (let c = 0; c < word.length; c++) {
        grid[row][startCol + c] = word[c];
      }
      placedWords.push(word);
    }
  });

  const builder = new WorksheetBuilder(ActivityType.WORD_SEARCH, `Kelime Bulmaca — ${theme.title}`)
    .addPremiumHeader()
    .setInstruction(`Aşağıdaki ${theme.title.toLowerCase()} ile ilgili kelimeleri bulmacada bul ve üzerini çiz.`)
    .addPedagogicalNote('Kelime bulmaca, görsel tarama hızını ve harf dizisi tanıma becerisini geliştirir. Dislekside sözcük formlarının otomatik tanınmasını destekler.')
    .addPrimaryActivity('grid', {
      title: `🔍 ${gridSize}×${gridSize} Kelime Bulmaca`,
      matrix: grid,
      gridSize: { rows: gridSize, cols: gridSize }
    })
    .addSupportingDrill('Bulunacak Kelimeler', {
      wordList: placedWords,
      checkboxes: placedWords.map(w => `☐ ${w}`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// YÖNSEL İZ SÜRME (DIRECTIONAL_TRACKING)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumDirectionalTracking(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const gridSize = 8;
  const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

  // Harf ızgarası oluştur
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => alphabet[getRandomInt(0, alphabet.length - 1)])
  );

  // Yön kodları ve gizli kelime oluştur
  const directions = ['→', '↓', '←', '↑'];
  const words = ['KEDİ', 'ELMA', 'OKUL'];
  
  const puzzles = words.map(word => {
    let r = getRandomInt(1, gridSize - 3);
    let c = getRandomInt(1, gridSize - 3);
    const path: { dir: string; letter: string }[] = [];
    
    for (let i = 0; i < word.length; i++) {
      grid[r][c] = word[i];
      if (i < word.length - 1) {
        const dir = directions[getRandomInt(0, 1)]; // Sağ veya aşağı
        path.push({ dir, letter: word[i] });
        if (dir === '→') c = Math.min(c + 1, gridSize - 1);
        else r = Math.min(r + 1, gridSize - 1);
      }
    }
    
    return { word, startPos: `Satır ${r + 1}, Sütun ${c + 1}`, commands: path.map(p => p.dir).join(' ') };
  });

  const builder = new WorksheetBuilder(ActivityType.DIRECTIONAL_TRACKING, 'Yönsel İz Sürme')
    .addPremiumHeader()
    .setInstruction('Başlangıç noktasından yön oklarını takip et. Topladığın harfler gizli kelimeyi oluşturur!')
    .addPedagogicalNote('Yönsel iz sürme, yön tayini, ardışık işlem ve çalışma belleği kapasitesini geliştirir. Soldan sağa okuma alışkanlığını pekiştirir.')
    .addPrimaryActivity('grid', {
      title: '🧭 Harf Izgarası',
      matrix: grid,
      gridSize: { rows: gridSize, cols: gridSize }
    });

  puzzles.forEach((puzzle, idx) => {
    builder.addPrimaryActivity('text', {
      content: `\n🎯 İz ${idx + 1}:\n   Başlangıç: ${puzzle.startPos}\n   Komutlar: ${puzzle.commands}\n   Gizli Kelime: ________________`
    });
  });

  builder.addSupportingDrill('Kendi Kodunu Yaz', {
    text: 'Bir kelime seç ve ızgaradaki konumunu kullanarak yön komutları yaz:',
    inputs: ['Kelime: ________', 'Komutlar: ________']
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// GÖRSEL TAKİP ÇİZGİLERİ (VISUAL_TRACKING_LINES) — Premium
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumVisualTrackingLines(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const lineCount = difficulty === 'Zor' ? 7 : difficulty === 'Orta' ? 5 : 3;

  const startLabels = 'ABCDEFGH'.split('').slice(0, lineCount);
  const endLabels = shuffle('12345678'.split('').slice(0, lineCount));

  const connections = startLabels.map((start, idx) => ({
    start,
    end: endLabels[idx],
    color: COLORS[idx % COLORS.length]?.css || '#000',
    description: `${start} harfinden başla, çizgiyi gözünle takip et`
  }));

  const builder = new WorksheetBuilder(ActivityType.VISUAL_TRACKING_LINES, 'Görsel Takip Çizgileri')
    .addPremiumHeader()
    .setInstruction('Harflerden başlayarak çizgileri sadece GÖZÜNLE takip et. Parmağını kullanma! Hangi rakama ulaştığını yaz.')
    .addPedagogicalNote('Görsel takip çizgileri, oküler motor kontrolü (saccadic movements), görsel dikkati ve el-göz koordinasyonunu geliştirir. Okuma sırasında satır atlamamayı destekler.')
    .addPrimaryActivity('tracking_lines', {
      title: '👁️ Gözünle Takip Et!',
      connections: connections.map(c => ({
        startLabel: c.start,
        endLabel: c.end,
        color: c.color
      })),
      answer_boxes: startLabels.map(s => `${s} → _____`)
    });

  // İkinci set: daha karmaşık
  if (difficulty !== 'Kolay') {
    const startLabels2 = 'İJKLMNO'.split('').slice(0, lineCount);
    const endLabels2 = shuffle('αβγδεζη'.split('').slice(0, lineCount));
    
    builder.addPrimaryActivity('tracking_lines', {
      title: '🔥 İleri Seviye',
      connections: startLabels2.map((s, i) => ({
        startLabel: s,
        endLabel: endLabels2[i],
        color: COLORS[(i + 3) % COLORS.length]?.css || '#000'
      })),
      answer_boxes: startLabels2.map(s => `${s} → _____`)
    });
  }

  builder.addSupportingDrill('Süre Kontrolü', {
    text: 'Her seti tamamlama süren:\nSet 1: _____ saniye\nSet 2: _____ saniye\nHedef: Her seferde daha hızlı!'
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// DİKKAT VE SORULAR (ATTENTION_TO_QUESTION) — Premium
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumAttentionToQuestion(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const alphabet = 'ABCÇDEFGĞHIİKLMNOÖPRSŞTUÜVYZ';
  const targetLetter = alphabet[getRandomInt(0, 10)]; // Sık kullanılan harflerden

  // Bölüm 1: Harf eleme matrisi
  const letterRows = Array.from({ length: 10 }, () => {
    const row = Array.from({ length: 25 }, () => {
      if (Math.random() > 0.85) return targetLetter;
      return alphabet[getRandomInt(0, alphabet.length - 1)];
    });
    return row.join(' ');
  });

  // Bölüm 2: Sayı eleme
  const numberRows = Array.from({ length: 5 }, () =>
    Array.from({ length: 20 }, () => getRandomInt(1, 99))
  );

  // Bölüm 3: Kelime içinde harf bulma
  const paragraph = 'Bugün hava çok güzel. Kuşlar ağaçlarda ötüyor. ' +
    'Çocuklar parkta oynuyor. Anneler bankta oturup sohbet ediyor. ' +
    'Güneş batıya doğru ilerliyor. Akşama doğru hava serinleyecek.';

  const builder = new WorksheetBuilder(ActivityType.ATTENTION_TO_QUESTION, 'Dikkat ve Sorular')
    .addPremiumHeader()
    .setInstruction(`Bölüm 1: "${targetLetter}" harfini bul ve üzerini çiz. Bölüm 2: Çift sayıları işaretle. Bölüm 3: Metindeki hedef kelimeyi bul.`)
    .addPedagogicalNote('Çok bölümlü dikkat çalışması: seçici dikkat (hedef bulma), sürdürülebilir dikkat (uzun süre odaklanma) ve bölünmüş dikkat (farklı türde görevler) becerilerini aynı anda geliştirir.')
    .addPrimaryActivity('text', {
      content: `📌 BÖLÜM 1: "${targetLetter}" Harfini Bul (Üzerini Çiz)\n\n` +
        letterRows.join('\n') +
        `\n\nToplam bulduğun "${targetLetter}": _______`
    })
    .addPrimaryActivity('table', {
      title: '📌 BÖLÜM 2: Çift Sayıları İşaretle',
      headers: Array.from({ length: 20 }, (_, i) => String(i + 1)),
      rows: numberRows.map(row => row.map(String))
    });

  builder.addSupportingDrill('📌 BÖLÜM 3: Kelimeleri Say', {
    text: `"${paragraph}"\n\nYukarıdaki metinde kaç kelime var? _______\nKaç cümle var? _______\n"güzel" kelimesi kaç kez geçiyor? _______`
  });

  return builder.addSuccessIndicator().build();
}
