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
  const { difficulty = 'Orta' } = options;
  const maxNum = difficulty === 'Zor' ? 50 : difficulty === 'Orta' ? 20 : 10;

  // Sihirli Kare 3x3
  const magicBase = getRandomInt(1, 3);
  const magicSquare = [
    [magicBase + 7, magicBase + 0, magicBase + 5],
    [magicBase + 2, magicBase + 4, magicBase + 6],
    [magicBase + 3, magicBase + 8, magicBase + 1]
  ];
  const targetSum = magicSquare[0].reduce((a, b) => a + b, 0);
  // Birkaç hücreyi gizle
  const hiddenMagic = magicSquare.map(row => row.map(val => Math.random() > 0.5 ? val : null));

  // Eksik işlem soruları
  const missingOps = Array.from({ length: 6 }, () => {
    const a = getRandomInt(2, maxNum);
    const b = getRandomInt(1, Math.min(a, maxNum / 2));
    const ops = ['+', '-', '×'];
    const op = ops[getRandomInt(0, difficulty === 'Zor' ? 2 : 1)];
    const result = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { a, op: '?', b, result, actualOp: op };
  });

  // Sayı piramidi
  const pyramidBase = Array.from({ length: 4 }, () => getRandomInt(1, maxNum / 4));
  const pyramidRows = [pyramidBase];
  let current = [...pyramidBase];
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length - 1; i++) next.push(current[i] + current[i + 1]);
    pyramidRows.push(next);
    current = next;
  }

  const builder = new WorksheetBuilder(ActivityType.MATH_PUZZLE, 'Matematik Bulmacaları')
    .addPremiumHeader()
    .setInstruction('Her bulmacayı dikkatlice çöz. İpuçlarını kullan!')
    .addPedagogicalNote('Matematik bulmacaları, cebirsel düşünme, ters işlem mantığı ve problem çözme stratejilerini geliştirir. Farklı türdeki bulmacalar bilişsel esnekliği artırır.');

  // Bölüm 1: Sihirli Kare
  builder.addPrimaryActivity('grid', {
    title: `🔮 Sihirli Kare (Satır, sütun ve çapraz toplamı = ${targetSum})`,
    matrix: hiddenMagic.map(row => row.map(v => v !== null ? String(v) : '?')),
    gridSize: { rows: 3, cols: 3 }
  });

  // Bölüm 2: Eksik İşlem
  builder.addPrimaryActivity('table', {
    title: '🔍 Eksik İşlemi Bul',
    headers: ['İşlem', 'Cevabın'],
    rows: missingOps.map((mo, i) =>
      [`${i + 1}.  ${mo.a} ☐ ${mo.b} = ${mo.result}`, '______']
    )
  });

  // Bölüm 3: Sayı Piramidi
  builder.addSupportingDrill('Sayı Piramidi (Üstteki = Alttaki ikisinin toplamı)', {
    pyramid: pyramidRows.reverse().map((row, rIdx) =>
      row.map((val, cIdx) => rIdx === 0 || Math.random() > 0.4 ? String(val) : '?')
    )
  });

  return builder.addSuccessIndicator().build();
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
    .addPedagogicalNote('Saat okuma, zamansal kavramları somutlaştırır ve günlük yaşam matematiğinin temelini oluşturur. Analog-dijital dönüşüm, sayı hissi ve çarpma/bölme ilişkisini pekiştirir.')
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
    .addPedagogicalNote('Para hesaplama, toplama-çıkarma işlemlerini somutlaştırır ve finansal okuryazarlığı geliştirir. Diskalkuli desteğinde, sayı-miktar ilişkisini günlük yaşam bağlamında pekiştirir.')
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
  const { difficulty = 'Orta' } = options;

  const patterns: { sequence: (number | null)[]; rule: string }[] = [];
  const maxVal = difficulty === 'Zor' ? 100 : difficulty === 'Orta' ? 50 : 20;

  // +N desenleri
  for (let i = 0; i < 3; i++) {
    const step = getRandomInt(2, difficulty === 'Zor' ? 7 : 4);
    const start = getRandomInt(1, 10);
    const seq = Array.from({ length: 7 }, (_, j) => start + step * j);
    const hideIdx = [getRandomInt(2, 4), getRandomInt(5, 6)];
    patterns.push({
      sequence: seq.map((v, idx) => hideIdx.includes(idx) ? null : v),
      rule: `+${step}`
    });
  }

  // ×N desenleri
  for (let i = 0; i < 2; i++) {
    const mult = getRandomInt(2, 3);
    const start = getRandomInt(1, 4);
    const seq = Array.from({ length: 6 }, (_, j) => start * Math.pow(mult, j));
    const hideIdx = [getRandomInt(2, 3), getRandomInt(4, 5)];
    patterns.push({
      sequence: seq.map((v, idx) => hideIdx.includes(idx) ? null : v),
      rule: `×${mult}`
    });
  }

  // -N desenleri
  for (let i = 0; i < 2; i++) {
    const step = getRandomInt(3, 6);
    const start = getRandomInt(40, maxVal);
    const seq = Array.from({ length: 7 }, (_, j) => start - step * j).filter(v => v > 0);
    if (seq.length >= 5) {
      const hideIdx = [getRandomInt(1, 2), getRandomInt(3, seq.length - 1)];
      patterns.push({
        sequence: seq.map((v, idx) => hideIdx.includes(idx) ? null : v),
        rule: `-${step}`
      });
    }
  }

  // Fibonacci benzeri
  const fibStart = [getRandomInt(1, 3), getRandomInt(2, 5)];
  const fib = [fibStart[0], fibStart[1]];
  for (let i = 2; i < 7; i++) fib.push(fib[i - 1] + fib[i - 2]);
  patterns.push({
    sequence: fib.map((v, idx) => [3, 5].includes(idx) ? null : v),
    rule: 'Önceki iki sayının toplamı'
  });

  const builder = new WorksheetBuilder(ActivityType.NUMBER_PATTERN, 'Sayı Örüntüleri')
    .addPremiumHeader()
    .setInstruction('Her dizideki kuralı bul ve "?" olan yerlere doğru sayıyı yaz.')
    .addPedagogicalNote('Sayı örüntüleri, serisel muhakeme ve cebirsel düşünmenin temelini oluşturur. Disleksi ve diskalkuli profillerinde, sayılar arası ilişki kurma becerisi sistematik pratikle güçlenir.')
    .addPrimaryActivity('table', {
      title: '🔢 Sayı Dizileri — Boşlukları Doldur',
      headers: ['#', 'Dizi', 'Kural'],
      rows: patterns.slice(0, 10).map((p, i) => [
        `${i + 1}`,
        p.sequence.map(v => v !== null ? String(v) : '___').join(', '),
        '____________'
      ])
    })
    .addSupportingDrill('Kendi Dizini Oluştur', {
      text: 'Bir kural seç ve 6 sayılık bir dizi yaz:',
      inputs: ['Kural: ____________', 'Dizi: ___, ___, ___, ___, ___, ___']
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// SAYI PİRAMİDİ (NUMBER_PYRAMID)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumNumberPyramid(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const baseSize = difficulty === 'Zor' ? 5 : difficulty === 'Orta' ? 4 : 3;
  const maxBase = difficulty === 'Zor' ? 15 : 10;

  const pyramids = Array.from({ length: 4 }, () => {
    const base = Array.from({ length: baseSize }, () => getRandomInt(1, maxBase));
    const rows: (number | null)[][] = [base];
    let current = [...base];
    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length - 1; i++) next.push(current[i] + current[i + 1]);
      rows.push(next);
      current = next;
    }
    // Rastgele bazı hücreleri gizle (%40)
    return rows.map(row => row.map(val => Math.random() > 0.4 ? val : null));
  });

  const builder = new WorksheetBuilder(ActivityType.NUMBER_PYRAMID, 'Sayı Piramitleri')
    .addPremiumHeader()
    .setInstruction('Kural: Üstteki kutu = altındaki iki kutunun toplamı. Boş kutuları doldur.')
    .addPedagogicalNote('Sayı piramitleri, toplama akıcılığı ve ters işlem (çıkarma) becerisini eş zamanlı geliştirir. Çok yönlü düşünme ve stratejik çözüm gerektirir.')
    .addPrimaryActivity('grid', {
      title: '🔺 Toplama Piramitleri',
      pyramids: pyramids.map((p, idx) => ({
        id: idx + 1,
        rows: p.reverse().map(row => row.map(v => v !== null ? String(v) : '?'))
      }))
    })
    .addSupportingDrill('Ters Piramit (Fark)', {
      text: 'Bu sefer kural: Üstteki = alttaki ikisinin FARKI. Doldur!',
      pyramid: [[null], [12, null], [null, 5, 3]]
    });

  return builder.addSuccessIndicator().build();
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
    .setInstruction('Her senaryoyu dikkatlice oku. İşlemlerini kutuda göster, cevabını yaz.')
    .addPedagogicalNote('Gerçek hayat problemleri, matematiksel modelleme ve transfer becerisini geliştirir. Somut bağlamlar, soyut işlemlerin anlamlandırılmasını sağlar. Diskalkuli desteğinde günlük yaşam aritmetiği kritik bir müdahale alanıdır.');

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
    .addPedagogicalNote('Görsel aritmetik, somut işlemden soyut işleme geçişi destekler. Nesnelerle sayma, diskalkuli profillerinde sayı-miktar ilişkisini güçlendirir.')
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
    .addPedagogicalNote('Sayı hissi, sayısal büyüklük algısının temelidir. Anlık karşılaştırma ve yaklaşık hesaplama, matematiksel sezgiyi güçlendirir.')
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
    .addPedagogicalNote('Tahmin becerisi, sayısal sezgiyi ve büyüklük algısını geliştirir. Kesin hesap yapmadan yaklaşık sonuç bulma, günlük hayatta en sık kullanılan matematik becerisidir.')
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
// KENDOKU
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumKendoku(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  // 4x4 kendoku: basit yapı
  const solutions4: number[][] = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 3, 4, 1],
    [4, 1, 2, 3]
  ];

  // Kafesleri tanımla
  const cages4 = [
    { cells: ['0,0', '0,1'], target: 3, op: '+' },
    { cells: ['0,2', '0,3'], target: 7, op: '+' },
    { cells: ['1,0', '1,1'], target: 7, op: '+' },
    { cells: ['1,2', '2,2'], target: 5, op: '+' },
    { cells: ['1,3', '2,3'], target: 3, op: '+' },
    { cells: ['2,0', '3,0'], target: 6, op: '+' },
    { cells: ['2,1', '3,1'], target: 4, op: '+' },
    { cells: ['3,2', '3,3'], target: 5, op: '+' },
  ];

  // Bazı hücreleri göster (%30)
  const shown4 = solutions4.map(row => row.map(v => Math.random() > 0.7 ? v : null));

  const builder = new WorksheetBuilder(ActivityType.KENDOKU, 'Kendoku Bulmacaları')
    .addPremiumHeader()
    .setInstruction('Kural: Her satır ve sütunda 1-4 arası sayılar birer kez bulunur. Kafes toplamları verilmiştir.')
    .addPedagogicalNote('Kendoku, cebirsel düşünme ve kısıtlama çözümleme becerilerini geliştirir. Dört işlem fluency\'si ve mantıksal eliminasyon bir arada çalışır.')
    .addPrimaryActivity('grid', {
      title: '🧩 Kendoku 4×4',
      matrix: shown4.map(row => row.map(v => v !== null ? String(v) : '')),
      cages: cages4
    })
    .addSupportingDrill('İpucu Rehberi', {
      text: 'Hangi kafesle başlamalısın?\n1. En az hücreli kafesin toplamına bak.\n2. Satır/sütun bilgisini kullan.\n3. Olasılığı azalt, sonra doldur.'
    });

  return builder.addSuccessIndicator().build();
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
    .addPedagogicalNote('Dört işlem drili, işlemsel akıcılığı (operational fluency) geliştirir. Otomatikleşen temel işlemler, üst düzey problem çözme için bilişsel kaynak serbest bırakır.')
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
