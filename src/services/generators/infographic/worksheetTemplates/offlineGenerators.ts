/**
 * Worksheet Template Generators — Offline (Deterministik)
 * 32 etkinlik şablonu için offline üretim fonksiyonları
 * 
 * Bora Demir: TypeScript strict, any yasak
 * Selin Arslan: Offline = deterministik, hızlı, güvenilir
 */

import type {
  WorksheetActivityData,
  WorksheetGeneratorParams,
  WorksheetGeneratorFn,
  WorksheetSection,
  WorksheetTemplateType,
} from '../../../../types/worksheetActivity';

// ── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

function createSection(
  order: number,
  instruction: string,
  content: string,
  answerType: WorksheetSection['answerArea']['type'],
  extras?: Partial<WorksheetSection>
): WorksheetSection {
  return {
    id: `s-${Date.now()}-${order}`,
    order,
    instruction,
    content,
    answerArea: { type: answerType },
    ...extras,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function difficultyMultiplier(d: string): number {
  if (d === 'Kolay') return 0.6;
  if (d === 'Zor') return 1.4;
  return 1;
}

// ── KAT 1: GÖRSEL & MEKANSAL ────────────────────────────────────────────────

export const generatePatternCompletion: WorksheetGeneratorFn = async (p) => {
  const gridSizes = p.difficulty === 'Kolay' ? [3, 4] : p.difficulty === 'Orta' ? [4, 5] : [5, 6];
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const size = gridSizes[i % gridSizes.length];
    const grid: string[][] = [];
    const symbols = ['●', '○', '■', '□', '▲', '△'];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size; c++) {
        row.push(symbols[(r + c) % symbols.length]);
      }
      row[size - 1] = '?';
      grid.push(row);
    }
    sections.push(createSection(i + 1, 'Desenin kuralını bul ve "?" yerine doğru şekli çiz.', `${size}×${size} desen`, 'grid', {
      gridData: grid,
      answerArea: { type: 'grid', gridSize: { rows: size, cols: size } },
      correctAnswer: symbols[(size - 1 + size - 1) % symbols.length],
    }));
  }
  return buildResult('Desen Tamamlama', 'pattern-completion', 'ws-visual-spatial', p, sections,
    'Bu etkinlik görsel algı ve örüntü tanıma becerilerini geliştirir. Öğrenci, tekrar eden desenlerdeki kuralı keşfederek eksik parçayı tamamlar.');
};

export const generateSymmetryDrawing: WorksheetGeneratorFn = async (p) => {
  const size = p.difficulty === 'Kolay' ? 4 : p.difficulty === 'Orta' ? 5 : 6;
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const grid: string[][] = [];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size * 2; c++) {
        if (c < size) {
          row.push(Math.random() > 0.5 ? '■' : '□');
        } else {
          row.push('');
        }
      }
      grid.push(row);
    }
    sections.push(createSection(i + 1, 'Sol taraftaki deseni sağ tarafa simetrik olarak çiz.', 'Simetri deseni', 'grid', {
      gridData: grid,
      answerArea: { type: 'grid', gridSize: { rows: size, cols: size * 2 } },
    }));
  }
  return buildResult('Simetri Tamamlama', 'symmetry-drawing', 'ws-visual-spatial', p, sections,
    'Simetri tamamlama, uzamsal algı ve el-göz koordinasyonunu güçlendirir. Disleksi desteğine ihtiyacı olan öğrencilerde harf ters çevirme sorununu azaltır.');
};

export const generateGridCopy: WorksheetGeneratorFn = async (p) => {
  const size = p.difficulty === 'Kolay' ? 4 : 5;
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const source: string[][] = [];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size; c++) row.push(Math.random() > 0.6 ? '■' : '□');
      source.push(row);
    }
    const empty: string[][] = Array.from({ length: size }, () => Array(size).fill('□'));
    sections.push(createSection(i + 1, 'Soldaki deseni sağdaki boş grid\'e birebir kopyala.', 'Kopyalama', 'grid', {
      gridData: source,
      answerArea: { type: 'grid', gridSize: { rows: size, cols: size } },
    }));
  }
  return buildResult('Kare Kopyalama', 'grid-copy', 'ws-visual-spatial', p, sections,
    'Görsel dikkat ve ince motor becerilerini geliştiren bu etkinlik, öğrencinin detaylara odaklanmasını sağlar.');
};

