import { BaseActivityData } from '../../../types/core';

/**
 * Harf Labirenti Test Etkinliği Veri Yapısı
 */
export interface LetterMazeTestData extends BaseActivityData {
  items: LetterMazeTestItem[];
  pedagogicalNote: string;
}

export interface LetterMazeTestItem {
  id: string;
  character: string; // Görünen harf
  isPath: boolean; // Yolun parçası mı?
}
