import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';

export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { worksheetCount = 1, difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel';

  // Gerçek kavram veritabanı
  const database: Record<string, any> = {
    'Canlılar': {
      nodes: [
        { id: '1', label: 'Canlılar', type: 'root' },
        { id: '2', label: 'Bitkiler', parentId: '1' },
        { id: '3', label: 'Hayvanlar', parentId: '1' },
        { id: '4', label: 'Mikroskobik Canlılar', parentId: '1' },
        { id: '5', label: 'Mantarlar', parentId: '1' },
        { id: '6', label: 'Çiçekli Bitkiler', parentId: '2' },
        { id: '7', label: 'Çiçeksiz Bitkiler', parentId: '2' },
        { id: '8', label: 'Omurgalılar', parentId: '3' },
        { id: '9', label: 'Omurgasızlar', parentId: '3' },
      ]
    },
    'Su Döngüsü': {
      nodes: [
        { id: '1', label: 'Su Döngüsü', type: 'root' },
        { id: '2', label: 'Buharlaşma', parentId: '1' },
        { id: '3', label: 'Yoğuşma', parentId: '1' },
        { id: '4', label: 'Yağış', parentId: '1' },
        { id: '5', label: 'Yeraltı Suları', parentId: '1' },
        { id: '6', label: 'Güneş Isısı', parentId: '2' },
        { id: '7', label: 'Bulut Oluşumu', parentId: '3' },
      ]
    },
    'Güneş Sistemi': {
      nodes: [
        { id: '1', label: 'Güneş Sistemi', type: 'root' },
        { id: '2', label: 'Güneş', parentId: '1' },
        { id: '3', label: 'Gezegenler', parentId: '1' },
        { id: '4', label: 'Asteroitler', parentId: '1' },
        { id: '5', label: 'İç Gezegenler', parentId: '3' },
        { id: '6', label: 'Dış Gezegenler', parentId: '3' },
      ]
    }
  };

  const selectedData = database[topic] || database['Canlılar'];
  const results: any[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    results.push({
      id: `kavram_${Date.now()}_${i}`,
      activityType: ActivityType.KAVRAM_HARITASI,
      title: 'Kavram Haritası',
      instruction: 'Aşağıdaki kavram haritasını inceleyerek boş bırakılan yerleri uygun kavramlarla doldurunuz.',
      pedagogicalNote: 'Bu etkinlik, öğrencinin bilgiler arasındaki hiyerarşik ilişkileri kurmasını, bütünsel bakış açısı geliştirmesini ve kavramsal öğrenmeyi görselleştirmesini sağlar.',
      settings: {
        ...options,
        layoutType: opts.layoutType || 'tree',
        nodeStyle: opts.nodeStyle || 'rounded'
      },
      content: {
        ...selectedData,
        title: topic + ' Kavram Haritası'
      }
    });
  }

  return results;
};

export default generateOfflineKavramHaritasi;
