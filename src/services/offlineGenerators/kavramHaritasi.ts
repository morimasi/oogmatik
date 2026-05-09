import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

/**
 * Kavram Haritası (İnfografik) - Ultra Pro Premium Jeneratör
 * A4 sayfasını 'dolu dolu' (kompakt) dolduracak şekilde 3 ana bölümden oluşur.
 */
export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Fen Bilimleri';

  const database: Record<string, any> = {
    'Canlılar Sınıflandırması': {
      nodes: [
        { id: '1', label: 'Canlılar', type: 'root' },
        { id: '2', label: 'Bitkiler', parentId: '1' },
        { id: '3', label: 'Hayvanlar', parentId: '1' },
        { id: '4', label: 'Mantarlar', parentId: '1' },
        { id: '5', label: 'Mikroskobik Canlılar', parentId: '1' },
        { id: '6', label: 'Omurgalılar', parentId: '3' },
        { id: '7', label: 'Omurgasızlar', parentId: '3' },
        { id: '8', label: 'Memeliler', parentId: '6' },
        { id: '9', label: 'Kuşlar', parentId: '6' },
        { id: '10', label: 'Balıklar', parentId: '6' },
      ],
      matching: [
        { q: 'Sütle besler, doğurarak çoğalır.', a: 'Memeliler' },
        { q: 'Vücutları tüylerle kaplıdır.', a: 'Kuşlar' },
        { q: 'Solungaç solunumu yaparlar.', a: 'Balıklar' },
      ]
    },
    'Su Döngüsü': {
      nodes: [
        { id: '1', label: 'Su Döngüsü', type: 'root' },
        { id: '2', label: 'Buharlaşma', parentId: '1' },
        { id: '3', label: 'Yoğuşma', parentId: '1' },
        { id: '4', label: 'Yağış', parentId: '1' },
        { id: '5', label: 'Yeraltı Suyu', parentId: '1' },
        { id: '6', label: 'Güneş Isısı', parentId: '2' },
        { id: '7', label: 'Yaprak Terlemesi', parentId: '2' },
        { id: '8', label: 'Bulut Oluşumu', parentId: '3' },
      ],
      matching: [
        { q: 'Sıvı suyun gaz haline geçmesi.', a: 'Buharlaşma' },
        { q: 'Su buharının soğukta sıvılaşması.', a: 'Yoğuşma' },
        { q: 'Kar, yağmur veya dolu olarak iniş.', a: 'Yağış' },
      ]
    },
    'Güneş Sistemi': {
      nodes: [
        { id: '1', label: 'Güneş Sistemi', type: 'root' },
        { id: '2', label: 'Güneş (Yıldız)', parentId: '1' },
        { id: '3', label: 'Gezegenler', parentId: '1' },
        { id: '4', label: 'Uydular', parentId: '1' },
        { id: '5', label: 'İç Gezegenler', parentId: '3' },
        { id: '6', label: 'Dış Gezegenler', parentId: '3' },
        { id: '7', label: 'Dünya, Venüs, Mars', parentId: '5' },
        { id: '8', label: 'Jüpiter, Satürn', parentId: '6' },
      ],
      matching: [
        { q: 'Sistemin merkezindeki ısı kaynağı.', a: 'Güneş' },
        { q: 'Gezegenlerin etrafında dolanan gök cismi.', a: 'Uydu' },
        { q: 'Kayalık yapıda olan küçük gezegenler.', a: 'İç Gezegenler' },
      ]
    }
  };

  const selectedTopic = database[topic] || database['Canlılar Sınıflandırması'];
  
  // Boş bırakılacak nodları zorluğa göre seç (Scaffolding prensibi)
  const missingNodeCount = difficulty === 'Zor' ? 6 : difficulty === 'Orta' ? 4 : 3;
  const nodesCopy = JSON.parse(JSON.stringify(selectedTopic.nodes));
  const nodesForShuffle = nodesCopy.slice(1);
  const shuffledNodes = shuffle([...nodesForShuffle]);
  const missingLabels = shuffledNodes.slice(0, missingNodeCount).map((n: any) => n.label);
  
  const nodes = nodesCopy.map((node: any) => {
    if (missingLabels.includes(node.label) && node.type !== 'root') {
      return { ...node, label: '..........', originalLabel: node.label, isMissing: true };
    }
    return node;
  });

  const results: any[] = [{
    id: `kavram_ultra_${Date.now()}`,
    activityType: ActivityType.KAVRAM_HARITASI,
    title: `📊 Kavram Haritası: ${topic}`,
    instruction: 'Aşağıdaki kavram haritasını incele. Boş bırakılan hiyerarşik kutuları uygun kavramlarla tamamla, ardından alttaki eşleştirme ve analiz sorularını yanıtla.',
    pedagogicalNote: 'Bu etkinlik, hiyerarşik düşünme (tree logic) ve kavramsal bağlama becerilerini ölçer. ZPD uyumlu destekleyici bölümlerle A4 sayfasını %100 kapsar.',
    difficultyLevel: difficulty,
    targetSkills: ['Hiyerarşik Algı', 'Tümdengelim', 'Kavramsal İlişkilendirme'],
    settings: { ...options, compactLayout: true, ultraPremium: true },
    content: {
      diagram: {
        title: `${topic} Şeması`,
        nodes: nodes,
        layout: 'compact-tree'
      },
      matchingExercise: {
        title: 'Kavram Dedektifi',
        instruction: 'Aşağıdaki tanımları kavram haritasındaki uygun kelimelerle eşleştir.',
        items: selectedTopic.matching
      },
      analyticalTask: {
        title: 'Mantıksal Sınıflandırma',
        question: `Neden "${topic}" konusundaki bu kavramları birbiriyle ilişkilendiriyoruz? En üstteki temel kavram ile en alttaki özel kavram arasındaki farkı 1 cümleyle açıkla.`,
        lineCount: 2
      },
      ultraPro: {
        compactPacking: true,
        minimalMargins: '0.5cm',
        fillerSections: true
      }
    }
  }];

  return results;
};

export default generateOfflineKavramHaritasi;