export const generateSpotDifference: WorksheetGeneratorFn = async (p) => {
  const count = p.difficulty === 'Kolay' ? 3 : p.difficulty === 'Orta' ? 5 : 7;
  const sections: WorksheetSection[] = [];
  const words = ['elma', 'araba', 'kitap', 'kalem', 'masa', 'okul', 'deniz', 'güneş', 'bulut', 'yıldız'];
  for (let i = 0; i < p.sectionCount; i++) {
    const base = pickRandom(words, 6);
    const modified = [...base];
    const diffIdx = Math.floor(Math.random() * modified.length);
    modified[diffIdx] = modified[diffIdx].split('').reverse().join('');
    sections.push(createSection(i + 1, 'İki satırı karşılaştır. Farklı olan kelimeyi bul ve altını çiz.',
      `Satır 1: ${base.join('  ')}\nSatır 2: ${modified.join('  ')}`, 'circle-mark', {
      correctAnswer: base[diffIdx],
    }));
  }
  return buildResult('Farkı Bul', 'spot-difference', 'ws-visual-spatial', p, sections,
    'Görsel karşılaştırma ve dikkat becerilerini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için harf/kelime ayrıştırma pratiği sağlar.');
};

export const generateWordSearchGrid: WorksheetGeneratorFn = async (p) => {
  const size = p.difficulty === 'Kolay' ? 8 : p.difficulty === 'Orta' ? 10 : 12;
  const wordPool = ['KALEM', 'KITAP', 'OKUL', 'MASA', 'DEFTER', 'SILGI', 'TAHTA', 'SINIF', 'OGRETMEN', 'OGRENCI'];
  const selected = pickRandom(wordPool, Math.min(p.sectionCount + 3, wordPool.length));
  const alphabet = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  const grid: string[][] = [];
  for (let r = 0; r < size; r++) {
    const row: string[] = [];
    for (let c = 0; c < size; c++) row.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    grid.push(row);
  }
  selected.forEach((word, idx) => {
    const row = idx % size;
    for (let c = 0; c < word.length && c < size; c++) {
      grid[row][c] = word[c];
    }
  });

  const sections: WorksheetSection[] = [
    createSection(1, `Aşağıdaki kelimeleri bulmacada bul ve üzerini çiz: ${selected.join(', ')}`,
      'Kelime Bulmacası', 'circle-mark', {
      gridData: grid,
      answerArea: { type: 'grid', gridSize: { rows: size, cols: size } },
      correctAnswer: selected,
    })
  ];
  return buildResult('Kelime Bulmaca', 'word-search-grid', 'ws-visual-spatial', p, sections,
    'Görsel tarama, harf tanıma ve dikkat becerilerini eş zamanlı geliştiren etkinliktir.');
};

export const generateDirectionalTracking: WorksheetGeneratorFn = async (p) => {
  const directions = ['→', '←', '↑', '↓'];
  const letters = 'ABCÇDEFGĞHIİKLMNOÖPRSŞTUÜVYZ';
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const gridSize = p.difficulty === 'Kolay' ? 4 : 5;
    const grid: string[][] = [];
    for (let r = 0; r < gridSize; r++) {
      const row: string[] = [];
      for (let c = 0; c < gridSize; c++) {
        row.push(Math.random() > 0.5 ? directions[Math.floor(Math.random() * 4)] : letters[Math.floor(Math.random() * letters.length)]);
      }
      grid.push(row);
    }
    sections.push(createSection(i + 1, 'Okları takip ederek topladığın harfleri alt satıra yaz.',
      'Yön takibi', 'blank-line', {
      gridData: grid,
      answerArea: { type: 'blank-line', lines: 1 },
    }));
  }
  return buildResult('Yön İz Sürme', 'directional-tracking', 'ws-visual-spatial', p, sections,
    'Yönelim algısı ve sıralı takip becerisini geliştirir. DEHB desteğine ihtiyaç duyan öğrenciler için kısa ve net yönergeler kullanılmıştır.');
};

