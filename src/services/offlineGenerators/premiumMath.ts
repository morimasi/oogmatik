import { GeneratorOptions, SingleWorksheetData, ActivityType } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getRandomItems, shuffle, getRandomInt, getWordsForDifficulty } from './helpers';

/**
 * premiumMath.ts — Premium Matematik & Mantık Offline Motorları
 *
 * 12 aktivite türü için özel offline jeneratörler.
 * Her motor A4 "dolu dolu" Premium standartlarında çıktı üretir.
 */

// ═══════════════════════════════════════════════════════════════
// MATEMATİK BULMACALARI
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumMathPuzzle(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', itemCount = 2 } = options;
  const count = Math.max(1, Math.min(6, itemCount || 2));

  const objectPool = [
    { name: 'Elma', icon: '🍎' }, { name: 'Armut', icon: '🍐' }, { name: 'Muz', icon: '🍌' },
    { name: 'Portakal', icon: '🍊' }, { name: 'Çilek', icon: '🍓' }, { name: 'Üzüm', icon: '🍇' },
    { name: 'Top', icon: '⚽' }, { name: 'Kitap', icon: '📚' }, { name: 'Yıldız', icon: '🌟' },
    { name: 'Kedi', icon: '🐱' }, { name: 'Köpek', icon: '🐶' }, { name: 'Tavşan', icon: '🐰' }
  ];

  const puzzles = Array.from({ length: count ?? 1 }, (_, pIdx) => {
    const selectedObjects: any[] = getRandomItems(objectPool, 3);
    const v1 = getRandomInt(1, difficulty === 'Zor' ? 15 : 10);
    const v2 = getRandomInt(1, difficulty === 'Zor' ? 10 : 8);
    const v3 = getRandomInt(1, difficulty === 'Zor' ? 8 : 5);

    selectedObjects[0].value = v1;
    selectedObjects[1].value = v2;
    selectedObjects[2].value = v3;

    const equations = [
      {
        leftSide: [{ objectName: selectedObjects[0].name, multiplier: 1 }, { objectName: selectedObjects[0].name, multiplier: 1 }],
        rightSide: v1 + v1
      },
      {
        leftSide: [{ objectName: selectedObjects[0].name, multiplier: 1 }, { objectName: selectedObjects[1].name, multiplier: 1 }],
        rightSide: v1 + v2
      },
      {
        leftSide: [{ objectName: selectedObjects[1].name, multiplier: 1 }, { objectName: selectedObjects[2].name, multiplier: 1 }],
        rightSide: v2 + v3
      }
    ];

    return {
      id: `p_${pIdx + 1}`,
      objects: selectedObjects.map(o => ({
        name: o.name,
        imagePrompt: `minimalist ${o.name} icon, vector art style`,
        value: o.value
      })),
      equations: equations,
      finalQuestion: `${selectedObjects[0].name} + ${selectedObjects[2].name}`,
      answer: v1 + v3
    };
  });

  const builder = new WorksheetBuilder(ActivityType.MATH_PUZZLE, 'Premium Matematik Bulmacaları')
    .addPremiumHeader()
    .setInstruction('Aşağıdaki görsel denklemleri dikkatlice incele ve bilinmeyenleri bularak soru işaretini cevapla.')
    .addSuccessIndicator();

  return {
    ...builder.build(),
    puzzles: puzzles,
    data: { puzzles } // Renderer uyumu için
  };
}

