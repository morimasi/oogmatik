import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface KavramHaritasiData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  nodes: { id: string; label: string; level: number; isEmpty: boolean }[];
  edges: { from: string; to: string }[];
  settings: GeneratorOptions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<KavramHaritasiData[]> => {
  const opts = options;
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    concept = 'Canlılar',
    depth = 2,
    branchCount = 3,
    fillRatio = 0.4,
  } = opts;

  const pages: KavramHaritasiData[] = [];
  for (let i = 0; i < worksheetCount; i++) {
    const centerNode = { id: 'center', label: concept, level: 0, isEmpty: false };
    const mainNodes = Array.from({ length: branchCount }, (_, idx) => ({
      id: `m${idx + 1}`,
      label: '',
      level: 1,
      isEmpty: Math.random() < fillRatio,
    }));
    const subNodes =
      depth >= 2
        ? mainNodes.flatMap((m, mi) =>
            Array.from({ length: getRandomInt(1, 2) }, (_, si) => ({
              id: `${m.id}_s${si + 1}`,
              label: '',
              level: 2,
              isEmpty: Math.random() < fillRatio,
            }))
          )
        : [];
    const nodes = [centerNode, ...mainNodes, ...subNodes];
    const edges = mainNodes.map((m) => ({ from: 'center', to: m.id }));

    pages.push({
      id: `kavram_${Date.now()}_${i}`,
      activityType: ActivityType.KAVRAM_HARITASI,
      title: `${concept} Kavram Haritası`,
      instruction: 'Boş kutucuklara uygun kavramları yazarak haritayı tamamla.',
      nodes,
      edges,
      settings: opts,
    });
  }
  return pages;
};

export default generateOfflineKavramHaritasi;
