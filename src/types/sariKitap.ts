import { z } from 'zod';
import { AgeGroup } from './creativeStudio.js';
import { Difficulty } from './activityStudio.js';

export const SariKitapActivityTypeSchema = z.enum([
  'pencere',
  'nokta',
  'kopru',
  'cift_metin',
  'hizli_okuma',
  'bellek'
]);

export type SariKitapActivityType = z.infer<typeof SariKitapActivityTypeSchema>;

export interface SariKitapConfig {
  type: SariKitapActivityType;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  durationMins: number;
  topics: string[];
  learningObjectives: string[];
  // Nokta/Köprü vs için ekstra parametreler
  parameters: {
    spacing?: number; // Nokta veya köprü boşlukları
    interleaveRatio?: number; // Çift metin karışım oranı (1=kelime kelime, 2=ikişer kelime, vb)
    lineHeight?: number; // Satır aralığı
    letterSpacing?: number; // Harf arası boşluk
  };
}

export interface SariKitapActivity {
  id: string;
  config: SariKitapConfig;
  content: {
    title: string;
    pedagogicalNote: string; // Zorunlu
    instructions: string;
    // Format spesifik veri
    // Nokta/Köprü için düz metin, UI render ederken noktalayacak
    text?: string; 
    // Çift metin için iki ayrı metnin birleşimi veya array'i
    interleavedText?: Array<{ text: string; source: 1 | 2 }>;
    // Hızlı okuma için kelime blokları
    wordBlocks?: string[][];
  };
  createdAt: number;
  authorId: string;
}

export const SariKitapGenerationRequestSchema = z.object({
  config: z.any(), // SariKitapConfig
  sourcePdfReference: z.string().optional() // Hızlı mod için referans PDF adı
});
