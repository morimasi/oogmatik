import { BaseActivityData, Difficulty } from '../../common';

/**
 * Harf Bağlama Etkinliği Etkinliği Veri Yapısı
 */
export interface HarfBaglamaData extends BaseActivityData {
  items: HarfBaglamaDataItem[];
  pedagogicalNote: string;
}

export interface HarfBaglamaDataItem {
  id: string;
  
}