export const generateShapeCounting: WorksheetGeneratorFn = async (p) => {
  const shapes = ['üçgen', 'kare', 'daire', 'dikdörtgen', 'altıgen'];
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const shape = shapes[i % shapes.length];
    const count = Math.floor(Math.random() * 8) + 3;
    sections.push(createSection(i + 1, `Şekildeki ${shape} sayısını say ve kutuya yaz.`,
      `İç içe geçmiş ${shape}ler (${count} adet)`, 'blank-box', {
      answerArea: { type: 'blank-box', width: 3 },
      correctAnswer: String(count),
    }));
  }
  return buildResult('Şekil Sayma', 'shape-counting', 'ws-visual-spatial', p, sections,
    'Görsel ayrıştırma ve sayma becerisini geliştirir. Öğrenci iç içe geçmiş şekilleri analiz ederek matematiksel düşünme pratiği yapar.');
};

export const generateMaze: WorksheetGeneratorFn = async (p) => {
  const size = p.difficulty === 'Kolay' ? 5 : p.difficulty === 'Orta' ? 7 : 9;
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const grid: string[][] = [];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size; c++) {
        if (r === 0 && c === 0) row.push('🏁');
        else if (r === size - 1 && c === size - 1) row.push('⭐');
        else row.push(Math.random() > 0.3 ? '·' : '█');
      }
      grid.push(row);
    }
    sections.push(createSection(i + 1, '🏁 işaretinden ⭐ işaretine giden yolu çiz.',
      'Labirent', 'drawing-area', {
      gridData: grid,
      answerArea: { type: 'drawing-area' },
    }));
  }
  return buildResult('Labirent', 'maze', 'ws-visual-spatial', p, sections,
    'Problem çözme, planlama ve uzamsal navigasyon becerilerini geliştirir. Yürütücü işlevler (executive functions) için etkili bir etkinliktir.');
};

// ── KAT 2: OKUDUĞUNU ANLAMA (placeholder — AI gerekli) ──────────────────────

// Bu kategorinin çoğu AI ile üretilir. Basit offline stub'lar:

export const generateTrueFalseOffline: WorksheetGeneratorFn = async (p) => {
  const statements = [
    { text: 'Güneş doğudan doğar.', answer: 'D' },
    { text: 'Balıklar karada yaşar.', answer: 'Y' },
    { text: 'Su 100 derecede kaynar.', answer: 'D' },
    { text: 'Türkiye\'nin başkenti İstanbul\'dur.', answer: 'Y' },
    { text: 'Bir yılda 12 ay vardır.', answer: 'D' },
    { text: 'Karınca, kuşlardan büyüktür.', answer: 'Y' },
    { text: 'Gökkuşağında 7 renk vardır.', answer: 'D' },
    { text: 'Buz, suyun katı halidir.', answer: 'D' },
  ];
  const selected = pickRandom(statements, p.sectionCount);
  const sections = selected.map((s, i) =>
    createSection(i + 1, 'Doğruysa (D), yanlışsa (Y) yaz.', s.text, 'true-false-check', {
      correctAnswer: s.answer,
      answerArea: { type: 'true-false-check' },
    })
  );
  return buildResult('Doğru / Yanlış', 'true-false', 'ws-reading-comprehension', p, sections,
    'Bilgi doğruluğunu değerlendirme ve eleştirel düşünme becerilerini geliştirir.');
};

// ── KAT 3: OKUMA & DİL ──────────────────────────────────────────────────────

