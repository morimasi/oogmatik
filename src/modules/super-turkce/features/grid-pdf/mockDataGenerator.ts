import { Objective } from '../../core/types';

// Seçilen Müfredata ve Formata Göre Dinamik Sahte Veri Üretir (AI Bağlanana Kadar Akıllı Mock)
export const generateDynamicMockData = (
    type: string,
    grade: number | null,
    objective: Objective | null,
    engineMode: 'ai' | 'fast',
    difficulty: string
) => {
    // Tema/Kazanım Etiketi
    const topic = objective ? objective.title : `Genel ${grade || ''}. Sınıf Tekrarı`;
    const difficultyLabel = difficulty.toUpperCase();
    const isAi = engineMode === 'ai';

    switch (type) {
        case '5N1K_NEWS':
        case '5N1K':
            return {
                title: isAi ? `✨ ${grade}. SINIF AI HABER: Okyanusun Gizemleri` : `⚡ ${grade}. SINIF HABER: Başarıya Giden Yol`,
                content: isAi
                    ? `(${topic} odaklı) Derin sularda keşfedilen yeni bir canlı türü, bilim insanlarını şaşkına çevirdi. Zorluk seviyesi: ${difficultyLabel}. Yeni türün DNA'sı, daha önce bilinen hiçbir deniz canlısıyla eşleşmiyor.`
                    : `(${topic} odaklı) Okyanus bilimciler geçtiğimiz günlerde dev bir mercan kayalığı buldu. Bu keşif ekosistemimiz için büyük umut vadediyor. Zorluk: ${difficultyLabel}.`,
                questions: ['Kim / Ne?', 'Nerede?', 'Ne Zaman?']
            };

        case 'SUPER_TURKCE_MATCHING':
        case 'SEBEP_SONUC_ESLESTIR':
        case 'KAVRAM_ESLESTIRME':
        case 'ESLESTIRME':
            const leftList = [
                `Kazanım: ${topic.substring(0, 15)}... nedeniyle`,
                `Zorluk düzeyi ${difficultyLabel} olduğu için`,
                `${isAi ? 'Yapay Zeka' : 'Hızlı Motor'} ile üretildi ancak`
            ];
            const rightList = [
                `hemen sisteme entegre edildi.`,
                `hızla çözüme ulaştık.`,
                `beklenen performansı gösteremedi.`
            ];
            // Basit bir shuffle (karıştırma)
            const shuffledRight = [...rightList].sort(() => Math.random() - 0.5);

            return {
                left: leftList,
                right: shuffledRight
            };

        case 'MULTIPLE_CHOICE':
        case 'DIL_BILGISI_TEST':
        case 'PARAGRAF_MANTIK_TEST':
        case 'STANDART_TEST':
        case 'YENI_NESIL':
            return {
                question: `${grade}. Sınıf (${difficultyLabel}): Aşağıdakilerden hangisi "${topic}" konusu ile doğrudan ilişkilidir?`,
                options: [
                    'A) Öğrencinin ders çalışma saatlerini artırması.',
                    'B) Kitap okuma alışkanlığının dil becerilerine katkısı.',
                    'C) Yeni nesil sorulara (${isAi ? "Yapay Zeka" : "Klasik"} destekli) adapte olunması.',
                    'D) Test çözme tekniklerinin sürekli tekrar edilmesi.'
                ]
            };

        case 'FILL_IN_THE_BLANKS':
        case 'BOSLUK_CEKIM_EKI':
        case 'BOSLUK_DOLDURMA':
            return {
                words: ['başarı', 'çalışmak', 'zeka', grade?.toString() || 'öğrenci'],
                sentences: [
                    `Bu yıl ${grade ? grade + '. sınıfa' : 'okula'} geçecek öğrencilerin en çok ihtiyacı olan şey planlı ____________ dır.`,
                    `"${topic}" hedefine ulaşmak için salt ____________ yeterli olmaz, azim de gerekir.`
                ]
            };

        default:
            return {
                text: `${type} formatı için üretilen dinamik içerik. Seviye: ${grade}. Sınıf, Mod: ${isAi ? 'AI' : 'HIZLI'}, Konu: ${topic}`
            };
    }
};
