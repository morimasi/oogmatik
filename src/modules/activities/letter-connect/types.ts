import { BaseActivityData } from '../../../types/common';

export type LetterConnectMode = 'standard' | 'girl';
export type LetterConnectCategory = 'egitim' | 'genel' | 'mesleki' | 'hayvanlar' | 'meyveler' | 'sebzeler' | 'oyuncaklar';
export type LetterConnectDifficulty = 'Kolay' | 'Orta' | 'Zor';

export interface LetterConnectDataItem {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface LetterConnectData extends BaseActivityData {
  items: LetterConnectDataItem[];
  difficulty: LetterConnectDifficulty;
  activityMode: LetterConnectMode;
  category: LetterConnectCategory;
  itemCount: number;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
}