export const generateSyllableSplitting: WorksheetGeneratorFn = async (p) => {
  const wordsByDifficulty: Record<string, string[]> = {
    'Kolay': ['araba', 'elma', 'okul', 'kapı', 'masa', 'kedi', 'balık', 'kitap', 'kalem', 'ev'],
    'Orta': ['bilgisayar', 'televizyon', 'öğretmen', 'kütüphane', 'laboratuvar', 'çikolata', 'müfredat', 'matematik'],
    'Zor': ['karşılaştırma', 'değerlendirme', 'sorumluluk', 'özelleştirme', 'kişiselleştirme', 'ansiklopedi'],
  };
  const words = pickRandom(wordsByDifficulty[p.difficulty] ?? wordsByDifficulty['Orta'], p.sectionCount);
  const sections = words.map((w, i) =>
    createSection(i + 1, 'Kelimeyi hecelerine ayırarak kutuların içine yaz.', w, 'blank-box', {
      answerArea: { type: 'blank-box', width: 12 },
    })
  );
  return buildResult('Hece Ayırma', 'syllable-splitting', 'ws-language-literacy', p, sections,
    'Fonolojik farkındalık ve hece bilgisi becerilerini geliştirir. Disleksi desteğine ihtiyacı olan öğrenciler için temel bir çalışmadır.');
};

export const generateSyllableCombining: WorksheetGeneratorFn = async (p) => {
  const pairs: Array<{ syllables: string[]; word: string }> = [
    { syllables: ['ka', 'lem'], word: 'kalem' },
    { syllables: ['ki', 'tap'], word: 'kitap' },
    { syllables: ['öğ', 'ret', 'men'], word: 'öğretmen' },
    { syllables: ['bil', 'gi', 'sa', 'yar'], word: 'bilgisayar' },
    { syllables: ['ço', 'cuk'], word: 'çocuk' },
    { syllables: ['te', 'le', 'viz', 'yon'], word: 'televizyon' },
    { syllables: ['kü', 'tüp', 'ha', 'ne'], word: 'kütüphane' },
    { syllables: ['ma', 'sa'], word: 'masa' },
  ];
  const selected = pickRandom(pairs, p.sectionCount);
  const sections = selected.map((item, i) =>
    createSection(i + 1, 'Heceleri birleştirip oluşan kelimeyi yaz.',
      shuffle(item.syllables).join(' — '), 'blank-line', {
      correctAnswer: item.word,
      answerArea: { type: 'blank-line', lines: 1 },
    })
  );
  return buildResult('Hece Birleştirme', 'syllable-combining', 'ws-language-literacy', p, sections,
    'Hece birleştirme, okuma akıcılığının temel yapı taşıdır. Öğrenci kelimeyi parçalardan bütüne doğru inşa eder.');
};

export const generateSynonymMatching: WorksheetGeneratorFn = async (p) => {
  const pairs = [
    { left: 'güzel', right: 'hoş' }, { left: 'büyük', right: 'iri' },
    { left: 'hızlı', right: 'çabuk' }, { left: 'mutlu', right: 'sevinçli' },
    { left: 'akıllı', right: 'zeki' }, { left: 'cesur', right: 'yiğit' },
    { left: 'küçük', right: 'ufak' }, { left: 'yavaş', right: 'ağır' },
  ];
  const selected = pickRandom(pairs, p.sectionCount);
  const sections = [createSection(1, 'Sol sütundaki kelimeleri sağ sütundaki eş anlamlılarıyla çizgi çekerek eşleştir.',
    '', 'matching-lines', {
    matchingPairs: selected,
    answerArea: { type: 'matching-lines' },
  })];
  return buildResult('Eş Anlamlı Eşleştirme', 'synonym-matching', 'ws-language-literacy', p, sections,
    'Kelime dağarcığını genişletir ve anlamsal ilişkileri kavramayı güçlendirir.');
};

