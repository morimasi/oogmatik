import { SemanticLinkerData, SemanticLinkerItem } from './types';
import { generateWithSchema } from '../../../services/geminiClient';
import { logWarn } from '../../../utils/logger';

const OFFLINE_SEMANTIC_POOL: SemanticLinkerItem[] = [
  {
    id: 'sem-1',
    targetWord: 'Uzun',
    isNegated: false,
    options: [
      { id: 'a', label: 'Arı', isCorrect: false },
      { id: 'b', label: 'Top', isCorrect: false },
      { id: 'c', label: 'Zürafa', isCorrect: true },
    ],
    correctAnswerId: 'c',
  },
  {
    id: 'sem-2',
    targetWord: 'Islak',
    isNegated: true,
    options: [
      { id: 'a', label: 'Şemsiye', isCorrect: false },
      { id: 'b', label: 'Aslan', isCorrect: true },
      { id: 'c', label: 'Yağmur', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-3',
    targetWord: 'Sıcak',
    isNegated: false,
    options: [
      { id: 'a', label: 'Güneş', isCorrect: true },
      { id: 'b', label: 'Kar', isCorrect: false },
      { id: 'c', label: 'Buzdolabı', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-4',
    targetWord: 'Uçmak',
    isNegated: true,
    options: [
      { id: 'a', label: 'Kuş', isCorrect: false },
      { id: 'b', label: 'Balık', isCorrect: true },
      { id: 'c', label: 'Kelebek', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-5',
    targetWord: 'Tatlı',
    isNegated: false,
    options: [
      { id: 'a', label: 'Acı Biber', isCorrect: false },
      { id: 'b', label: 'Çiçek Balı', isCorrect: true },
      { id: 'c', label: 'Ekşi Limon', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-6',
    targetWord: 'Hızlı',
    isNegated: true,
    options: [
      { id: 'a', label: 'Çita', isCorrect: false },
      { id: 'b', label: 'Kaplumbağa', isCorrect: true },
      { id: 'c', label: 'Roket', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-7',
    targetWord: 'Kış',
    isNegated: false,
    options: [
      { id: 'a', label: 'Kardan Adam', isCorrect: true },
      { id: 'b', label: 'Kumsal', isCorrect: false },
      { id: 'c', label: 'Güneş Gözlüğü', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-8',
    targetWord: 'Okul',
    isNegated: true,
    options: [
      { id: 'a', label: 'Defter', isCorrect: false },
      { id: 'b', label: 'Yastık', isCorrect: true },
      { id: 'c', label: 'Kalem', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-9',
    targetWord: 'Deniz',
    isNegated: false,
    options: [
      { id: 'a', label: 'Vapur', isCorrect: true },
      { id: 'b', label: 'Tren', isCorrect: false },
      { id: 'c', label: 'Traktör', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-10',
    targetWord: 'Keskin',
    isNegated: true,
    options: [
      { id: 'a', label: 'Makas', isCorrect: false },
      { id: 'b', label: 'Pamuk', isCorrect: true },
      { id: 'c', label: 'Bıçak', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-11',
    targetWord: 'Ağır',
    isNegated: false,
    options: [
      { id: 'a', label: 'Fil', isCorrect: true },
      { id: 'b', label: 'Kuş Tüyü', isCorrect: false },
      { id: 'c', label: 'Uçan Balon', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-12',
    targetWord: 'Gece',
    isNegated: true,
    options: [
      { id: 'a', label: 'Hilal Ay', isCorrect: false },
      { id: 'b', label: 'Öğle Güneşi', isCorrect: true },
      { id: 'c', label: 'Parlak Yıldız', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-13',
    targetWord: 'Yumuşak',
    isNegated: false,
    options: [
      { id: 'a', label: 'Kaya Parçası', isCorrect: false },
      { id: 'b', label: 'Yün Yastık', isCorrect: true },
      { id: 'c', label: 'Demir Çekiç', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
  {
    id: 'sem-14',
    targetWord: 'Mutfak',
    isNegated: true,
    options: [
      { id: 'a', label: 'Çorba Tenceresi', isCorrect: false },
      { id: 'b', label: 'Yemek Kaşığı', isCorrect: false },
      { id: 'c', label: 'Çift Kişilik Yatak', isCorrect: true },
    ],
    correctAnswerId: 'c',
  },
  {
    id: 'sem-15',
    targetWord: 'Yazı Yazmak',
    isNegated: false,
    options: [
      { id: 'a', label: 'Kurşun Kalem', isCorrect: true },
      { id: 'b', label: 'Yemek Çatalı', isCorrect: false },
      { id: 'c', label: 'Saç Tarağı', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-16',
    targetWord: 'Kırmızı',
    isNegated: true,
    options: [
      { id: 'a', label: 'Çilek', isCorrect: false },
      { id: 'b', label: 'Domates', isCorrect: false },
      { id: 'c', label: 'Yeşil Çimen', isCorrect: true },
    ],
    correctAnswerId: 'c',
  },
  {
    id: 'sem-17',
    targetWord: 'Orman',
    isNegated: false,
    options: [
      { id: 'a', label: 'Meşe Ağacı', isCorrect: true },
      { id: 'b', label: 'Yüksek Gökdelen', isCorrect: false },
      { id: 'c', label: 'Denizaltı', isCorrect: false },
    ],
    correctAnswerId: 'a',
  },
  {
    id: 'sem-18',
    targetWord: 'Müzik',
    isNegated: true,
    options: [
      { id: 'a', label: 'Akustik Gitar', isCorrect: false },
      { id: 'b', label: 'Ağır Çekiç', isCorrect: true },
      { id: 'c', label: 'Piyano Tuşları', isCorrect: false },
    ],
    correctAnswerId: 'b',
  },
];

export const generateSemanticLinkerOffline = (count: number = 6): SemanticLinkerData => {
  const safeCount = Math.max(1, Math.min(count, OFFLINE_SEMANTIC_POOL.length));
  const selectedItems = OFFLINE_SEMANTIC_POOL.slice(0, safeCount);

  return {
    title: 'Anlamsal İlişki Kurma',
    instruction: 'Hedef sözcük ile seçenekler arasındaki anlamsal bağı inceleyerek doğru seçeneği işaretleyelim.',
    items: selectedItems,
    pedagogicalNote:
      'Bu çalışma, disleksi ve dil gelişim desteğine ihtiyaç duyan çocuklarda kavram haritalama, semantik bellek ve soyutlama becerilerini pekiştirir. Negatif yönergeler bilişsel esnekliği destekler.',
    difficulty: 'Orta',
  };
};

export const generateSemanticLinkerAI = async (
  prompt: string,
  count: number = 6
): Promise<SemanticLinkerData> => {
  const safeCount = Math.max(1, Math.min(count, 12));

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            targetWord: { type: 'STRING' },
            isNegated: { type: 'BOOLEAN' },
            options: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  label: { type: 'STRING' },
                  isCorrect: { type: 'BOOLEAN' },
                },
                required: ['id', 'label', 'isCorrect'],
              },
            },
            correctAnswerId: { type: 'STRING' },
          },
          required: ['id', 'targetWord', 'isNegated', 'options', 'correctAnswerId'],
        },
      },
    },
    required: ['title', 'instruction', 'pedagogicalNote', 'items'],
  };

  const fullPrompt = `
    Sen Kıdemli bir Özel Eğitim Materyal Tasarımcısısın.
    İlkokul ve ortaokul seviyesinde disleksi ve DEHB desteğine ihtiyaç duyan çocuklar için "Anlamsal İlişki Kurma" çalışma kâğıdı hazırla.
    
    KURALLAR:
    1. Hedef kelime ile seçenekler arasında net bir kavramsal/anlamsal bağ olmalı (özellik, işlev, zıt/eş anlam, parça-bütün, kategori veya yaşam alanı).
    2. Soruların yaklaşık yarısı negatif formatta olsun ("... hangisiyle ilişkili DEĞİLDİR?"). isNegated alanını true yap.
    3. Diğer yarısı pozitif olsun ("... hangisiyle İLİŞKİLİDİR?"). isNegated alanını false yap.
    4. Kelimeler somut, günlük hayattan, disleksi dostu ve zihinde canlandırılabilir olmalı.
    5. Her soru için tam 3 seçenek (id'leri 'a', 'b', 'c') üret. Kesinlikle yalnız 1 seçenek 'isCorrect: true' olmalı, diğer ikisi 'isCorrect: false' olmalı.
    6. 'pedagogicalNote' alanında öğretmene ve veliye bu etkinliğin çocuğun hangi bilişsel/dil becerisini geliştirdiğini anlatan pedagojik açıklama yaz.
    
    ${prompt ? `Öğretmen Özel Talebi: ${prompt}` : ''}
    Soru Sayısı: ${safeCount}
  `;

  try {
    const rawResult = await generateWithSchema(fullPrompt, schema);
    const result = rawResult as unknown as SemanticLinkerData;

    if (!result || !Array.isArray(result.items) || result.items.length === 0) {
      logWarn('[SemanticLinkerAI] Invalid or empty items returned by AI. Falling back to offline.');
      return generateSemanticLinkerOffline(safeCount);
    }

    // Normalizasyon ve eksik alan koruması
    const normalizedItems: SemanticLinkerItem[] = result.items.map((item, idx) => ({
      id: item.id || `ai-sem-${idx + 1}`,
      targetWord: item.targetWord || 'Hedef Sözcük',
      isNegated: Boolean(item.isNegated),
      options: Array.isArray(item.options) && item.options.length >= 2
        ? item.options.map((opt, oIdx) => ({
            id: opt.id || String.fromCharCode(97 + oIdx),
            label: opt.label || 'Seçenek',
            isCorrect: Boolean(opt.isCorrect),
          }))
        : [
            { id: 'a', label: 'Seçenek 1', isCorrect: false },
            { id: 'b', label: 'Seçenek 2', isCorrect: true },
            { id: 'c', label: 'Seçenek 3', isCorrect: false },
          ],
      correctAnswerId: item.correctAnswerId || 'b',
    }));

    return {
      title: result.title || 'Anlamsal İlişki Kurma',
      instruction:
        result.instruction ||
        'Hedef sözcük ile seçenekler arasındaki anlamsal bağı inceleyerek doğru seçeneği işaretleyelim.',
      items: normalizedItems.slice(0, safeCount),
      pedagogicalNote:
        result.pedagogicalNote ||
        'Bu çalışma, disleksi ve dil gelişim desteğine ihtiyaç duyan çocuklarda kavram haritalama, semantik bellek ve soyutlama becerilerini pekiştirir.',
      difficulty: 'Orta',
    };
  } catch (err) {
    logWarn('[SemanticLinkerAI] AI generation failed, using offline fallback', { error: String(err) });
    return generateSemanticLinkerOffline(safeCount);
  }
};
