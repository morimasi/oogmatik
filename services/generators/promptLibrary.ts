
export interface ActivityLibraryItem {
    id: string;
    title: string;
    methodology: 'Orton-Gillingham' | 'Feuerstein' | 'Wilson' | 'Lindamood-Bell' | 'Sensory-Integration';
    category: 'Phonological' | 'Visual-Perception' | 'Working-Memory' | 'Executive-Function' | 'Math-Logic';
    description: string;
    basePrompt: string;
}

export const PEDAGOGICAL_LIBRARY: ActivityLibraryItem[] = [
    {
        id: 'og-phoneme-mapping',
        title: 'Fonem-Grafem Haritalama (Gelişmiş)',
        methodology: 'Orton-Gillingham',
        category: 'Phonological',
        description: 'Seslerin (fonem) ve harflerin (grafem) multisensoriyel olarak eşleştirilmesi.',
        basePrompt: "Orton-Gillingham prensiplerine uygun, ses-harf eşleşmesini 3 duyulu (görsel, işitsel, dokunsal) simüle eden bir çalışma üret. Kelimeler hece yapısına göre bloklara ayrılmalı."
    },
    {
        id: 'feuerstein-matrix',
        title: 'Bilişsel Matris Tamamlama',
        methodology: 'Feuerstein',
        category: 'Math-Logic',
        description: 'Soyut düşünme ve kategorizasyon becerilerini geliştiren ilişkisel mantık bulmacası.',
        basePrompt: "Feuerstein'ın Enstrümantal Zenginleştirme modeline uygun, 3x3 veya 4x4 matris yapısında, şekiller arası rotasyonel veya sayısal ilişki kuran mantık sorusu üret."
    },
    {
        id: 'wilson-syllable-scooping',
        title: 'Hece Kepçeleme (Scooping)',
        methodology: 'Wilson',
        category: 'Phonological',
        description: 'Akıcı okuma için kelimelerin hece yaylarına göre görselleştirilmesi.',
        basePrompt: "Wilson Reading System standartlarında, kelimelerin altındaki hece yaylarını (scoops) vurgulayan, kapalı ve açık hece ayrımını öğreten bir metin analizi çalışması üret."
    },
    {
        id: 'lb-visualizing-verbalizing',
        title: 'Sözel Sembolleştirme',
        methodology: 'Lindamood-Bell',
        category: 'Working-Memory',
        description: 'Okunan metni zihinsel görsellere dönüştürme ve detay hatırlama.',
        basePrompt: "Lindamood-Bell V/V tekniğiyle, metindeki her cümleyi zihinsel bir resme dönüştürecek 'Yapı Taşı' soruları (renk, boyut, şekil, konum odaklı) üret."
    },
    {
        id: 'executive-planning-maze',
        title: 'Yönetici Planlama Labirenti',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Önceden plan yapma ve dürtü kontrolü odaklı stratejik akış.',
        basePrompt: "Yönetici işlevleri tetikleyen, birden fazla çıkışı olan ama sadece birinin stratejik olduğu, her adımda bir kuralın değiştiği dinamik bir planlama görevi tasarla."
    }
    // Kütüphane 100+ öğeye kadar genişletilebilir...
];
