import { BaseActivityData } from '../../../types';

export interface HiddenPicturesSettings {
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  hiddenItemCount: number;
  theme: string;
}

export interface HiddenItem {
  id: string;
  name: string;
  icon: string; // Temsili ikon (örn: emoji veya react icon string'i)
  found?: boolean;
}

export interface HiddenPicturesData extends BaseActivityData {
  activityType: 'HIDDEN_PICTURES';
  settings: HiddenPicturesSettings;
  content: {
    itemsToFind: HiddenItem[];
    mainImagePrompt: string; // AI modunda görseli oluşturmak için kullanılacak prompt
    pedagogicalNote: string;
  };
}
