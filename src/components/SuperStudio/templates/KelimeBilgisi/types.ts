export interface KelimeBilgisiSettings {
    // Mod seçimi
    generationMode: 'ai' | 'hizli'; // AI: Gemini ile üret, Hızlı: Hazır şablon
    
    // Kelime türü seçimi
    wordTypes: ('es-anlamli' | 'zit-anlamli' | 'es-sesli')[];
    
    // AI Mod Ayarları
    aiSettings: {
        wordCount: number; // Her tür için kaç kelime çifti/grubu
        difficulty: 'kolay' | 'orta' | 'zor';
        includeExamples: boolean; // Cümle içinde kullanım örnekleri
        includeMnemonics: boolean; // Akılda kalıcı hatırlatma ipuçları
        themeBased: boolean; // Tematik kelime grupları
    };
    
    // Hızlı Mod Ayarları
    hizliSettings: {
        templateStyle: 'match-card' | 'fill-blank' | 'word-web' | 'bingo';
        difficulty: 'kolay' | 'orta' | 'zor';
        questionCount: number; // Toplam soru sayısı
        timeLimit: number | null; // Dakika cinsinden süre limiti (null = sınırsız)
        includeAnswerKey: boolean; // Cevap anahtarı dahil
    };
    
    // Ortak Görsel Ayarlar
    visualSettings: {
        useColorCoding: boolean; // Renk kodlaması (eş-anlamlı=mavi, zıt=kırmızı, eş-sesli=yeşil)
        useIcons: boolean; // Görsel ikonlar
        useFonts: boolean; // Farklı font vurguları
        useGrid: boolean; // Tablo/ızgara görünümü
    };
}