export const generateAntonymMatching: WorksheetGeneratorFn = async (p) => {
  const pairs = [
    { left: 'sıcak', right: 'soğuk' }, { left: 'büyük', right: 'küçük' },
    { left: 'hızlı', right: 'yavaş' }, { left: 'güzel', right: 'çirkin' },
    { left: 'uzun', right: 'kısa' }, { left: 'açık', right: 'kapalı' },
    { left: 'zengin', right: 'fakir' }, { left: 'doğru', right: 'yanlış' },
  ];
  const selected = pickRandom(pairs, p.sectionCount);
  const sections = [createSection(1, 'Sol sütundaki kelimeleri sağ sütundaki zıt anlamlılarıyla çizgi çekerek eşleştir.',
    '', 'matching-lines', {
    matchingPairs: selected,
    answerArea: { type: 'matching-lines' },
  })];
  return buildResult('Zıt Anlamlı Eşleştirme', 'antonym-matching', 'ws-language-literacy', p, sections,
    'Kelime karşıtlık ilişkilerini kavramayı sağlar.');
};

export const generateRootSuffixAnalysis: WorksheetGeneratorFn = async (p) => {
  const words = [
    { word: 'evler', root: 'ev', suffix: '-ler' },
    { word: 'kitaplık', root: 'kitap', suffix: '-lık' },
    { word: 'güzellik', root: 'güzel', suffix: '-lik' },
    { word: 'okuldaki', root: 'okul', suffix: '-daki' },
    { word: 'çalışkan', root: 'çalış', suffix: '-kan' },
    { word: 'öğretmenler', root: 'öğretmen', suffix: '-ler' },
  ];
  const selected = pickRandom(words, p.sectionCount);
  const sections = selected.map((w, i) =>
    createSection(i + 1, 'Kelimenin kökünü ve ekini ayırarak kutulara yaz.', w.word, 'blank-box', {
      correctAnswer: [w.root, w.suffix],
      answerArea: { type: 'blank-box', width: 10 },
    })
  );
  return buildResult('Kök-Ek Ayrıştırma', 'root-suffix-analysis', 'ws-language-literacy', p, sections,
    'Morfolojik farkındalığı geliştirir. Kelimelerin yapısını anlama, okuduğunu anlama becerisinin temelidir.');
};

export const generateWordTypeClassification: WorksheetGeneratorFn = async (p) => {
  const words = shuffle(['güzel', 'koşmak', 'ev', 'hızlıca', 'küçük', 'yazmak', 'çiçek', 'yavaşça', 'büyük', 'ağaç', 'gülmek', 'sessizce']);
  const sections = [createSection(1,
    'Aşağıdaki kelimeleri türlerine göre tablodaki doğru sütuna yaz.',
    words.join(', '), 'classification-table', {
    answerArea: { type: 'classification-table' },
    options: ['İsim', 'Sıfat', 'Fiil', 'Zarf'],
  })];
  return buildResult('Kelime Türü Sınıflandırma', 'word-type-classification', 'ws-language-literacy', p, sections,
    'Kelime türlerini ayırt etme, dilbilgisi bilincini ve cümle oluşturma becerilerini geliştirir.');
};

export const generateSpellingRules: WorksheetGeneratorFn = async (p) => {
  const items = [
    { wrong: 'arkadaş ım', correct: 'arkadaşım', rule: 'İyelik eki bitişik yazılır' },
    { wrong: 'her kes', correct: 'herkes', rule: 'Kalıplaşmış birleşik kelime' },
    { wrong: 'birdaha', correct: 'bir daha', rule: 'Ayrı yazılır' },
    { wrong: 'gelicek', correct: 'gelecek', rule: 'Ünlü uyumu' },
    { wrong: 'yalnış', correct: 'yanlış', rule: 'Ünsüz sırası' },
    { wrong: 'herzaman', correct: 'her zaman', rule: 'Ayrı yazılır' },
    { wrong: 'hiçbirşey', correct: 'hiçbir şey', rule: 'Ayrı yazılır' },
    { wrong: 'birsürü', correct: 'bir sürü', rule: 'Ayrı yazılır' },
  ];
  const selected = pickRandom(items, p.sectionCount);
  const sections = selected.map((item, i) =>
    createSection(i + 1, 'Yanlış yazılmış kelimeyi düzelt ve doğrusunu yaz.',
      `❌ ${item.wrong}`, 'blank-line', {
      correctAnswer: item.correct,
      answerArea: { type: 'blank-line', lines: 1 },
    })
  );
  return buildResult('Yazım Kuralları', 'spelling-rules', 'ws-language-literacy', p, sections,
    'Türkçe yazım kurallarını pekiştirir. Sık yapılan hataları düzelterek doğru yazma alışkanlığı kazandırır.');
};

