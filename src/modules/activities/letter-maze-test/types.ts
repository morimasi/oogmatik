import { BaseActivityData } from '../../../types/core';

/**
 * Harf Labirenti Test Etkinliği Veri Yapısı
 */
export interface LetterMazeTestData extends BaseActivityData {
  items: LetterMazeTestItem[];

}

export interface LetterMazeTestItem {
  id: string;
  character: string; // Görünen harf
  isPath: boolean; // Yolun parçası mı?
}
