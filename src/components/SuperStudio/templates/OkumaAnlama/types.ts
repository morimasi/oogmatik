export interface OkumaAnlamaSettings {
    cognitiveLoadLimit: 6 | 8 | 12 | 15; // Cümle başı maksimum kelime sınırı
    chunkingEnabled: boolean;            // Parçalı okuma (örn: 2 cümle + 1 soru)
    visualScaffolding: boolean;          // Özete özel minimalist SVG eklentisi
    typographicHighlight: boolean;       // Kök kelime vurgulama (bold)
    mindMap5N1K: boolean;                // Metin sonu 5N1K tablosu/ızgarası
    questionCount: number;               // Soru sayısı
}
