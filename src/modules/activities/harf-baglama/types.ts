import { BaseActivityData, ActivityItem } from '../../../types';

export interface HarfBaglamaDataItem extends ActivityItem {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface HarfBaglamaData extends BaseActivityData {
  items: HarfBaglamaDataItem[];
}
