import { BaseActivityData } from '../../../types';

export interface HarfBaglamaDataItem {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface HarfBaglamaData extends BaseActivityData {
  items: HarfBaglamaDataItem[];
  difficulty?: string;
}
