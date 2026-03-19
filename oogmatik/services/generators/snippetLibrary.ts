
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
        label: 'Ayna Harf Onarımı',
        description: 'b-d, p-q karışıklığı için yönsel ipuçları ve oklar ekler.',
        value: "Disleksi ayna hatası (reversal) riskini azaltmak için b, d, p, q harflerine odaklan. Bu harflerin altına sağ/sol yönünü gösteren küçük minimalist oklar yerleştir.",
        icon: 'fa-arrows-left-right'
    },
    {
        id: 'clin-saccadic',
        category: 'Clinical',
        label: 'Sakadik Takip Çapaları',
        description: 'Göz sıçramalarını düzenlemek için satır sonu görsel çapalar.',
        value: "Her satırın başına ve sonuna farklı renklerde küçük geometrik şekiller (çapa) ekle ki öğrencinin gözü bir sonraki satıra hatasız kaysın.",
        icon: 'fa-eye'
    },
    {
        id: 'clin-contrast',
        category: 'Clinical',
        label: 'İzole Bloklama',
        description: 'Şekil-zemin ayrımı için metinleri hafif gri bloklara alır.',
        value: "Metin bloklarını hafif gri (f9f9f9) zemin üzerine siyah fontla yazarak şekil-zemin ayrımını (figure-ground) maksimize et.",
        icon: 'fa-circle-half-stroke'
    },
    {
        id: 'clin-focus-dots',
        category: 'Clinical',
        label: 'Odak Noktaları',
        description: 'Cümle ortalarına takip kolaylaştırıcı noktalar ekler.',
        value: "Uzun cümlelerin ortasına soluk renkli bir ayraç noktası koyarak cümlenin bölünmesini ve daha rahat işlenmesini sağla.",
        icon: 'fa-ellipsis'
    },

    // --- LİNGUİSTİK OPTİMİZASYON ---
    {
        id: 'ling-tdk',
        category: 'Linguistic',
        label: 'TDK Heceleme Motoru',
        description: 'Kelimeleri kesin TDK kurallarına göre hece bloklarına ayırır.',
        value: "Tüm kelimeleri TDK heceleme kurallarına göre analiz et. İki ünlü arasındaki tek ünsüzü sağdaki heceye bağla (Örn: a-ra-ba).",
        icon: 'fa-spell-check'
    },
    {
        id: 'ling-morph',
        category: 'Linguistic',
        label: 'Morfem Ayrıştırıcı',
        description: 'Kök ve ekleri görsel olarak kalın/ince ayrıştırır.',
        value: "Kelimelerin köklerini kalın (bold), eklerini ise daha ince fontla yazarak yapısal farkındalık (morphological awareness) yarat.",
        icon: 'fa-cubes'
    },
    {
        id: 'ling-phoneme-box',
        category: 'Linguistic',
        label: 'Elkonin Kutuları',
        description: 'Her ses birimi için ayrı bir kutucuk tasarımı.',
        value: "Kelimeleri 'Elkonin Kutusu' mantığıyla, her harf/ses için ayrı bir ızgara hücresi olacak şekilde görselleştir.",
        icon: 'fa-table-cells'
    },

    // --- GÖRSEL MİMARİ ---
    {
        id: 'vis-svg-hints',
        category: 'Visual',
        label: 'Piktografik İpuçları',
        description: 'Soruları çözmek için SVG ikonlar üretir.',
        value: "Soruların yanına, çözüm için gerekli olan anahtar kavramları temsil eden basit, minimalist SVG vektör çizimleri ekle.",
        icon: 'fa-bezier-curve'
    },
    {
        id: 'vis-grid-3x3',
        category: 'Visual',
        label: 'Bento Grid Düzeni',
        description: 'Soruları modern ve dengeli bir ızgara sistemine dizer.',
        value: "Sayfayı 3x3'lük dengeli bir bento-grid yapısında kurgula. Her hücrenin arasında 40px boşluk (gap) bırak.",
        icon: 'fa-table-cells-large'
    },
    {
        id: 'vis-rainbow',
        category: 'Visual',
        label: 'Gökkuşağı Heceler',
        description: 'Hece bloklarını farklı renklerle boyar.',
        value: "Kelimeleri hecelerken her heceye farklı bir klinik renk ata. Renkler: indigo, rose, emerald, amber döngüsünde olsun.",
        icon: 'fa-rainbow'
    },

    // --- OYUNLAŞTIRMA ---
    {
        id: 'game-star-reward',
        category: 'Gamification',
        label: 'Yıldız Rozet Sistemi',
        description: 'Başarı takibi için boyanabilir yıldızlar ekler.',
        value: "Her sorunun yanına 3 adet boş yıldız ekle ki öğrenci doğru yaptıkça bunları boyayabilsin.",
        icon: 'fa-star'
    },
    {
        id: 'game-ai-mascot',
        category: 'Gamification',
        label: 'Robot Rehber',
        description: 'AI asistanı sevimli bir rehber robot ekler.',
        value: "Sayfanın köşesine öğrenciye seslenen sevimli bir robot maskotu ve motivasyonel bir cümle ekle.",
        icon: 'fa-robot'
    }
];
