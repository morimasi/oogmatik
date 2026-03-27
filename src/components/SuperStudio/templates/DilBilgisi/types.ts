export interface DilBilgisiSettings {
    targetDistractors: 'b-d' | 'p-q' | 'm-n' | 'none'; // Ayna harfleri
    syllableSimulation: boolean;                       // [He-ce-le-me] modu
    camouflageGrid: boolean;                           // Harf avı tablosu
    gridSize: 'none' | '3x3' | '4x4' | '5x5';          // Av matrisi boyutu
    hintBox: boolean;                                  // Kurallar İpucu Kutusu
}
