import { BaseActivityData } from '../../../types';

export type HarfBaglamaMode = 'standard' | 'girl';
export type HarfBaglamaCategory = 'egitim' | 'genel' | 'mesleki' | 'hayvanlar' | 'meyveler' | 'sebzeler' | 'oyuncaklar';
export type HarfBaglamaDifficulty = 'Kolay' | 'Orta' | 'Zor';

export interface HarfBaglamaDataItem {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface HarfBaglamaData extends BaseActivityData {
  items: HarfBaglamaDataItem[];
  difficulty: HarfBaglamaDifficulty;
  activityMode: HarfBaglamaMode;
  category: HarfBaglamaCategory;
  itemCount: number;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
}
