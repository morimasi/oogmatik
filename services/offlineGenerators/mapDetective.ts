
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ 
 * 1000x500 ölçekli standart siyasi harita görseli için kalibre edildi.
 * 81 İL — Tam Türkiye
 */
const CALIBRATED_CITIES = [
    // === MARMARA ===
    { id: "tr-34", name: "İstanbul", x: 175, y: 115, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] },
    { id: "tr-16", name: "Bursa", x: 215, y: 195, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"] },
    { id: "tr-22", name: "Edirne", x: 55, y: 65, region: "Marmara", isCoastal: false, neighbors: ["Kırklareli", "Tekirdağ"] },
    { id: "tr-59", name: "Tekirdağ", x: 100, y: 80, region: "Marmara", isCoastal: true, neighbors: ["Edirne", "Kırklareli", "İstanbul"] },
    { id: "tr-41", name: "Kocaeli", x: 225, y: 135, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Sakarya", "Bursa", "Yalova"] },
    { id: "tr-54", name: "Sakarya", x: 260, y: 140, region: "Marmara", isCoastal: false, neighbors: ["Kocaeli", "Düzce", "Bolu", "Bilecik", "Bursa"] },
    { id: "tr-10", name: "Balıkesir", x: 125, y: 230, region: "Marmara", isCoastal: true, neighbors: ["Çanakkale", "Bursa", "Kütahya", "Manisa"] },
    { id: "tr-17", name: "Çanakkale", x: 75, y: 195, region: "Marmara", isCoastal: true, neighbors: ["Edirne", "Tekirdağ", "Balıkesir"] },
    { id: "tr-39", name: "Kırklareli", x: 85, y: 55, region: "Marmara", isCoastal: false, neighbors: ["Edirne", "Tekirdağ", "İstanbul"] },
    { id: "tr-77", name: "Yalova", x: 210, y: 160, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Bursa", "Kocaeli"] },
    { id: "tr-11", name: "Bilecik", x: 275, y: 185, region: "Marmara", isCoastal: false, neighbors: ["Sakarya", "Bolu", "Eskişehir", "Kütahya", "Bursa"] },

    // === EGE ===
    { id: "tr-35", name: "İzmir", x: 80, y: 310, region: "Ege", isCoastal: true, neighbors: ["Manisa", "Aydın", "Balıkesir"] },
    { id: "tr-48", name: "Muğla", x: 140, y: 415, region: "Ege", isCoastal: true, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"] },
    { id: "tr-09", name: "Aydın", x: 105, y: 370, region: "Ege", isCoastal: true, neighbors: ["İzmir", "Manisa", "Denizli", "Muğla"] },
    { id: "tr-45", name: "Manisa", x: 120, y: 275, region: "Ege", isCoastal: false, neighbors: ["Balıkesir", "İzmir", "Aydın", "Denizli", "Uşak", "Kütahya"] },
    { id: "tr-20", name: "Denizli", x: 170, y: 365, region: "Ege", isCoastal: false, neighbors: ["Aydın", "Muğla", "Burdur", "Afyon", "Uşak", "Manisa"] },
    { id: "tr-03", name: "Afyon", x: 285, y: 295, region: "Ege", isCoastal: false, neighbors: ["Kütahya", "Eskişehir", "Konya", "Isparta", "Burdur", "Denizli", "Uşak"] },
    { id: "tr-43", name: "Kütahya", x: 230, y: 240, region: "Ege", isCoastal: false, neighbors: ["Balıkesir", "Bursa", "Bilecik", "Eskişehir", "Afyon", "Uşak", "Manisa"] },
    { id: "tr-64", name: "Uşak", x: 190, y: 310, region: "Ege", isCoastal: false, neighbors: ["Manisa", "Denizli", "Afyon", "Kütahya"] },

    // === AKDENİZ ===
    { id: "tr-07", name: "Antalya", x: 295, y: 440, region: "Akdeniz", isCoastal: true, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"] },
    { id: "tr-01", name: "Adana", x: 565, y: 420, region: "Akdeniz", isCoastal: true, neighbors: ["Mersin", "Niğde", "Kayseri", "Osmaniye", "Hatay"] },
    { id: "tr-31", name: "Hatay", x: 600, y: 490, region: "Akdeniz", isCoastal: true, neighbors: ["Adana", "Osmaniye", "Gaziantep"] },
    { id: "tr-33", name: "Mersin", x: 480, y: 440, region: "Akdeniz", isCoastal: true, neighbors: ["Antalya", "Konya", "Karaman", "Niğde", "Adana"] },
    { id: "tr-32", name: "Isparta", x: 305, y: 370, region: "Akdeniz", isCoastal: false, neighbors: ["Burdur", "Afyon", "Konya", "Antalya"] },
    { id: "tr-15", name: "Burdur", x: 240, y: 390, region: "Akdeniz", isCoastal: false, neighbors: ["Muğla", "Denizli", "Afyon", "Isparta", "Antalya"] },
    { id: "tr-46", name: "Kahramanmaraş", x: 630, y: 375, region: "Akdeniz", isCoastal: false, neighbors: ["Adana", "Kayseri", "Sivas", "Malatya", "Adıyaman", "Gaziantep", "Osmaniye"] },
    { id: "tr-80", name: "Osmaniye", x: 600, y: 430, region: "Akdeniz", isCoastal: false, neighbors: ["Adana", "Kayseri", "Kahramanmaraş", "Gaziantep", "Hatay"] },

    // === İÇ ANADOLU ===
    { id: "tr-06", name: "Ankara", x: 410, y: 215, region: "İç Anadolu", isCoastal: false, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"] },
    { id: "tr-42", name: "Konya", x: 425, y: 385, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Aksaray", "Niğde", "Karaman", "Antalya", "Isparta", "Afyon", "Eskişehir"] },
    { id: "tr-26", name: "Eskişehir", x: 315, y: 225, region: "İç Anadolu", isCoastal: false, neighbors: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyon", "Kütahya"] },
    { id: "tr-58", name: "Sivas", x: 620, y: 220, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Kayseri", "Kahramanmaraş", "Malatya", "Erzincan", "Giresun", "Ordu", "Tokat"] },
    { id: "tr-38", name: "Kayseri", x: 550, y: 285, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Sivas", "Kahramanmaraş", "Adana", "Niğde", "Nevşehir"] },
    { id: "tr-70", name: "Karaman", x: 420, y: 415, region: "İç Anadolu", isCoastal: false, neighbors: ["Konya", "Mersin", "Antalya", "Niğde"] },
    { id: "tr-51", name: "Niğde", x: 505, y: 340, region: "İç Anadolu", isCoastal: false, neighbors: ["Aksaray", "Nevşehir", "Kayseri", "Adana", "Mersin", "Karaman", "Konya"] },
    { id: "tr-50", name: "Nevşehir", x: 510, y: 290, region: "İç Anadolu", isCoastal: false, neighbors: ["Kırşehir", "Kayseri", "Niğde", "Aksaray", "Yozgat"] },
    { id: "tr-68", name: "Aksaray", x: 470, y: 310, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Kırşehir", "Nevşehir", "Niğde", "Konya"] },
    { id: "tr-40", name: "Kırşehir", x: 490, y: 250, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Kırıkkale", "Yozgat", "Nevşehir", "Aksaray"] },
    { id: "tr-71", name: "Kırıkkale", x: 460, y: 215, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Çankırı", "Yozgat", "Kırşehir"] },
    { id: "tr-66", name: "Yozgat", x: 530, y: 230, region: "İç Anadolu", isCoastal: false, neighbors: ["Kırıkkale", "Çankırı", "Amasya", "Tokat", "Sivas", "Kayseri", "Nevşehir", "Kırşehir"] },
    { id: "tr-18", name: "Çankırı", x: 440, y: 165, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Bolu", "Kastamonu", "Çorum", "Kırıkkale"] },

    // === KARADENİZ ===
    { id: "tr-55", name: "Samsun", x: 555, y: 110, region: "Karadeniz", isCoastal: true, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"] },
    { id: "tr-61", name: "Trabzon", x: 735, y: 135, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Giresun", "Gümüşhane", "Bayburt"] },
    { id: "tr-67", name: "Zonguldak", x: 330, y: 110, region: "Karadeniz", isCoastal: true, neighbors: ["Düzce", "Bolu", "Karabük", "Bartın"] },
    { id: "tr-14", name: "Bolu", x: 330, y: 150, region: "Karadeniz", isCoastal: false, neighbors: ["Düzce", "Zonguldak", "Karabük", "Çankırı", "Ankara", "Eskişehir", "Bilecik", "Sakarya"] },
    { id: "tr-81", name: "Düzce", x: 290, y: 130, region: "Karadeniz", isCoastal: false, neighbors: ["Sakarya", "Bolu", "Zonguldak"] },
    { id: "tr-52", name: "Ordu", x: 620, y: 120, region: "Karadeniz", isCoastal: true, neighbors: ["Samsun", "Tokat", "Sivas", "Giresun"] },
    { id: "tr-28", name: "Giresun", x: 665, y: 125, region: "Karadeniz", isCoastal: true, neighbors: ["Ordu", "Sivas", "Erzincan", "Gümüşhane", "Trabzon"] },
    { id: "tr-53", name: "Rize", x: 775, y: 130, region: "Karadeniz", isCoastal: true, neighbors: ["Trabzon", "Artvin", "Erzurum"] },
    { id: "tr-08", name: "Artvin", x: 820, y: 120, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Erzurum", "Ardahan"] },
    { id: "tr-57", name: "Sinop", x: 515, y: 95, region: "Karadeniz", isCoastal: true, neighbors: ["Kastamonu", "Çankırı", "Çorum", "Samsun"] },
    { id: "tr-37", name: "Kastamonu", x: 440, y: 115, region: "Karadeniz", isCoastal: true, neighbors: ["Bartın", "Karabük", "Çankırı", "Sinop"] },
    { id: "tr-78", name: "Karabük", x: 380, y: 120, region: "Karadeniz", isCoastal: false, neighbors: ["Zonguldak", "Bartın", "Kastamonu", "Çankırı", "Bolu"] },
    { id: "tr-74", name: "Bartın", x: 355, y: 100, region: "Karadeniz", isCoastal: true, neighbors: ["Zonguldak", "Karabük", "Kastamonu"] },
    { id: "tr-60", name: "Tokat", x: 580, y: 170, region: "Karadeniz", isCoastal: false, neighbors: ["Amasya", "Samsun", "Ordu", "Sivas", "Yozgat"] },
    { id: "tr-05", name: "Amasya", x: 545, y: 155, region: "Karadeniz", isCoastal: false, neighbors: ["Samsun", "Çorum", "Yozgat", "Tokat"] },
    { id: "tr-19", name: "Çorum", x: 490, y: 150, region: "Karadeniz", isCoastal: false, neighbors: ["Çankırı", "Kastamonu", "Sinop", "Samsun", "Amasya", "Yozgat"] },
    { id: "tr-29", name: "Gümüşhane", x: 720, y: 165, region: "Karadeniz", isCoastal: false, neighbors: ["Trabzon", "Giresun", "Erzincan", "Bayburt"] },
    { id: "tr-69", name: "Bayburt", x: 760, y: 170, region: "Karadeniz", isCoastal: false, neighbors: ["Trabzon", "Gümüşhane", "Erzincan", "Erzurum"] },

    // === DOĞU ANADOLU ===
    { id: "tr-25", name: "Erzurum", x: 855, y: 200, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl", "Erzincan", "Rize", "Bayburt"] },
    { id: "tr-65", name: "Van", x: 965, y: 325, region: "Doğu Anadolu", isCoastal: true, neighbors: ["Ağrı", "Bitlis", "Hakkari"] },
    { id: "tr-44", name: "Malatya", x: 685, y: 315, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Erzincan", "Tunceli", "Elazığ", "Adıyaman", "Kahramanmaraş"] },
    { id: "tr-24", name: "Erzincan", x: 720, y: 220, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Giresun", "Gümüşhane", "Bayburt", "Erzurum", "Bingöl", "Tunceli", "Malatya"] },
    { id: "tr-23", name: "Elazığ", x: 740, y: 330, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Malatya", "Tunceli", "Bingöl", "Diyarbakır"] },
    { id: "tr-62", name: "Tunceli", x: 720, y: 280, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzincan", "Bingöl", "Elazığ", "Malatya"] },
    { id: "tr-12", name: "Bingöl", x: 790, y: 290, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Erzincan", "Tunceli", "Elazığ", "Diyarbakır", "Muş"] },
    { id: "tr-49", name: "Muş", x: 870, y: 310, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Bingöl", "Diyarbakır", "Bitlis", "Ağrı"] },
    { id: "tr-04", name: "Ağrı", x: 930, y: 245, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Kars", "Iğdır", "Van", "Muş"] },
    { id: "tr-36", name: "Kars", x: 920, y: 180, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Ardahan", "Erzurum", "Ağrı", "Iğdır"] },
    { id: "tr-75", name: "Ardahan", x: 880, y: 145, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Kars", "Erzurum"] },
    { id: "tr-76", name: "Iğdır", x: 965, y: 225, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Kars", "Ağrı"] },
    { id: "tr-13", name: "Bitlis", x: 920, y: 340, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Muş", "Van", "Siirt"] },
    { id: "tr-30", name: "Hakkari", x: 980, y: 385, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Van", "Şırnak"] },

    // === GÜNEYDOĞU ANADOLU ===
    { id: "tr-21", name: "Diyarbakır", x: 815, y: 365, region: "Güneydoğu", isCoastal: false, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman"] },
    { id: "tr-27", name: "Gaziantep", x: 655, y: 425, region: "Güneydoğu", isCoastal: false, neighbors: ["Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis", "Osmaniye", "Hatay"] },
    { id: "tr-63", name: "Şanlıurfa", x: 740, y: 435, region: "Güneydoğu", isCoastal: false, neighbors: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"] },
    { id: "tr-47", name: "Mardin", x: 865, y: 440, region: "Güneydoğu", isCoastal: false, neighbors: ["Şanlıurfa", "Diyarbakır", "Batman", "Siirt", "Şırnak"] },
    { id: "tr-02", name: "Adıyaman", x: 700, y: 385, region: "Güneydoğu", isCoastal: false, neighbors: ["Malatya", "Elazığ", "Diyarbakır", "Şanlıurfa", "Gaziantep", "Kahramanmaraş"] },
    { id: "tr-72", name: "Batman", x: 850, y: 390, region: "Güneydoğu", isCoastal: false, neighbors: ["Diyarbakır", "Muş", "Bitlis", "Siirt", "Mardin"] },
    { id: "tr-56", name: "Siirt", x: 890, y: 385, region: "Güneydoğu", isCoastal: false, neighbors: ["Bitlis", "Muş", "Batman", "Mardin", "Şırnak"] },
    { id: "tr-73", name: "Şırnak", x: 930, y: 415, region: "Güneydoğu", isCoastal: false, neighbors: ["Mardin", "Siirt", "Hakkari"] },
    { id: "tr-79", name: "Kilis", x: 640, y: 445, region: "Güneydoğu", isCoastal: false, neighbors: ["Gaziantep"] },
];

// ============================================================
// YÖNERGE ÜRETIM MOTORU — 5 KADEMELİ ZORLUK
// ============================================================

type InstructionType = 'spatial_logic' | 'linguistic_geo' | 'attribute_search' | 'neighbor_path' | 'route_planning';

const DIFFICULTY_MAP: Record<string, number> = {
    'Başlangıç': 1, 'Orta': 2, 'Zor': 3, 'Uzman': 4, 'Klinik': 5
};

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion, customInput } = options;
    const results: MapInstructionData[] = [];
    const level = DIFFICULTY_MAP[difficulty || 'Orta'] || 2;

    // 1. Odak Bölgeye Göre Şehir Havuzunu Filtrele
    const isRegionFocused = emphasizedRegion && emphasizedRegion !== 'all';
    const cityPool = isRegionFocused
        ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
        : CALIBRATED_CITIES;

    const safeCityPool = cityPool.length > 0 ? cityPool : CALIBRATED_CITIES;

    // 2. Aktif Yönerge Tiplerini Belirle
    const activeTypes: InstructionType[] = (mapInstructionTypes && mapInstructionTypes.length > 0)
        ? mapInstructionTypes as InstructionType[]
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path', 'route_planning'];

    // 3. Yönerge Üretici
    const generateInstruction = (): string => {
        const type = getRandomItems(activeTypes, 1)[0];
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];

        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            if (level >= 4) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, bu ilin ismindeki tüm ünlü harfleri say ve haritanın altına not et. Sonra bu ilden güneye doğru bir ok çiz.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, ismini yaz ve hangi bölgede olduğunu belirt.`;
            }
            if (level >= 2) {
                return `${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
            }
            return `Haritada ${randomCity.name} ilini BUL ve üzerine bir DAİRE çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K', 'E', 'D'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE', 'TURUNCUYA'];
            const color = colors[getRandomInt(0, colors.length - 1)];

            if (level >= 4) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan tüm illeri bulup ${color} boya. Kaç tane olduğunu haritanın altına yaz.`;
            }
            if (level >= 3) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan bir ili bul ve ${color} boya. Eğer birden fazla varsa en büyüğünü seç.`;
            }
            if (level >= 2) {
                return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bul ve ${color} boya.`;
            }
            return `İsminde "${char}" harfi geçen bir ili haritada bul ve göster.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            if (level >= 4) {
                return `${randomCity.region} bölgesinde yer alan, denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} ve isminde çift sayıda hece bulunan bir şehri bul. Adını ve hece sayısını yaz.`;
            }
            if (level >= 3) {
                return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve daire içine al.`;
            }
            if (level >= 2) {
                return `${randomCity.region} bölgesinde denize kıyısı ${isCoastal ? 'olan' : 'olmayan'} bir il göster.`;
            }
            return `Denize kıyısı olan bir ili haritada bul ve göster.`;
        }

        if (type === 'neighbor_path') {
            const potentialDest = CALIBRATED_CITIES.filter(c => c.id !== randomCity.id);
            const dest = potentialDest[getRandomInt(0, potentialDest.length - 1)];

            if (level >= 4) {
                const n1 = randomCity.neighbors?.[0] || 'komşu il';
                return `${randomCity.name} → ${n1} → ? → ${dest.name} rotasındaki eksik ili bul ve haritaya yaz. Bu rotanın kaç şehirden geçtiğini hesapla.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest.name} iline giderken geçmen gereken komşu illerden birini bul ve isminin üzerini çiz.`;
            }
            if (level >= 2) {
                return `${randomCity.name} ilinden ${dest.name} iline doğru giderken geçtiğin bir şehri bul ve göster.`;
            }
            return `${randomCity.name} ilinin komşu illerinden birini bul ve göster.`;
        }

        if (type === 'route_planning') {
            const dest = CALIBRATED_CITIES.filter(c => c.region !== randomCity.region)[getRandomInt(0, 10)];
            if (level >= 4) {
                return `${randomCity.name} ilinden ${dest?.name || 'Ankara'} iline en kısa rotayı çiz. Geçtiğin illerin sayısını ve hangi bölgelerden geçtiğini yaz.`;
            }
            if (level >= 3) {
                return `${randomCity.name} ilinden ${dest?.name || 'İstanbul'} iline giden bir rota çiz. En az 3 şehirden geçmelisin.`;
            }
            return `${randomCity.name} ilinden başlayarak 3 komşu ili ziyaret eden bir yol çiz.`;
        }

        return `Haritadaki en büyük şehri bul ve üzerine bir çarpı (X) koy.`;
    };

    // 4. Sayfalar
    for (let p = 0; p < worksheetCount; p++) {
        const instructions: string[] = [];
        const count = itemCount || (level <= 1 ? 5 : level <= 2 ? 8 : level <= 3 ? 10 : 12);

        for (let i = 0; i < count; i++) {
            instructions.push(generateInstruction());
        }

        const regionLabel = emphasizedRegion === 'all' || !emphasizedRegion ? 'Türkiye' : emphasizedRegion + ' Bölgesi';
        const diffLabel = difficulty || 'Orta';

        results.push({
            title: `Harita Dedektifi: ${regionLabel} Analizi`,
            instruction: `${diffLabel} Seviyesi — Haritadaki illeri ve bölgeleri inceleyerek yönergeleri hatasız uygula.`,
            pedagogicalNote: `Bu çalışma; görsel tarama, uzamsal konumlandırma, yön kavramı, dikkat ve yönerge takip becerilerini ${diffLabel} düzeyinde geliştirir.`,
            imageBase64: customInput,
            emphasizedRegion: emphasizedRegion || 'all',
            difficultyLevel: level as 1 | 2 | 3 | 4 | 5,
            cities: isRegionFocused ? safeCityPool.map(c => ({ ...c })) : CALIBRATED_CITIES.map(c => ({ ...c })),
            instructions,
            settings: {
                showCityNames: showCityNames !== undefined ? showCityNames : true,
                markerStyle: (markerStyle as any) || 'circle',
                difficulty: diffLabel
            }
        });
    }

    return results;
};