// ═══════════════════════════════════════════════════════════════
// SAAT OKUMA
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumClockReading(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;

  const clocks = Array.from({ length: 6 }, () => {
    const h = getRandomInt(1, 12);
    const mOptions = difficulty === 'Zor' ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
      : difficulty === 'Orta' ? [0, 15, 30, 45] : [0, 30];
    const m = mOptions[getRandomInt(0, mOptions.length - 1)];
    return { hour: h, minute: m, digital: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
  });

  const timeProblems = [
    { q: 'Okul saat 08:30\'da başlıyor. 45 dakika sonra teneffüs. Teneffüs saat kaçta?', a: '09:15' },
    { q: 'Film saat 14:00\'te başladı ve 1 saat 30 dakika sürdü. Saat kaçta bitti?', a: '15:30' },
    { q: 'Akşam yemeği saat 19:00\'da. Şu an 17:30. Kaç dakika kaldı?', a: '90 dakika' },
  ];

  const builder = new WorksheetBuilder(ActivityType.CLOCK_READING, 'Saat Okuma Çalışması')
    .addPremiumHeader()
    .setInstruction('Analog saatleri oku ve dijital karşılığını yaz. Zaman problemlerini çöz.')
    .addPrimaryActivity('table', {
      title: '⏰ Bölüm 1: Saati Oku ve Yaz',
      headers: ['#', 'Analog Saat (Akrep/Yelkovan)', 'Dijital Saat'],
      rows: clocks.map((c, i) => [
        `${i + 1}`,
        `Akrep: ${c.hour} | Yelkovan: ${c.minute === 0 ? '12' : c.minute / 5}`,
        '______:______'
      ])
    })
    .addSupportingDrill('⏱️ Zaman Problemleri', {
      questions: timeProblems.map((tp, i) => `${i + 1}. ${tp.q}\nCevap: ____________`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// PARALARIMIZ (MONEY_COUNTING)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumMoneyCounting(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const coins = ['1 TL', '5 TL', '10 TL', '20 TL', '50 TL', '100 TL'];
  const kuruslar = ['5 kuruş', '10 kuruş', '25 kuruş', '50 kuruş'];

  const countingProblems = [
    { items: ['10 TL', '10 TL', '5 TL', '1 TL'], total: 26 },
    { items: ['50 TL', '20 TL', '5 TL', '5 TL'], total: 80 },
    { items: ['100 TL', '50 TL', '10 TL'], total: 160 },
    { items: ['20 TL', '20 TL', '10 TL', '5 TL', '1 TL'], total: 56 },
  ];

  const shoppingProblems = [
    { item: 'Defter', price: 15, paid: 20, change: 5 },
    { item: 'Silgi + Kalem', price: 8, paid: 10, change: 2 },
    { item: 'Çikolata', price: 7, paid: 50, change: 43 },
  ];

  const builder = new WorksheetBuilder(ActivityType.MONEY_COUNTING, 'Paralarımız')
    .addPremiumHeader()
    .setInstruction('Paraları say, topla ve alışveriş hesaplarını yap.')
    .addPrimaryActivity('table', {
      title: '💰 Bölüm 1: Paraları Say ve Topla',
      headers: ['#', 'Paralar', 'Toplam'],
      rows: countingProblems.map((cp, i) => [
        `${i + 1}`, cp.items.join(' + '), '_______ TL'
      ])
    })
    .addSupportingDrill('🛒 Bölüm 2: Alışveriş ve Para Üstü', {
      questions: shoppingProblems.map((sp, i) =>
        `${i + 1}. ${sp.item} ${sp.price} TL. ${sp.paid} TL verdin. Para üstü: _______ TL`
      )
    });

  // Bonus: Bütçe Planlama
  builder.addPrimaryActivity('text', {
    content: '📋 BONUS: 50 TL bütçen var. Aşağıdakilerden hangilerini alabilirsin?\n' +
      '• Defter: 12 TL  • Kalem: 5 TL  • Silgi: 3 TL  • Boya: 18 TL  • Cetvel: 7 TL\n\n' +
      'Aldıklarım: ________________________________\nToplam: _______ TL  Kalan: _______ TL'
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// SAYI ÖRÜNTÜLERİ (NUMBER_PATTERN)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumNumberPattern(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', customSettings } = options;
  const settings = (customSettings as any) || {};

  const patternKind = settings.patternKind || options.patternKind || 'mixed'; // 'addition' | 'subtraction' | 'multiplication' | 'fibonacci' | 'mixed'
  const problemCount = options.problemCount || settings.problemCount || 8;
  const showRuleClue = settings.showRuleClue !== false;

  const patterns: Array<{
    id: string;
    sequence: Array<number | null>;
    fullSequence: number[];
    missingIndices: number[];
    answer: number;
    ruleDescription: string;
    ruleType: string;
  }> = [];

  const typesToGenerate = patternKind === 'mixed'
    ? ['add', 'subtract', 'multiply', 'add', 'subtract', 'fibonacci', 'add', 'multiply']
    : [patternKind];

  for (let i = 0; i < problemCount; i++) {
    const currentType = typesToGenerate[i % typesToGenerate.length];
    let fullSeq: number[] = [];
    let ruleText = '';
    let answerVal = 0;

    if (currentType === 'add') {
      const step = difficulty === 'Zor' ? getRandomInt(5, 12) : getRandomInt(2, 6);
      const start = getRandomInt(1, 20);
      fullSeq = Array.from({ length: 7 }, (_, j) => start + step * j);
      ruleText = `Her adımda +${step} ekleniyor`;
    } else if (currentType === 'subtract') {
      const step = difficulty === 'Zor' ? getRandomInt(4, 9) : getRandomInt(2, 5);
      const start = getRandomInt(50, 99);
      fullSeq = Array.from({ length: 7 }, (_, j) => start - step * j);
      ruleText = `Her adımda -${step} eksiliyor`;
    } else if (currentType === 'multiply') {
      const mult = difficulty === 'Zor' ? 3 : 2;
      const start = getRandomInt(1, 4);
      fullSeq = Array.from({ length: 6 }, (_, j) => start * Math.pow(mult, j));
      ruleText = `Her adım ×${mult} ile çarpılıyor`;
    } else if (currentType === 'fibonacci') {
      const a = getRandomInt(1, 3);
      const b = getRandomInt(2, 4);
      fullSeq = [a, b];
      for (let j = 2; j < 7; j++) {
        fullSeq.push(fullSeq[j - 1] + fullSeq[j - 2]);
      }
      ruleText = 'Son iki sayının toplamı';
    } else {
      const step = getRandomInt(3, 7);
      const start = getRandomInt(5, 15);
      fullSeq = Array.from({ length: 7 }, (_, j) => start + step * j);
      ruleText = `Her adımda +${step}`;
    }

    // Pick 1 or 2 missing positions for single unique solution
    const missingIdx = getRandomInt(2, fullSeq.length - 2);
    answerVal = fullSeq[missingIdx];

    const displaySeq = fullSeq.map((val, idx) => (idx === missingIdx ? null : val));

    patterns.push({
      id: `p-${i + 1}`,
      sequence: displaySeq,
      fullSequence: fullSeq,
      missingIndices: [missingIdx],
      answer: answerVal,
      ruleDescription: ruleText,
      ruleType: currentType
    });
  }

  const builder = new WorksheetBuilder(ActivityType.NUMBER_PATTERN, 'Sayı Örüntüleri & Dizisel Mantık')
    .addPremiumHeader()
    .setInstruction('Sayı dizilerindeki mantıksal örüntü kuralını keşfet ve boş bırakılan kutucuklara doğru sayıları yaz.')
    .addSuccessIndicator();

  return {
    ...builder.build(),
    patterns,
    showRuleClue,
    difficulty,
    problemCount
  };
}

// ═══════════════════════════════════════════════════════════════
// SAYI PİRAMİDİ (NUMBER_PYRAMID)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumNumberPyramid(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', customSettings } = options;
  const settings = (customSettings as any) || {};

  const baseSize = settings.pyramidHeight || options.pyramidHeight || (difficulty === 'Zor' ? 5 : difficulty === 'Orta' ? 4 : 3);
  const puzzleCount = settings.puzzleCount || options.puzzleCount || (baseSize >= 5 ? 2 : 4);
  const operation = settings.operation || 'addition'; // 'addition' | 'subtraction' | 'multiplication'

  const maxBase = difficulty === 'Zor' ? 12 : difficulty === 'Orta' ? 8 : 5;

  const pyramids = Array.from({ length: puzzleCount }, (_, pIdx) => {
    let base: number[] = [];
    if (operation === 'subtraction') {
      base = Array.from({ length: baseSize }, () => getRandomInt(10, 30)).sort((a, b) => b - a);
    } else if (operation === 'multiplication') {
      base = Array.from({ length: baseSize }, () => getRandomInt(2, 4));
    } else {
      base = Array.from({ length: baseSize }, () => getRandomInt(1, maxBase));
    }

    const fullRows: number[][] = [base];
    let current = [...base];

    while (current.length > 1) {
      const next: number[] = [];
      for (let i = 0; i < current.length - 1; i++) {
        if (operation === 'subtraction') {
          next.push(Math.abs(current[i] - current[i + 1]));
        } else if (operation === 'multiplication') {
          next.push(current[i] * current[i + 1]);
        } else {
          next.push(current[i] + current[i + 1]);
        }
      }
      fullRows.push(next);
      current = next;
    }

    // Mask strategy for single unique solution
    // We reveal enough cells so that every unrevealed cell can be computed directly
    const displayRows: (number | null)[][] = fullRows.map((row, rIdx) => {
      if (rIdx === 0) {
        // Tabanda bazılarını gizle
        return row.map((val, cIdx) => (cIdx % 2 === 0 ? val : null));
      } else if (rIdx === fullRows.length - 1) {
        // En tepeyi göster veya gizle
        return row.map(() => (Math.random() > 0.5 ? row[0] : null));
      } else {
        return row.map((val, cIdx) => ((rIdx + cIdx) % 2 === 1 ? val : null));
      }
    });

    return {
      id: `pyr_${pIdx + 1}`,
      size: baseSize,
      operation,
      fullRows,
      displayRows: displayRows.reverse(), // Top to bottom order for UI
      solutionTop: fullRows[fullRows.length - 1][0]
    };
  });

  const builder = new WorksheetBuilder(ActivityType.NUMBER_PYRAMID, 'Sayı Piramitleri')
    .addPremiumHeader()
    .setInstruction('Kural: Üstteki kutu = altındaki komşu iki kutunun işlem sonucuna eşittir. Boş kutuları tamamla.')
    .addSuccessIndicator();

  return {
    ...builder.build(),
    pyramids,
    baseSize,
    puzzleCount,
    operation
  };
}

// ═══════════════════════════════════════════════════════════════
// GERÇEK HAYAT MATEMATİK PROBLEMLERİ
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumRealLifeMath(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;

  const problems = [
    { scenario: '🛒 Market', text: 'Annen seni markete gönderdi. 3 ekmek (her biri 8 TL) ve 2 litre süt (her biri 25 TL) alacaksın.', q1: 'Toplam ne kadar ödersin?', q2: '100 TL verirsen para üstü ne olur?' },
    { scenario: '🎂 Doğum Günü', text: 'Partiye 12 arkadaşın gelecek. Her kişi 3 dilim pizza yiyecek. Her pizzada 8 dilim var.', q1: 'Toplam kaç dilim pizza lazım?', q2: 'Kaç pizza sipariş etmelisin?' },
    { scenario: '🚌 Otobüs Yolculuğu', text: 'Otobüs saat 09:15\'te hareket ediyor. Yolculuk 2 saat 45 dakika sürüyor.', q1: 'Varış saatin kaç olur?', q2: 'Eğer 30 dakika rötar yaparsa?' },
    { scenario: '📚 Kütüphane', text: 'Bu ay 4 kitap okudun. İlk kitap 86, ikinci 124, üçüncü 92, dördüncü 158 sayfa.', q1: 'Toplam kaç sayfa okudun?', q2: 'Ortalama kitap uzunluğu nedir?' },
    { scenario: '🏃 Spor Günü', text: 'Okul bahçesinin çevresi 200 metre. Bugün 3 tam tur attın.', q1: 'Toplam kaç metre koştun?', q2: 'Her tur 4 dakika sürdüyse, toplam kaç dakika koştun?' },
    { scenario: '🌱 Bahçe', text: 'Bahçeye 4 sıra domates dikeceksin. Her sıraya 6 fide konacak.', q1: 'Toplam kaç fide lazım?', q2: 'Her fide 5 TL ise, toplam maliyet ne olur?' },
  ];

  const builder = new WorksheetBuilder(ActivityType.REAL_LIFE_MATH_PROBLEMS, 'Gerçek Hayat Problemleri')
    .addPremiumHeader()
    .setInstruction('Her senaryoyu dikkatlice oku. İşlemlerini kutuda göster, cevabını yaz.');

  problems.forEach((p, idx) => {
    builder.addPrimaryActivity('text', {
      content: `${p.scenario} Problem ${idx + 1}\n${p.text}\n\na) ${p.q1}\n   İşlem: _____________ Cevap: _____________\n\nb) ${p.q2}\n   İşlem: _____________ Cevap: _____________`
    });
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// GÖRSEL ARİTMETİK
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumVisualArithmetic(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const items = ['🍎', '🍌', '⚽', '📚', '🌟', '🐱'];
  const equations = Array.from({ length: 8 }, () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(1, 5);
    const itemA = items[getRandomInt(0, items.length - 1)];
    const itemB = items[getRandomInt(0, items.length - 1)];
    return {
      visual: `${itemA.repeat(a)} + ${itemB.repeat(b)}`,
      equation: `${a} + ${b}`,
      answer: a + b
    };
  });

  const reverseEqs = [
    { visual: '🍎🍎🍎 + ??? = 🍎🍎🍎🍎🍎', answer: '🍎🍎 (2)' },
    { visual: '⚽⚽⚽⚽ − ⚽⚽ = ???', answer: '⚽⚽ (2)' },
    { visual: '📚 × 3 = ???', answer: '📚📚📚 (3)' },
  ];

  const builder = new WorksheetBuilder(ActivityType.VISUAL_ARITHMETIC, 'Görsel Aritmetik')
    .addPremiumHeader()
    .setInstruction('Nesneleri sayarak işlemi çöz ve sonucu yaz.')
    .addPrimaryActivity('table', {
      title: '🎨 Nesnelerle Toplama',
      headers: ['#', 'Görsel İşlem', 'Sonuç'],
      rows: equations.map((eq, i) => [`${i + 1}`, eq.visual, '______'])
    })
    .addSupportingDrill('Tersine Mühendislik', {
      questions: reverseEqs.map((re, i) => `${i + 1}. ${re.visual}  →  Cevap: ____________`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// SAYI HİSSİ (NUMBER_SENSE)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumNumberSense(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const comparisons = Array.from({ length: 10 }, () => {
    const a = getRandomInt(10, 99);
    const b = getRandomInt(10, 99);
    return { a, b, symbol: '___' };
  });

  const estimations = [
    { q: '49 + 52 ≈ ?', hint: '~50 + ~50', approx: 100 },
    { q: '98 + 103 ≈ ?', hint: '~100 + ~100', approx: 200 },
    { q: '27 × 4 ≈ ?', hint: '~25 × 4 veya ~30 × 4', approx: 108 },
    { q: '312 − 198 ≈ ?', hint: '~300 − ~200', approx: 114 },
  ];

  const builder = new WorksheetBuilder(ActivityType.NUMBER_SENSE, 'Sayı Hissi Çalışması')
    .addPremiumHeader()
    .setInstruction('Sayıları karşılaştır (<, >, =), tahmini sonuçları bul.')
    .addPrimaryActivity('table', {
      title: '⚖️ Büyük mü Küçük mü?  ( <  >  = )',
      headers: ['Sayı 1', 'Karşılaştırma', 'Sayı 2'],
      rows: comparisons.map(c => [String(c.a), '______', String(c.b)])
    })
    .addSupportingDrill('🎯 Tahmini Hesaplama', {
      questions: estimations.map((e, i) => `${i + 1}. ${e.q}   İpucu: ${e.hint}\n   Tahminin: ______`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// TAHMİN (ESTIMATION)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumEstimation(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const jarItems = [
    { item: 'Bilye', actualCount: 47, clue: 'Kavanozun yarısı dolu' },
    { item: 'Şeker', actualCount: 82, clue: 'Kavanoz taşmak üzere' },
    { item: 'Düğme', actualCount: 23, clue: 'Kavanozun çeyreği dolu' },
    { item: 'Boncuk', actualCount: 65, clue: 'Kavanozun 2/3\'ü dolu' },
    { item: 'Fındık', actualCount: 34, clue: 'Bir avuçtan biraz fazla' },
  ];

  const lengthItems = [
    { item: 'Sınıf tahtası', approx: '3 metre' },
    { item: 'Bir kalem', approx: '18 cm' },
    { item: 'Kapı yüksekliği', approx: '2 metre' },
  ];

  const builder = new WorksheetBuilder(ActivityType.ESTIMATION, 'Tahmin Çalışması')
    .addPremiumHeader()
    .setInstruction('Her soru için önce tahminini yaz. Sonra kontrol et!')
    .addPrimaryActivity('table', {
      title: '🏺 Kaç Tane Var?',
      headers: ['#', 'Kavanozda Ne Var?', 'İpucu', 'Tahmin', 'Gerçek'],
      rows: jarItems.map((ji, i) => [`${i + 1}`, ji.item, ji.clue, '______', '______'])
    })
    .addSupportingDrill('📏 Ne Kadar Uzun?', {
      questions: lengthItems.map((li, i) => `${i + 1}. ${li.item} ne kadar uzundur?\n   Tahminim: ____________`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// KENDOKU (İŞLEM BLOKLARI)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumKendoku(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', customSettings } = options;
  const settings = (customSettings as any)?.kendoku || (customSettings as any) || {};

  const size = settings.gridSize || options.gridSize || (difficulty === 'Zor' ? 5 : difficulty === 'Orta' ? 4 : 3);
  const puzzleCount = settings.puzzleCount || options.puzzleCount || (size >= 5 ? 2 : 4);

  // Determine available operations
  const operationSet = settings.operationSet || 'add_sub';
  let operations = ['+'];
  if (operationSet === 'add_sub') operations = ['+', '-'];
  if (operationSet === 'all_ops') operations = ['+', '-', '×', '÷'];

  const hintRatio = settings.hintRatio !== undefined ? settings.hintRatio : 15;
  const showOperators = settings.showOperators !== false;

  const puzzles = [];

  for (let pIdx = 0; pIdx < puzzleCount; pIdx++) {
    // Generate Latin Square of size N
    const baseRow = Array.from({ length: size }, (_, i) => i + 1);
    const latinSquare: number[][] = [];
    for (let r = 0; r < size; r++) {
      const shift = (r + pIdx) % size;
      latinSquare.push([...baseRow.slice(shift), ...baseRow.slice(0, shift)]);
    }

    // Partition grid into cages
    const cages: Array<{
      id: string;
      cells: Array<[number, number]>;
      target: number;
      op: string;
    }> = [];

    const visited = Array.from({ length: size }, () => Array(size).fill(false));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (visited[r][c]) continue;

        const cageCells: Array<[number, number]> = [[r, c]];
        visited[r][c] = true;

        // Neighboring cell logic
        const neighbors: Array<[number, number]> = [];
        if (r + 1 < size && !visited[r + 1][c]) neighbors.push([r + 1, c]);
        if (c + 1 < size && !visited[r][c + 1]) neighbors.push([r, c + 1]);

        if (neighbors.length > 0 && Math.random() > 0.25) {
          const next = neighbors[getRandomInt(0, neighbors.length - 1)];
          cageCells.push(next);
          visited[next[0]][next[1]] = true;
        }

        // Calculate target and operator
        const vals = cageCells.map(([cr, cc]) => latinSquare[cr][cc]);
        let op = operations[getRandomInt(0, operations.length - 1)] || '+';
        let target = 0;

        if (cageCells.length === 1) {
          op = '';
          target = vals[0];
        } else if (op === '+') {
          target = vals.reduce((acc, v) => acc + v, 0);
        } else if (op === '-') {
          target = Math.abs(vals[0] - vals[1]);
        } else if (op === '×') {
          target = vals.reduce((acc, v) => acc * v, 1);
        } else if (op === '÷') {
          const maxVal = Math.max(vals[0], vals[1]);
          const minVal = Math.min(vals[0], vals[1]);
          if (maxVal % minVal === 0) {
            target = maxVal / minVal;
          } else {
            op = '+';
            target = vals[0] + vals[1];
          }
        }

        cages.push({
          id: `c_${r}_${c}`,
          cells: cageCells,
          target,
          op: showOperators ? op : ''
        });
      }
    }

    // Pre-filled hint cells based on hintRatio
    const initialGrid = latinSquare.map((row) =>
      row.map((val) => (Math.random() * 100 < hintRatio ? val : null))
    );

    puzzles.push({
      id: `puz_${pIdx + 1}`,
      size,
      solution: latinSquare,
      initialGrid,
      cages
    });
  }

  const builder = new WorksheetBuilder(ActivityType.KENDOKU, 'Kendoku Bulmacaları')
    .addPremiumHeader()
    .setInstruction('Her satır ve sütunda 1-N arası sayılar birer kez bulunur. Kafeslerdeki işlem sonuçlarına göre boşlukları doldur.')
    .addSuccessIndicator();

  return {
    ...builder.build(),
    puzzles,
    gridSize: size,
    puzzleCount,
    showOperators
  };
}

// ═══════════════════════════════════════════════════════════════
// MATEMATİK STÜDYOSU (MATH_STUDIO) — Temel Dril
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumMathStudio(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const maxNum = difficulty === 'Zor' ? 100 : difficulty === 'Orta' ? 50 : 20;

  const drills = {
    toplama: Array.from({ length: 5 }, () => {
      const a = getRandomInt(1, maxNum); const b = getRandomInt(1, maxNum);
      return `${a} + ${b} = ______`;
    }),
    cikarma: Array.from({ length: 5 }, () => {
      const a = getRandomInt(10, maxNum); const b = getRandomInt(1, a);
      return `${a} − ${b} = ______`;
    }),
    carpma: Array.from({ length: 5 }, () => {
      const a = getRandomInt(2, 12); const b = getRandomInt(2, 9);
      return `${a} × ${b} = ______`;
    }),
    bolme: Array.from({ length: 5 }, () => {
      const b = getRandomInt(2, 9); const result = getRandomInt(2, 10); const a = b * result;
      return `${a} ÷ ${b} = ______`;
    }),
  };

  const wordProblems = [
    'Bahçede 15 kırmızı ve 8 sarı gül var. Toplam kaç gül vardır?',
    'Ali\'nin 42 bilyesi var. 17 tanesini arkadaşına verdi. Kaç bilyesi kaldı?',
    'Her kutuda 6 kalem var. 4 kutu alırsan kaç kalemin olur?',
  ];

  const builder = new WorksheetBuilder(ActivityType.MATH_STUDIO, 'Matematik Drili')
    .addPremiumHeader()
    .setInstruction('Her bölümdeki işlemleri çöz. Süre tutabilirsin!')
    .addPrimaryActivity('dual_column', {
      left: {
        title: '➕ Toplama',
        items: drills.toplama
      },
      right: {
        title: '➖ Çıkarma',
        items: drills.cikarma
      }
    });

  builder.addPrimaryActivity('dual_column', {
    left: {
      title: '✖️ Çarpma',
      items: drills.carpma
    },
    right: {
      title: '➗ Bölme',
      items: drills.bolme
    }
  });

  builder.addSupportingDrill('📝 Sözel Problemler', {
    questions: wordProblems.map((p, i) => `${i + 1}. ${p}\n   İşlem: _________ Cevap: _________`)
  });

  return builder.addSuccessIndicator().build();
}