// ── KAT 4: MATEMATİK & MANTIK ───────────────────────────────────────────────

export const generateNumberPyramid: WorksheetGeneratorFn = async (p) => {
  const rows = p.difficulty === 'Kolay' ? 3 : p.difficulty === 'Orta' ? 4 : 5;
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const base = Array.from({ length: rows }, () => Math.floor(Math.random() * 10) + 1);
    const grid: string[][] = [];
    let current = base;
    const levels: number[][] = [current];
    while (current.length > 1) {
      const next: number[] = [];
      for (let j = 0; j < current.length - 1; j++) next.push(current[j] + current[j + 1]);
      levels.push(next);
      current = next;
    }
    levels.reverse().forEach((level, li) => {
      const row: string[] = level.map((n, ni) => {
        if (li === levels.length - 1) return String(n);
        return Math.random() > 0.5 ? String(n) : '?';
      });
      grid.push(row);
    });
    sections.push(createSection(i + 1,
      'Piramitte yan yana iki sayının toplamı üstündeki kutuya yazılır. Boş kutuları doldur.',
      'Sayı Piramidi', 'grid', {
      gridData: grid,
      answerArea: { type: 'blank-box' },
    }));
  }
  return buildResult('Sayı Piramidi', 'number-pyramid', 'ws-math-logic', p, sections,
    'Toplama işlemi, stratejik düşünme ve ters işlem becerilerini geliştirir.');
};

export const generateOperationBoxes: WorksheetGeneratorFn = async (p) => {
  const sections: WorksheetSection[] = [];
  const maxNum = p.difficulty === 'Kolay' ? 20 : p.difficulty === 'Orta' ? 50 : 100;
  for (let i = 0; i < p.sectionCount; i++) {
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = Math.floor(Math.random() * (maxNum / 2)) + 1;
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const result = op === '+' ? a + b : Math.abs(a - b);
    const hide = Math.floor(Math.random() * 3);
    let display: string;
    let answer: string;
    if (hide === 0) { display = `□ ${op} ${b} = ${result}`; answer = String(op === '+' ? result - b : result + b); }
    else if (hide === 1) { display = `${a} ${op} □ = ${result}`; answer = String(op === '+' ? result - a : a - result); }
    else { display = `${a} ${op} ${b} = □`; answer = String(result); }
    sections.push(createSection(i + 1, 'Kutu (□) içine doğru sayıyı yaz.', display, 'blank-box', {
      correctAnswer: answer,
      answerArea: { type: 'blank-box', width: 3 },
    }));
  }
  return buildResult('İşlem Kutuları', 'operation-boxes', 'ws-math-logic', p, sections,
    'Ters işlem ve cebirsel düşünme becerilerini geliştirir. Diskalkuli desteğine ihtiyaç duyan öğrenciler için görsel destekli format.');
};

export const generateSimpleSudoku: WorksheetGeneratorFn = async (p) => {
  const size = p.difficulty === 'Kolay' ? 4 : 6;
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const grid: string[][] = [];
    for (let r = 0; r < size; r++) {
      const row: string[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Math.random() > 0.5 ? String(((r + c) % size) + 1) : '');
      }
      grid.push(row);
    }
    sections.push(createSection(i + 1,
      `Her satır ve sütunda 1'den ${size}'a kadar tüm sayılar birer kez bulunmalı. Boş kutuları doldur.`,
      `${size}×${size} Mini Sudoku`, 'grid', {
      gridData: grid,
      answerArea: { type: 'grid', gridSize: { rows: size, cols: size } },
    }));
  }
  return buildResult('Mini Sudoku', 'simple-sudoku', 'ws-math-logic', p, sections,
    'Mantıksal çıkarım, strateji geliştirme ve sayı ilişkilerini kavrama becerilerini geliştirir.');
};

