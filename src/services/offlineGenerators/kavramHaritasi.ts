import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle, getRandomInt } from './helpers';

export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  
  const database: Record<string, any> = {
    'Güneş Sistemi': {
      nodes: [
        { id: '1', label: 'Güneş Sistemi', type: 'root', icon: 'Sun' },
        { id: '2', label: 'Gezegenler', parentId: '1', icon: 'Orbit' },
        { id: '3', label: 'Uydular', parentId: '1', icon: 'Moon' },
        { id: '4', label: 'Yıldızlar', parentId: '1', icon: 'Stars' },
        { id: '5', label: 'İç Gezegenler', parentId: '2' },
        { id: '6', label: 'Dış Gezegenler', parentId: '2' },
        { id: '7', label: 'Kayalık Yapı', parentId: '5' },
        { id: '8', label: 'Gaz Devleri', parentId: '6' },
      ],
      matching: [
        { q: 'Halkalı dev gezegen.', a: 'Satürn' },
        { q: 'Güneş\'e en yakın gezegen.', a: 'Merkür' },
        { q: 'Kızıl gezegen olarak bilinir.', a: 'Mars' }
      ]
    },
    'Maddenin Halleri': {
      nodes: [
        { id: '1', label: 'Madde', type: 'root', icon: 'Component' },
        { id: '2', label: 'Katı', parentId: '1', icon: 'Box' },
        { id: '3', label: 'Sıvı', parentId: '1', icon: 'Droplets' },
        { id: '4', label: 'Gaz', parentId: '1', icon: 'Wind' },
        { id: '5', label: 'Belirli Şekil', parentId: '2' },
        { id: '6', label: 'Akışkanlık', parentId: '3' },
        { id: '7', label: 'Sıkıştırılabilirlik', parentId: '4' },
      ],
      matching: [
        { q: 'Bulunduğu kabın şeklini alır.', a: 'Sıvı' },
        { q: 'Tanecikleri en düzenlidir.', a: 'Katı' },
        { q: 'Çok hızlı hareket ederler.', a: 'Gaz' }
      ]
    },
    'Besin İçerikleri': {
        nodes: [
          { id: '1', label: 'Besinler', type: 'root', icon: 'Apple' },
          { id: '2', label: 'Proteinler', parentId: '1', icon: 'Beef' },
          { id: '3', label: 'Karbonhidratlar', parentId: '1', icon: 'Wheat' },
          { id: '4', label: 'Vitaminler', parentId: '1', icon: 'Citrus' },
          { id: '5', label: 'Yağlar', parentId: '1', icon: 'Droplet' },
          { id: '6', label: 'Yapıcı Onarıcı', parentId: '2' },
          { id: '7', label: 'Enerji Verici', parentId: '3' },
          { id: '8', label: 'Düzenleyici', parentId: '4' },
        ],
        matching: [
            { q: 'Kas gelişimi için gereklidir.', a: 'Protein' },
            { q: 'Vücudun birincil enerji kaynağı.', a: 'Karbonhidrat' },
            { q: 'Hastalıklara karşı korur.', a: 'Vitamin' }
        ]
    }
  };

  const topics = Object.keys(database);
  const selectedTopicName = (opts.topic as string) || topics[getRandomInt(0, topics.length - 1)];
  const data = database[selectedTopicName] || database['Güneş Sistemi'];

  // Kavram havuzu (Kelime Bankası) oluştur
  const allLabels = data.nodes.map((n: any) => n.label);
  const pool = shuffle([...allLabels]);

  // Boş bırakma mantığı (ZPD)
  const hideCount = difficulty === 'Zor' ? 6 : difficulty === 'Orta' ? 4 : 3;
  const nodesCopy = JSON.parse(JSON.stringify(data.nodes));
  const nodesForShuffle = nodesCopy.slice(1); // root kalsın
  const missingLabels = shuffle([...nodesForShuffle]).slice(0, hideCount).map((n: any) => n.label);

  const nodes = nodesCopy.map((node: any) => ({
    ...node,
    isMissing: missingLabels.includes(node.label) && node.type !== 'root',
    displayLabel: missingLabels.includes(node.label) && node.type !== 'root' ? '' : node.label
  }));

  return [{
    id: `concept_map_${Date.now()}`,
    activityType: ActivityType.KAVRAM_HARITASI,
    title: `INFOGRAPHIC: ${selectedTopicName.toUpperCase()}`,
    instruction: 'Kavram haritasındaki boşlukları "Kavram Havuzu"ndaki uygun kelimelerle doldurun. Ardından analiz bölümünü tamamlayın.',
    pedagogicalNote: 'Görselleştirilmiş hiyerarşi, çalışma belleğindeki yükü azaltır ve kavramlar arası semantik bağları güçlendirir.',
    settings: { ...options, template: 'modern-glass' },
    content: {
      topic: selectedTopicName,
      nodes,
      wordBank: shuffle(missingLabels),
      matching: data.matching,
      summary: {
          title: 'Konu Özeti (Infographic Insight)',
          text: `${selectedTopicName} konusu, evrendeki/doğadaki sistemlerin işleyişini anlamamıza yardımcı olur. Hiyerarşik yapıyı inceleyerek temel ve alt kavramlar arasındaki farkı kavrayabiliriz.`
      }
    }
  }];
};

export default generateOfflineKavramHaritasi;
