import { BaseActivityData, Difficulty } from '../../common';

/**
 * Harf Bağlama Etkinliği Veri Yapısı
 */
export interface LetterConnectData extends BaseActivityData {
  items: LetterConnectItem[];
  pedagogicalNote: string;
}

export interface LetterConnectItem {
  id: string;
  
}
