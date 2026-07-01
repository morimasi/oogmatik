import { BaseActivityData, Difficulty } from '../../../types/common';

/**
 * Harf Bağlama Etkinliği Veri Yapısı
 */
export interface LetterConnectData extends BaseActivityData {
  items: LetterConnectItem[];

}

export interface LetterConnectItem {
  id: string;
  leftItem?: string;
  rightItem?: string;
  matchType?: string;
}
