
export interface AISnippet {
    id: string;
    category: 'Clinical' | 'Linguistic' | 'Visual' | 'Gamification' | 'Custom';
    label: string;
    description: string;
    value: string;
    icon: string;
}

export const PROFESSIONAL_SNIPPETS: AISnippet[] = [
    // --- KLİNİK MÜDAHALE ---
    {
        id: 'clin-reversal',
        category: 'Clinical',
        label: 'Ayna Harf Odağı',
        description: 'b-d, p-q karışıklığı için yönsel ipuçları ekler.',
        value: "Özellikle b, d, p, q harflerine odaklan. Bu harflerin altına sağ/sol yönünü gösteren küçük, fark edilmesi kolay oklar yerleştir.",
        icon: 'fa-arrows-left-right'
    },
    {
        id: 'clin-saccadic',
        category: 'Clinical',
        label: 'Sakadik Takip Noktaları',
        description: 'Göz sıçramalarını düzenlemek için satır sonu çapaları.',
        value: "Her satırın başına ve sonuna farklı renklerde küçük geometrik şekiller (çapa) ekle ki göz bir sonraki satıra hatasız kaysın.",
        icon: 'fa-eye'
    },
    {
        id: 'clin-contrast',
        category: 'Clinical',
        label: 'Yüksek Kontrastlı Bloklar',
        description: 'Şekil-zemin ayrımı için zemin-metin zıtlığı.',
        value: "Metin bloklarını hafif gri (f9f9f9) zemin üzerine siyah fontla yazarak şekil-zemin ayrımını maksimize et.",
        icon: 'fa-circle-half-stroke'
    },

    // --- LİNGUİSTİK OPTİMİZASYON ---
    {
        id: 'ling-tdk',
        category: 'Linguistic',
        label: 'TDK Heceleme Filtresi',
        description: 'Kelimeleri kesin TDK kurallarına göre böler.',
        value: "Tüm kelimeleri TDK (Türk Dil Kurumu) kurallarına göre analiz et. Heceleme yaparken iki ünlü arasındaki tek ünsüzü sağdaki heceye bağla.",
        icon: 'fa-spell-check'
    },
    {
        id: 'ling-morph',
        category: 'Linguistic',
        label: 'Morfem Analizi',
        description: 'Kök ve ekleri görsel olarak ayrıştırır.',
        value: "Kelimelerin köklerini kalın (bold), eklerini ise daha ince veya italik fontla yazarak yapısal farkındalık yarat.",
        icon: 'fa-cubes'
    },
    {
        id: 'ling-5n1k',
        category: 'Linguistic',
        label: 'Otomatik 5N1K Seti',
        description: 'İçeriğe metne dayalı 6 temel soru ekler.',
        value: "İçeriğin sonuna metne dayalı; Kim, Ne, Nerede, Ne Zaman, Nasıl ve Niçin sorularından oluşan bir set ekle.",
        icon: 'fa-clipboard-question'
    },

    // --- GÖRSEL MİMARİ ---
    {
        id: 'vis-svg-hints',
        category: 'Visual',
        label: 'Vektörel İpuçları',
        description: 'Soruları çözmek için SVG grafikler üretir.',
        value: "Soruların yanına, çözüm için gerekli olan anahtar kavramları temsil eden basit, minimalist SVG vektör çizimleri ekle.",
        icon: 'fa-bezier-curve'
    },
    {
        id: 'vis-grid-3x3',
        category: 'Visual',
        label: '3x3 Matris Düzeni',
        description: 'Soruları dokuzlu ızgara sistemine dizer.',
        value: "Soruları A4 sayfasında 3x3'lük dengeli bir matris yapısında, aralarında geniş boşluklar (gap: 40px) olacak şekilde yerleştir.",
        icon: 'fa-table-cells'
    },

    // --- OYUNLAŞTIRMA (GAMIFICATION) ---
    {
        id: 'game-star-reward',
        category: 'Gamification',
        label: 'Yıldız Ödül Sistemi',
        description: 'Başarı takibi için boyanabilir yıldızlar.',
        value: "Her sorunun veya bölümün yanına 3 adet boş (stroke-only) yıldız ekle ki öğrenci doğru yaptıkça bunları boyayabilsin.",
        icon: 'fa-star'
    },
    {
        id: 'game-mascot',
        category: 'Gamification',
        label: 'Motivasyonel Maskot',
        description: 'AI asistanı sevimli bir rehber ekler.',
        value: "Sayfanın köşesine öğrenciye seslenen sevimli bir robot veya baykuş maskotu ve onun ağzından motivasyonel bir cümle ekle.",
        icon: 'fa-robot'
    }
];
