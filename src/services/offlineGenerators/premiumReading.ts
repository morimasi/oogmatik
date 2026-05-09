import { GeneratorOptions, SingleWorksheetData, ActivityType } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';
import { getRandomItems, shuffle, getRandomInt, getWordsForDifficulty, syllabifyWord, turkishAlphabet, EMOJI_MAP } from './helpers';

/**
 * premiumReading.ts — Premium Okuma & Dil Offline Motorları
 *
 * 7 aktivite türü için özel, pedagojik olarak zengin,
 * A4 sayfasını "dolu dolu" dolduran offline jeneratörler.
 *
 * NOT: dyslexiaSupport.ts'deki mevcut motorlar (SYLLABLE_MASTER_LAB,
 * MIRROR_LETTERS, RAPID_NAMING vb.) korunmuştur. Bu dosya eksikleri tamamlar.
 */

// ═══════════════════════════════════════════════════════════════
// HECE PARKURU
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumHeceParkuru(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Rastgele' } = options;
  const words = getWordsForDifficulty(difficulty, topic);
  const selected = getRandomItems(words, 24);

  const items = selected.map(word => {
    const syllables = syllabifyWord(word);
    return {
      word,
      syllables,
      syllableCount: syllables.length,
      isOpen: syllables.map(s => /[aeıioöuü]$/i.test(s))
    };
  });

  // Gruplara ayır: 2 heceli, 3 heceli, 4+ heceli
  const groups = [
    { label: '2 Heceli Kelimeler', items: items.filter(i => i.syllableCount === 2).slice(0, 8) },
    { label: '3 Heceli Kelimeler', items: items.filter(i => i.syllableCount === 3).slice(0, 8) },
    { label: '4+ Heceli Kelimeler', items: items.filter(i => i.syllableCount >= 4).slice(0, 8) },
  ];

  const builder = new WorksheetBuilder(ActivityType.HECE_PARKURU, 'Hece Parkuru')
    .addPremiumHeader()
    .setInstruction('Kelimeleri hecelere ayır. Açık heceleri (sesliyle biten) 🟢, kapalı heceleri (ünsüzle biten) 🔴 ile işaretle.');

  groups.forEach(group => {
    if (group.items.length > 0) {
      builder.addPrimaryActivity('table', {
        title: group.label,
        headers: ['Kelime', 'Heceleri Yaz', 'Hece Sayısı'],
        rows: group.items.map(item => [
          item.word,
          item.syllables.map((s, i) => `${i + 1}. ________`).join('  '),
          `[ ${item.syllableCount} ]`
        ])
      });
    }
  });

  builder.addSupportingDrill('Hece Sayma Yarışı', {
    questions: [
      '"Otomobil" kelimesi kaç heceden oluşur?',
      '"Araba" kelimesinin 2. hecesi nedir?',
      '3 heceli bir hayvan ismi yaz.',
    ]
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// HARF İKİLİSİ DEDEKTİFİ (FIND_LETTER_PAIR)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumFindLetterPair(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;
  const allPairs = ['ba', 'de', 'ka', 'li', 'mu', 'to', 'se', 'na', 'rı', 'gü'];
  const distractors: Record<string, string[]> = {
    'ba': ['da', 'bo', 'ab', 'pa'],
    'de': ['be', 'di', 'ed', 'te'],
    'ka': ['ga', 'ko', 'ak', 'ha'],
    'li': ['lı', 'le', 'il', 'ni'],
    'mu': ['nu', 'mi', 'um', 'bu'],
    'to': ['do', 'tu', 'ot', 'go'],
    'se': ['ze', 'si', 'es', 'ce'],
    'na': ['ma', 'ne', 'an', 'la'],
    'rı': ['ri', 'ra', 'ır', 'tı'],
    'gü': ['gu', 'gö', 'üg', 'kü'],
  };

  const target = allPairs[getRandomInt(0, allPairs.length - 1)];
  const rows = 12;
  const cols = 15;
  const targetCount = difficulty === 'Zor' ? 15 : difficulty === 'Orta' ? 10 : 7;
  const dist = distractors[target] || ['xx', 'yy', 'zz'];

  // Matris oluştur
  const matrix: string[][] = [];
  const positions = new Set<string>();
  
  // Hedefleri yerleştir
  while (positions.size < targetCount) {
    const r = getRandomInt(0, rows - 1);
    const c = getRandomInt(0, cols - 1);
    positions.add(`${r},${c}`);
  }

  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      if (positions.has(`${r},${c}`)) {
        row.push(target);
      } else {
        // Distractor veya rastgele çift
        row.push(Math.random() > 0.3 
          ? dist[getRandomInt(0, dist.length - 1)]
          : allPairs[getRandomInt(0, allPairs.length - 1)]
        );
      }
    }
    matrix.push(row);
  }

  const builder = new WorksheetBuilder(ActivityType.FIND_LETTER_PAIR, 'Harf İkilisi Dedektifi')
    .addPremiumHeader()
    .setInstruction(`Aşağıdaki matristeki tüm "${target.toUpperCase()}" harf ikililerini bul ve daire içine al.`)
    .addPrimaryActivity('grid', {
      matrix,
      targetPair: target,
      gridSize: { rows, cols }
    })
    .addSupportingDrill('Sayım ve Kontrol', {
      questions: [
        `Toplam kaç tane "${target}" buldun? Sayı: ______`,
        `"${target}" en çok hangi satırda bulunuyor?`,
        `"${dist[0]}" ile "${target}" arasındaki fark nedir?`,
      ]
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// HECE DEDEKTİFİ (SYLLABLE_WORD_BUILDER)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumSyllableWordBuilder(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Rastgele' } = options;
  const words = getWordsForDifficulty(difficulty, topic);
  const selected = getRandomItems(words, 8);

  const items = selected.map(word => {
    const syllables = syllabifyWord(word);
    return {
      original: word,
      scrambled: shuffle([...syllables]),
      syllableCount: syllables.length,
      hint: `${word.charAt(0).toUpperCase()}... ile başlar`
    };
  });

  const builder = new WorksheetBuilder(ActivityType.SYLLABLE_WORD_BUILDER, 'Hece Dedektifi')
    .addPremiumHeader()
    .setInstruction('Karışık heceleri doğru sıraya koyarak anlamlı kelimeyi oluştur. İpuçlarını kullan!')
    .addPrimaryActivity('table', {
      headers: ['#', 'Karışık Heceler', 'İpucu', 'Doğru Kelime'],
      rows: items.map((item, i) => [
        `${i + 1}`,
        item.scrambled.join(' — '),
        item.hint,
        '________________'
      ])
    })
    .addSupportingDrill('Kendi Kelimeni Oluştur', {
      text: 'Aşağıdaki hecelerden 3 farklı kelime oluştur:',
      syllablePool: ['ka', 'le', 'mi', 'ta', 'ba', 'lık', 'ar', 'ma'],
      inputs: ['1. ________', '2. ________', '3. ________']
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// AKRABALİK İLİŞKİLERİ (FAMILY_RELATIONS)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumFamilyRelations(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const family = {
    grandpa: 'Hasan Dede',
    grandma: 'Ayşe Nine',
    father: 'Ali',
    mother: 'Fatma',
    uncle: 'Mehmet (Amca)',
    aunt: 'Zeynep (Hala)',
    child1: 'Can',
    child2: 'Elif',
    cousin: 'Burak (Amca oğlu)'
  };

  const questions = [
    { q: `${family.child1}, ${family.grandpa}'nın nesi olur?`, a: 'Torunu' },
    { q: `${family.mother}, ${family.uncle}'in nesi olur?`, a: 'Yengesi' },
    { q: `${family.cousin}, ${family.child2}'in nesi olur?`, a: 'Kuzeni' },
    { q: `${family.aunt}, ${family.child1}'ın nesi olur?`, a: 'Halası' },
    { q: `${family.grandma}, ${family.mother}'nın nesi olur?`, a: 'Kayınvalidesi' },
    { q: `${family.father}, ${family.cousin}'un nesi olur?`, a: 'Amcası' },
  ];

  const trueFalse = [
    { statement: `${family.child2}, ${family.grandma}'nın kızıdır.`, answer: false },
    { statement: `${family.uncle}, ${family.father}'nin kardeşidir.`, answer: true },
    { statement: `${family.cousin}, ${family.child1}'ın amca çocuğudur.`, answer: true },
    { statement: `${family.aunt}, ${family.mother}'nın kız kardeşidir.`, answer: false },
    { statement: `${family.grandpa}, ${family.cousin}'un dedesidir.`, answer: true },
  ];

  const builder = new WorksheetBuilder(ActivityType.FAMILY_RELATIONS, 'Akrabalık İlişkileri')
    .addPremiumHeader()
    .setInstruction('Aile şemasını incele, soruları cevapla ve doğru/yanlış ifadeleri değerlendir.')
    .addPrimaryActivity('dual_column', {
      left: {
        title: '👪 Aile Şeması',
        content: `Dede: ${family.grandpa} & Nine: ${family.grandma}\n` +
          `├─ ${family.father} (Baba) & ${family.mother} (Anne)\n` +
          `│  ├─ ${family.child1}\n│  └─ ${family.child2}\n` +
          `├─ ${family.uncle}\n│  └─ ${family.cousin}\n` +
          `└─ ${family.aunt}`
      },
      right: {
        title: '❓ Eşleştirme Soruları',
        questions: questions.map((q, i) => `${i + 1}. ${q.q}\nCevap: ____________`)
      }
    })
    .addSupportingDrill('Doğru mu? Yanlış mı?', {
      items: trueFalse.map((tf, i) => `${i + 1}. "${tf.statement}"  →  D / Y`)
    });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// AKRABALİK MANTIK TESTİ (FAMILY_LOGIC_TEST)
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumFamilyLogicTest(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const scenarios = [
    {
      text: 'Ali\'nin iki çocuğu var: Mert ve Sude. Mert, Sude\'den büyük. Ali\'nin babası Kemal Bey, torunlarını çok sever.',
      questions: [
        'Kemal Bey, Mert\'in nesidir?',
        'Sude, Ali\'nin nesidir?',
        'Mert, Sude\'nin nesidir?',
      ]
    },
    {
      text: 'Elif\'in annesi Aysel, Aysel\'in kız kardeşi Sevgi. Sevgi\'nin oğlu Barış, Elif ile aynı okulda okuyor.',
      questions: [
        'Sevgi, Elif\'in nesidir?',
        'Barış, Elif\'in nesidir?',
        'Aysel, Barış\'ın nesidir?',
      ]
    }
  ];

  const scenario = scenarios[getRandomInt(0, scenarios.length - 1)];

  const builder = new WorksheetBuilder(ActivityType.FAMILY_LOGIC_TEST, 'Akrabalık Mantık Testi')
    .addPremiumHeader()
    .setInstruction('Hikayeyi dikkatlice oku. Ardından akrabalık sorularını mantıksal çıkarım yaparak cevapla.')
    .addPrimaryActivity('text', {
      content: `📖 HİKAYE:\n\n${scenario.text}`
    })
    .addSupportingDrill('Mantık Soruları', {
      questions: scenario.questions.map((q, i) => `${i + 1}. ${q}\nCevap: ________________`)
    });

  // Ek bölüm: Kendi sorusu
  builder.addPrimaryActivity('text', {
    content: '✏️ ŞİMDİ SEN SOR:\nYukarıdaki hikayeden bir akrabalık sorusu yaz:\n\nSoru: ________________________________________________\nCevap: ________________________________________________'
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// EKSİK PARÇALAR (MISSING_PARTS)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// EKSİK PARÇALARI TAMAMLAMA (MISSING_PARTS) - ULTRA PRO PREMIUM
// ═══════════════════════════════════════════════════════════════
export async function generateOfflineMissingParts(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Genel' } = options;

  // 1. Zenginleştirilmiş Cümle Havuzu
  const sentenceTemplates = [
    { s: 'Güneş her sabah ___ ufkundan doğarak dünyamızı aydınlatır.', a: 'doğu', d: ['batı', 'kuzey', 'gün'] },
    { s: 'Okula giderken ___ çantamı yanıma almayı asla unutmam.', a: 'ağır', d: ['hafif', 'mavi', 'eski'] },
    { s: 'En sevdiğim kitapları ___ sessizce okumaktan büyük zevk alırım.', a: 'kütüphanede', d: ['parkta', 'okulda', 'evde'] },
    { s: 'Kış mevsiminde kar yağdığında dışarıda ___ oynamayı çok seviyoruz.', a: 'kartopu', d: ['saklambaç', 'futbol', 'basketbol'] },
    { s: 'Sağlıklı büyümek için her sabah ___ içmek çok faydalıdır.', a: 'süt', d: ['meyve suyu', 'su', 'çay'] },
    { s: 'Öğretmenimiz tahtaya ___ ile çok güzel bir resim çizdi.', a: 'tebeşir', d: ['kalem', 'boya', 'silgi'] },
    { s: 'Bahçedeki çiçekler ___ beklediği için boyunlarını bükmüştü.', a: 'sulanmayı', d: ['sevilmeyi', 'koparılmayı', 'güneşi'] },
    { s: 'Kitap okumak insanın ___ dünyasını zenginleştiren bir alışkanlıktır.', a: 'hayal', d: ['gerçek', 'oyun', 'dünya'] },
    { s: 'Doğayı korumak için çöplerimizi mutlaka ___ atmalıyız.', a: 'çöp kutusuna', d: ['yere', 'denize', 'ormana'] },
    { s: 'Sabahları erken kalkmak güne ___ ve zinde başlamamızı sağlar.', a: 'enerjik', d: ['yorgun', 'mutsuz', 'sessiz'] },
  ];

  // 2. Eksik Kelime Havuzu
  const wordPuzzles = [
    { w: 'İ_T_F_İ_ECİ', a: 'İTFAİYECİ', h: 'Yangınları söndüren kişi' },
    { w: 'B_LG_S_Y_R', a: 'BİLGİSAYAR', h: 'Bilgi işleyen teknolojik araç' },
    { w: 'K_T_PH_N_', a: 'KÜTÜPHANE', h: 'Kitapların bulunduğu yer' },
    { w: 'Ö_R_N_İ', a: 'ÖĞRENCİ', h: 'Okulda eğitim gören kişi' },
    { w: 'G_L_C_K', a: 'GELECEK', h: 'Henüz yaşanmamış zaman' },
    { w: 'A_R_D_Ş', a: 'ARKADAŞ', h: 'Birlikte vakit geçirilen dost' },
    { w: 'M_S_F_R', a: 'MİSAFİR', h: 'Eve gelen konuk' },
    { w: 'T_L_V_ZY_N', a: 'TELEVİZYON', h: 'Haber ve film izlediğimiz cihaz' },
  ];

  // 3. Bağlamsal Metin (Cloze Story)
  const stories = [
    {
      title: 'Ormandaki Macera',
      text: 'Bir sabah küçük tavşan ormanda (1)___ çıktı. Yolda giderken çok (2)___ bir sincapla karşılaştı. Sincap elindeki (3)___ yere düşürmüştü. Tavşan hemen ona (4)___ etti.',
      blanks: [
        { id: 1, a: 'geziye', d: ['uykuya', 'yemeğe'] },
        { id: 2, a: 'neşeli', d: ['üzgün', 'korkmuş'] },
        { id: 3, a: 'meşe palamudunu', d: ['havucu', 'elmayı'] },
        { id: 4, a: 'yardım', d: ['şaka', 'veda'] }
      ]
    },
    {
       title: 'Geleceğin Bilim İnsanı',
       text: 'Can, her gün (1)___ yaparak yeni şeyler keşfetmeyi hayal ederdi. Odasında küçük bir (2)___ kurmuştu. Annesi ona doğum gününde bir (3)___ hediye etti. Artık (4)___ daha yakından inceleyebilecekti.',
       blanks: [
         { id: 1, a: 'deney', d: ['spor', 'dans'] },
         { id: 2, a: 'laboratuvar', d: ['oyun alanı', 'kütüphane'] },
         { id: 3, a: 'mikroskop', d: ['teleskop', 'kitap'] },
         { id: 4, a: 'hücreleri', d: ['yıldızları', 'balıkları'] }
       ]
    }
  ];

  const story = getRandomItems(stories, 1)[0];
  const items = getRandomItems(sentenceTemplates, difficulty === 'Zor' ? 10 : 8);
  const words = getRandomItems(wordPuzzles, 6);

  const builder = new WorksheetBuilder(ActivityType.MISSING_PARTS, 'Eksik Parçaları Tamamlama (Premium Pro)')
    .addPremiumHeader()
    .setInstruction('Aşağıdaki çalışmaları dikkatlice okuyunuz ve en uygun kelimeleri seçerek boşlukları doldurunuz.');

  // BÖLÜM 1: Bağlamsal Akış (Story Cloze)
  builder.addPrimaryActivity('text', {
    content: `📖 BÖLÜM 1: Metin Tamamlama\n\n**${story.title}**\n\n${story.text}\n\n` +
      `**Kelime Seçenekleri:**\n` + 
      story.blanks.map(b => `${b.id}. (${b.a} / ${b.d.join(' / ')})`).join('\n')
  });

  // BÖLÜM 2: Cümle Analizi
  builder.addPrimaryActivity('table', {
    title: '📝 BÖLÜM 2: Cümlelerdeki Boşlukları Doldur',
    headers: ['No', 'Cümle (Eksik Parçalı)', 'Kelime Seçenekleri', 'Cevabınız'],
    rows: items.map((item, i) => [
      `${i + 1}`,
      item.s,
      item.d.concat(item.a).sort().join(' / '),
      '________________'
    ]),
    style: { fontSize: 11, compact: true }
  });

  // BÖLÜM 3: Kelime ve Harf Farkındalığı
  builder.addSupportingDrill('🔍 BÖLÜM 3: Kelime Dedektifi (Eksik Harfler)', {
    items: words.map((wg, i) => `${i + 1}. ${wg.w}  (İpucu: ${wg.h})  →  ________________`),
    pedagogicalNote: 'Kelimedeki eksik harfleri tamamlayarak yazım ve görsel dikkat becerilerini güçlendirir.'
  });

  builder.addSupportingDrill('Yaratıcı Tamamlama', {
    text: 'Aşağıdaki cümleyi kendi hayal gücünle tamamla:',
    inputs: ['Eğer bir süper gücüm olsaydı ____________ kullanarak ____________ yapardım.']
  });

  return builder.addSuccessIndicator().build();
}

// ═══════════════════════════════════════════════════════════════
// ŞİFRE OKUMA (CODE_READING) — Premium
// ═══════════════════════════════════════════════════════════════
export async function generateOfflinePremiumCodeReading(
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const symbols = ['⭐', '🌙', '☀️', '❄️', '🔥', '🌀', '⚡', '💧'];
  const letters = turkishAlphabet.split('').slice(0, 8);

  const keyMap = symbols.map((s, i) => ({ symbol: s, letter: letters[i] }));
  
  // 6 kelime oluştur
  const allWords = ['ARI', 'BAL', 'CEP', 'DAL', 'EKO', 'FİL'];
  const encodedWords = allWords.map(word => {
    const encoded = word.split('').map(ch => {
      const idx = letters.indexOf(ch);
      return idx >= 0 ? symbols[idx] : ch;
    });
    return { original: word, encoded: encoded.join(' '), length: word.length };
  });

  const builder = new WorksheetBuilder(ActivityType.CODE_READING, 'Şifre Okuma Labirenti')
    .addPremiumHeader()
    .setInstruction('Önce şifre anahtarını öğren. Sonra şifreli kelimeleri çöz!')
    .addPrimaryActivity('table', {
      title: '🔑 Şifre Anahtarı',
      headers: ['Sembol', ...symbols],
      rows: [['Harf', ...letters]]
    });

  builder.addPrimaryActivity('table', {
    title: '🔐 Şifreli Kelimeler — Çöz!',
    headers: ['#', 'Şifreli Kelime', 'Çözüm'],
    rows: encodedWords.map((ew, i) => [`${i + 1}`, ew.encoded, '________________'])
  });

  builder.addSupportingDrill('Bonus: Kendi Şifreni Yaz!', {
    text: 'Anahtarı kullanarak kendi ismini şifrele:',
    inputs: ['İsmin: ________________', 'Şifreli halin: ________________']
  });

  return builder.addSuccessIndicator().build();
}
