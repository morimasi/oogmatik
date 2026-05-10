/**
 * Boilerplate Etkinlik — Veri Yapısı
 * Bu dosya, yeni etkinlik modülleri için referans şablon olarak kullanılır.
 * 
 * Kopyalayıp kendi etkinliğinize uyarlayın.
 */
export interface BoilerplateData {
    instruction: string;
    items: BoilerplateItem[];
    pedagogicalNote: string;
    difficulty: 'Kolay' | 'Orta' | 'Zor';
    totalItems: number;
}

export interface BoilerplateItem {
    id: string;
    content: string;
    isCorrect?: boolean;
    visualHint?: string;
}
