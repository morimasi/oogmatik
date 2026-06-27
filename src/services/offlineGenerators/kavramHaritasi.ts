import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle, getRandomInt } from './helpers';

export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  
  // Config'den gelen parametreler
  const depth = (opts.depth as number) || 2;
  const branchCount = (opts.branchCount as number) || 3;
  const topic = (opts.topic as string) || (opts.concept as string) || 'Güneş Sistemi';

  const database: Record<string, any> = {
    'Güneş Sistemi': [
        { id: '1', label: 'Güneş Sistemi', type: 'root', icon: 'Sun' },
        { id: '2', label: 'Gezegenler', parentId: '1', icon: 'Orbit' },
        { id: '3', label: 'Uydular', parentId: '1', icon: 'Moon' },
        { id: '4', label: 'İç Gezegenler', parentId: '2' },
        { id: '5', label: 'Dış Gezegenler', parentId: '2' },
        { id: '6', label: 'Ay', parentId: '3' },
        { id: '7', label: 'Merkür', parentId: '4' },
        { id: '8', label: 'Jüpiter', parentId: '5' },
    ],
    'Besin Kaynakları': [
        { id: '1', label: 'Besinler', type: 'root', icon: 'Apple' },
        { id: '2', label: 'Hayvansal', parentId: '1', icon: 'Beef' },
        { id: '3', label: 'Bitkisel', parentId: '1', icon: 'Wheat' },
        { id: '4', label: 'Et ve Süt', parentId: '2' },
        { id: '5', label: 'Sebze Meyve', parentId: '3' },
        { id: '6', label: 'Tahıllar', parentId: '3' },
    ],
    'Ekosistem': [
        { id: '1', label: 'Ekosistem', type: 'root', icon: 'Trees' },
        { id: '2', label: 'Biyotik', parentId: '1', icon: 'Bug' },
        { id: '3', label: 'Abiyotik', parentId: '1', icon: 'Cloud' },
        { id: '4', label: 'Üreticiler', parentId: '2' },
        { id: '5', label: 'Tüketiciler', parentId: '2' },
        { id: '6', label: 'Işık', parentId: '3' },
        { id: '7', label: 'Su ve Isı', parentId: '3' },
    ]
  };

  const selectedNodes = database[topic] || database['Güneş Sistemi'];
  
  // Derinliğe göre filtrele
  const filteredNodes = selectedNodes.filter((n: any) => {
      if (depth === 1) return n.type === 'root' || n.parentId === '1';
      return true; // Şimdilik tüm database derinlik 2-3 arası
  });

  const hideCount = (opts.fillRatio as number) ? Math.floor(filteredNodes.length * ((100 - (opts.fillRatio as number)) / 100)) : 4;
  
  const nodesForShuffle = filteredNodes.filter((n: any) => n.type !== 'root');
  const missingLabels = shuffle([...nodesForShuffle]).slice(0, hideCount).map((n: any) => n.label);

  const nodes = filteredNodes.map((node: any) => ({
    ...node,
    isMissing: missingLabels.includes(node.label),
    displayLabel: missingLabels.includes(node.label) ? '' : node.label
  }));

  return [{
    id: `concept_ultra_${Date.now()}`,
    activityType: ActivityType.KAVRAM_HARITASI,
    title: `INFOGRAPHIC: ${topic.toUpperCase()}`,
    instruction: 'Aşağıdaki hiyerarşiyi inceleyerek boş kalan alanları kavram havuzundan tamamlayın.',
    pedagogicalNote: 'Semantik ağ oluşturma ve hiyerarşik sınıflandırma becerisini geliştirir.',
    settings: { ...options }, 
    content: {
      topic: topic,
      nodes,
      wordBank: shuffle(missingLabels),
      insight: `Bu infografik, ${topic} konusundaki temel hiyerarşiyi göstermektedir. Sistemi anlamak için en üstteki "Root" kavramından başlayarak dalları takip edebilirsiniz.`
    }
  }];
};

export default generateOfflineKavramHaritasi;
