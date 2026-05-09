import { BaseActivityData } from '../../../types';

// Ayarlar panelinden (ConfigPanel) gelecek olan kullanıcı tercihleri
export interface BoilerplateSettings {
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  theme: string;
  itemCount: number;
  useColors: boolean;
}

// Etkinlik içerisindeki her bir sorunun/maddenin yapısı
export interface BoilerplateItem {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  visualHint?: string; // İkon veya görsel ipucu
}

// Jeneratörden dönen ve UI'a aktarılan nihai veri modeli
export interface BoilerplateData extends BaseActivityData {
  activityType: 'CUSTOM_NEW_ACTIVITY' | any; 
  settings: BoilerplateSettings;
  content: {
    items: BoilerplateItem[];
    storyIntro?: string; // Etkinlik öncesi kısa hikaye
    pedagogicalNote: string; // Öğretmen için disleksi destek notu
  };
}