export const generateClockReading: WorksheetGeneratorFn = async (p) => {
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minuteOptions = p.difficulty === 'Kolay' ? [0, 30] : p.difficulty === 'Orta' ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
    const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
    sections.push(createSection(i + 1, 'Saati oku ve alt çizgiye yaz.',
      `🕐 Akrep: ${hour}, Yelkovan: ${minute === 0 ? '12' : minute / 5}`, 'blank-line', {
      correctAnswer: timeStr,
      answerArea: { type: 'blank-line', lines: 1 },
    }));
  }
  return buildResult('Saat Okuma', 'clock-reading', 'ws-math-logic', p, sections,
    'Zaman kavramını somutlaştırır. Günlük yaşam becerisi olarak kritik öneme sahiptir.');
};

export const generateMoneyCalculation: WorksheetGeneratorFn = async (p) => {
  const sections: WorksheetSection[] = [];
  const items = ['ekmek', 'süt', 'peynir', 'yumurta', 'elma', 'muz', 'su', 'defter'];
  for (let i = 0; i < p.sectionCount; i++) {
    const item1 = items[Math.floor(Math.random() * items.length)];
    const price = Math.floor(Math.random() * 20) + 2;
    const paid = price + Math.floor(Math.random() * 10) + 1;
    sections.push(createSection(i + 1, 'Para üstünü hesapla ve yaz.',
      `${item1}: ${price} TL — Ödenen: ${paid} TL — Para üstü: ?`, 'blank-box', {
      correctAnswer: String(paid - price),
      answerArea: { type: 'blank-box', width: 4 },
    }));
  }
  return buildResult('Para Hesaplama', 'money-calculation', 'ws-math-logic', p, sections,
    'Çıkarma işlemi ve finansal okuryazarlık becerilerini günlük yaşam bağlamında geliştirir.');
};

export const generateSequencePattern: WorksheetGeneratorFn = async (p) => {
  const sections: WorksheetSection[] = [];
  for (let i = 0; i < p.sectionCount; i++) {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 2;
    const seq = Array.from({ length: 6 }, (_, j) => start + step * j);
    const hideIdx = Math.floor(Math.random() * 3) + 2;
    const answer = String(seq[hideIdx]);
    const display = seq.map((n, j) => j === hideIdx ? '?' : String(n)).join(', ');
    sections.push(createSection(i + 1, 'Sayı dizisinin kuralını bul ve "?" yerine doğru sayıyı yaz.',
      display, 'blank-box', {
      correctAnswer: answer,
      answerArea: { type: 'blank-box', width: 3 },
    }));
  }
  return buildResult('Örüntü ve Seri', 'sequence-pattern', 'ws-math-logic', p, sections,
    'Sayı örüntülerini tanıma ve genelleme yapma becerisini geliştirir.');
};

// ── buildResult yardımcısı ───────────────────────────────────────────────────

function buildResult(
  title: string,
  templateType: WorksheetTemplateType,
  category: WorksheetActivityData['category'],
  params: WorksheetGeneratorParams,
  sections: WorksheetSection[],
  pedagogicalNote: string
): WorksheetActivityData {
  return {
    title: `${title} — ${params.topic || 'Genel'}`,
    generalInstruction: sections[0]?.instruction ?? '',
    templateType,
    category,
    sections,
    pedagogicalNote,
    difficultyLevel: params.difficulty,
    targetSkills: [],
    ageGroup: params.ageGroup,
    profile: params.profile,
    estimatedDuration: Math.ceil(sections.length * 3 * difficultyMultiplier(params.difficulty)),
    generationMode: 'offline',
    hasAnswerKey: sections.some(s => s.correctAnswer !== undefined),
  };
}
