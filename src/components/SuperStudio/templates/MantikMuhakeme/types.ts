export interface MantikMuhakemeSettings {
    sequenceSteps: number;                // 3, 4, 5, 6 adımlı olay örgüsü
    logicMatrix: boolean;                 // Sudoku benzeri mantık matrisi
    matrixSize: '3x3' | '3x4' | '4x4';    // Matris boyutu
    detailDetective: boolean;             // Metindeki mantık hatasını bulma
    storyComplexity: 'Kolay' | 'Orta' | 'Zor'; // Hikaye karmaşıklığı
}
