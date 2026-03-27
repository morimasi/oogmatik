export interface YaraticiYazarlikSettings {
    storyDiceCount: number;               // 1-5 arası SVG ikon zar sayısı
    clozeFormat: 'none' | 'fiil' | 'sifat' | 'rastgele'; // Boşluk doldurma türü
    emotionRadar: boolean;                // Duygu ikonları eşleştirme
    minSentences: number;                 // Hedef cümle sayısı
}
