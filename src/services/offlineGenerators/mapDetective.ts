
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, _shuffle, getRandomItems } from './helpers';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ 
 * 1000x500 ölçekli standart siyasi harita görseli için kalibre edildi.
 * 81 İL — Tam Türkiye
 */
const CALIBRATED_CITIES = [
    // === MARMARA ===
    { id: "tr-34", name: "İstanbul", x: 173, y: 67, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] },
    { id: "tr-16", name: "Bursa", x: 177, y: 143, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"] },
    { id: "tr-22", name: "Edirne", x: 52, y: 50, region: "Marmara", isCoastal: false, neighbors: ["Kırklareli", "Tekirdağ"] },
    { id: "tr-59", name: "Tekirdağ", x: 97, y: 70, region: "Marmara", isCoastal: true, neighbors: ["Edirne", "Kırklareli", "İstanbul"] },
    { id: "tr-41", name: "Kocaeli", x: 220, y: 93, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Sakarya", "Bursa", "Yalova"] },
    { id: "tr-54", name: "Sakarya", x: 250, y: 104, region: "Marmara", isCoastal: false, neighbors: ["Kocaeli", "Düzce", "Bolu", "Bilecik", "Bursa"] },
    { id: "tr-10", name: "Balıkesir", x: 106, y: 151, region: "Marmara", isCoastal: true, neighbors: ["Çanakkale", "Bursa", "Kütahya", "Manisa"] },
    { id: "tr-17", name: "Çanakkale", x: 48, y: 129, region: "Marmara", isCoastal: true, neighbors: ["Edirne", "Tekirdağ", "Balıkesir"] },
    { id: "tr-39", name: "Kırklareli", x: 104, y: 29, region: "Marmara", isCoastal: false, neighbors: ["Edirne", "Tekirdağ", "İstanbul"] },
    { id: "tr-77", name: "Yalova", x: 183, y: 109, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Bursa", "Kocaeli"] },
    { id: "tr-11", name: "Bilecik", x: 232, y: 146, region: "Marmara", isCoastal: false, neighbors: ["Sakarya", "Bolu", "Eskişehir", "Kütahya", "Bursa"] },

    // === EGE ===
    { id: "tr-35", name: "İzmir", x: 75, y: 232, region: "Ege", isCoastal: true, neighbors: ["Manisa", "Aydın", "Balıkesir"] },
    { id: "tr-48", name: "Muğla", x: 129, y: 351, region: "Ege", isCoastal: true, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"] },
    { id: "tr-09", name: "Aydın", x: 106, y: 294, region: "Ege", isCoastal: true, neighbors: ["İzmir", "Manisa", "Denizli", "Muğla"] },
    { id: "tr-45", name: "Manisa", x: 116, y: 228, region: "Ege", isCoastal: false, neighbors: ["Balıkesir", "İzmir", "Aydın", "Denizli", "Uşak", "Kütahya"] },
    { id: "tr-20", name: "Denizli", x: 172, y: 305, region: "Ege", isCoastal: false, neighbors: ["Aydın", "Muğla", "Burdur", "Afyon", "Uşak", "Manisa"] },
    { id: "tr-03", name: "Afyon", x: 255, y: 254, region: "Ege", isCoastal: false, neighbors: ["Kütahya", "Eskişehir", "Konya", "Isparta", "Burdur", "Denizli", "Uşak"] },
    { id: "tr-43", name: "Kütahya", x: 194, y: 195, region: "Ege", isCoastal: false, neighbors: ["Balıkesir", "Bursa", "Bilecik", "Eskişehir", "Afyon", "Uşak", "Manisa"] },
    { id: "tr-64", name: "Uşak", x: 184, y: 245, region: "Ege", isCoastal: false, neighbors: ["Manisa", "Denizli", "Afyon", "Kütahya"] },

    // === AKDENİZ ===
    { id: "tr-07", name: "Antalya", x: 259, y: 376, region: "Akdeniz", isCoastal: true, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"] },
    { id: "tr-01", name: "Adana", x: 516, y: 329, region: "Akdeniz", isCoastal: true, neighbors: ["Mersin", "Niğde", "Kayseri", "Osmaniye", "Hatay"] },
    { id: "tr-31", name: "Hatay", x: 547, y: 403, region: "Akdeniz", isCoastal: true, neighbors: ["Adana", "Osmaniye", "Gaziantep"] },
    { id: "tr-33", name: "Mersin", x: 419, y: 381, region: "Akdeniz", isCoastal: true, neighbors: ["Antalya", "Konya", "Karaman", "Niğde", "Adana"] },
    { id: "tr-32", name: "Isparta", x: 257, y: 295, region: "Akdeniz", isCoastal: false, neighbors: ["Burdur", "Afyon", "Konya", "Antalya"] },
    { id: "tr-15", name: "Burdur", x: 216, y: 329, region: "Akdeniz", isCoastal: false, neighbors: ["Muğla", "Denizli", "Afyon", "Isparta", "Antalya"] },
    { id: "tr-46", name: "Kahramanmaraş", x: 587, y: 304, region: "Akdeniz", isCoastal: false, neighbors: ["Adana", "Kayseri", "Sivas", "Malatya", "Adıyaman", "Gaziantep", "Osmaniye"] },
    { id: "tr-80", name: "Osmaniye", x: 547, y: 338, region: "Akdeniz", isCoastal: false, neighbors: ["Adana", "Kayseri", "Kahramanmaraş", "Gaziantep", "Hatay"] },

    // === İÇ ANADOLU ===
    { id: "tr-06", name: "Ankara", x: 345, y: 180, region: "İç Anadolu", isCoastal: false, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"] },
    { id: "tr-42", name: "Konya", x: 365, y: 294, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Aksaray", "Niğde", "Karaman", "Antalya", "Isparta", "Afyon", "Eskişehir"] },
    { id: "tr-26", name: "Eskişehir", x: 273, y: 181, region: "İç Anadolu", isCoastal: false, neighbors: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyon", "Kütahya"] },
    { id: "tr-58", name: "Sivas", x: 599, y: 190, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Kayseri", "Kahramanmaraş", "Malatya", "Erzincan", "Giresun", "Ordu", "Tokat"] },
    { id: "tr-38", name: "Kayseri", x: 527, y: 257, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Sivas", "Kahramanmaraş", "Adana", "Niğde", "Nevşehir"] },
    { id: "tr-70", name: "Karaman", x: 384, y: 361, region: "İç Anadolu", isCoastal: false, neighbors: ["Konya", "Mersin", "Antalya", "Niğde"] },
    { id: "tr-51", name: "Niğde", x: 462, y: 303, region: "İç Anadolu", isCoastal: false, neighbors: ["Aksaray", "Nevşehir", "Kayseri", "Adana", "Mersin", "Karaman", "Konya"] },
    { id: "tr-50", name: "Nevşehir", x: 462, y: 236, region: "İç Anadolu", isCoastal: false, neighbors: ["Kırşehir", "Kayseri", "Niğde", "Aksaray", "Yozgat"] },
    { id: "tr-68", name: "Aksaray", x: 416, y: 262, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Kırşehir", "Nevşehir", "Niğde", "Konya"] },
    { id: "tr-40", name: "Kırşehir", x: 432, y: 207, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Kırıkkale", "Yozgat", "Nevşehir", "Aksaray"] },
    { id: "tr-71", name: "Kırıkkale", x: 415, y: 171, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Çankırı", "Yozgat", "Kırşehir"] },
    { id: "tr-66", name: "Yozgat", x: 490, y: 188, region: "İç Anadolu", isCoastal: false, neighbors: ["Kırıkkale", "Çankırı", "Amasya", "Tokat", "Sivas", "Kayseri", "Nevşehir", "Kırşehir"] },
    { id: "tr-18", name: "Çankırı", x: 402, y: 115, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Bolu", "Kastamonu", "Çorum", "Kırıkkale"] },

    // === KARADENİZ ===
    { id: "tr-55", name: "Samsun", x: 533, y: 75, region: "Karadeniz", isCoastal: true, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"] },
    { id: "tr-61", name: "Trabzon", x: 729, y: 103, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Giresun", "Gümüşhane", "Bayburt"] },
    { id: "tr-67", name: "Zonguldak", x: 320, y: 71, region: "Karadeniz", isCoastal: true, neighbors: ["Düzce", "Bolu", "Karabük", "Bartın"] },
    { id: "tr-14", name: "Bolu", x: 305, y: 117, region: "Karadeniz", isCoastal: false, neighbors: ["Düzce", "Zonguldak", "Karabük", "Çankırı", "Ankara", "Eskişehir", "Bilecik", "Sakarya"] },
    { id: "tr-81", name: "Düzce", x: 293, y: 97, region: "Karadeniz", isCoastal: false, neighbors: ["Sakarya", "Bolu", "Zonguldak"] },
    { id: "tr-52", name: "Ordu", x: 608, y: 111, region: "Karadeniz", isCoastal: true, neighbors: ["Samsun", "Tokat", "Sivas", "Giresun"] },
    { id: "tr-28", name: "Giresun", x: 666, y: 122, region: "Karadeniz", isCoastal: true, neighbors: ["Ordu", "Sivas", "Erzincan", "Gümüşhane", "Trabzon"] },
    { id: "tr-53", name: "Rize", x: 784, y: 93, region: "Karadeniz", isCoastal: true, neighbors: ["Trabzon", "Artvin", "Erzurum"] },
    { id: "tr-08", name: "Artvin", x: 834, y: 83, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Erzurum", "Ardahan"] },
    { id: "tr-57", name: "Sinop", x: 479, y: 50, region: "Karadeniz", isCoastal: true, neighbors: ["Kastamonu", "Çankırı", "Çorum", "Samsun"] },
    { id: "tr-37", name: "Kastamonu", x: 415, y: 62, region: "Karadeniz", isCoastal: true, neighbors: ["Bartın", "Karabük", "Çankırı", "Sinop"] },
    { id: "tr-78", name: "Karabük", x: 362, y: 77, region: "Karadeniz", isCoastal: false, neighbors: ["Zonguldak", "Bartın", "Kastamonu", "Çankırı", "Bolu"] },
    { id: "tr-74", name: "Bartın", x: 355, y: 52, region: "Karadeniz", isCoastal: true, neighbors: ["Zonguldak", "Karabük", "Kastamonu"] },
    { id: "tr-60", name: "Tokat", x: 566, y: 131, region: "Karadeniz", isCoastal: false, neighbors: ["Amasya", "Samsun", "Ordu", "Sivas", "Yozgat"] },
    { id: "tr-05", name: "Amasya", x: 518, y: 115, region: "Karadeniz", isCoastal: false, neighbors: ["Samsun", "Çorum", "Yozgat", "Tokat"] },
    { id: "tr-19", name: "Çorum", x: 470, y: 117, region: "Karadeniz", isCoastal: false, neighbors: ["Çankırı", "Kastamonu", "Sinop", "Samsun", "Amasya", "Yozgat"] },
    { id: "tr-29", name: "Gümüşhane", x: 711, y: 136, region: "Karadeniz", isCoastal: false, neighbors: ["Trabzon", "Giresun", "Erzincan", "Bayburt"] },
    { id: "tr-69", name: "Bayburt", x: 749, y: 137, region: "Karadeniz", isCoastal: false, neighbors: ["Trabzon", "Gümüşhane", "Erzincan", "Erzurum"] },

    // === DOĞU ANADOLU ===
    { id: "tr-25", name: "Erzurum", x: 814, y: 146, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl", "Erzincan", "Rize", "Bayburt"] },
    { id: "tr-65", name: "Van", x: 936, y: 238, region: "Doğu Anadolu", isCoastal: true, neighbors: ["Ağrı", "Bitlis", "Hakkari"] },
    { id: "tr-44", name: "Malatya", x: 661, y: 258, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Erzincan", "Tunceli", "Elazığ", "Adıyaman", "Kahramanmaraş"] },
    { id: "tr-24", name: "Erzincan", x: 725, y: 187, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Giresun", "Gümüşhane", "Bayburt", "Erzurum", "Bingöl", "Tunceli", "Malatya"] },
    { id: "tr-23", name: "Elazığ", x: 711, y: 236, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Malatya", "Tunceli", "Bingöl", "Diyarbakır"] },
    { id: "tr-62", name: "Tunceli", x: 719, y: 211, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzincan", "Bingöl", "Elazığ", "Malatya"] },
    { id: "tr-12", name: "Bingöl", x: 775, y: 221, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Erzincan", "Tunceli", "Elazığ", "Diyarbakır", "Muş"] },
    { id: "tr-49", name: "Muş", x: 846, y: 216, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Bingöl", "Diyarbakır", "Bitlis", "Ağrı"] },
    { id: "tr-04", name: "Ağrı", x: 919, y: 181, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Erzurum", "Kars", "Iğdır", "Van", "Muş"] },
    { id: "tr-36", name: "Kars", x: 892, y: 110, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Ardahan", "Erzurum", "Ağrı", "Iğdır"] },
    { id: "tr-75", name: "Ardahan", x: 885, y: 73, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Kars", "Erzurum"] },
    { id: "tr-76", name: "Iğdır", x: 950, y: 150, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Kars", "Ağrı"] },
    { id: "tr-13", name: "Bitlis", x: 872, y: 249, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Muş", "Van", "Siirt"] },
    { id: "tr-30", name: "Hakkari", x: 971, y: 316, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Van", "Şırnak"] },

    // === GÜNEYDOĞU ANADOLU ===
    { id: "tr-21", name: "Diyarbakır", x: 768, y: 279, region: "Güneydoğu", isCoastal: false, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman"] },
    { id: "tr-27", name: "Gaziantep", x: 602, y: 352, region: "Güneydoğu", isCoastal: false, neighbors: ["Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis", "Osmaniye", "Hatay"] },
    { id: "tr-63", name: "Şanlıurfa", x: 702, y: 335, region: "Güneydoğu", isCoastal: false, neighbors: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"] },
    { id: "tr-47", name: "Mardin", x: 803, y: 335, region: "Güneydoğu", isCoastal: false, neighbors: ["Şanlıurfa", "Diyarbakır", "Batman", "Siirt", "Şırnak"] },
    { id: "tr-02", name: "Adıyaman", x: 659, y: 307, region: "Güneydoğu", isCoastal: false, neighbors: ["Malatya", "Elazığ", "Diyarbakır", "Şanlıurfa", "Gaziantep", "Kahramanmaraş"] },
    { id: "tr-72", name: "Batman", x: 821, y: 281, region: "Güneydoğu", isCoastal: false, neighbors: ["Diyarbakır", "Muş", "Bitlis", "Siirt", "Mardin"] },
    { id: "tr-56", name: "Siirt", x: 863, y: 292, region: "Güneydoğu", isCoastal: false, neighbors: ["Bitlis", "Muş", "Batman", "Mardin", "Şırnak"] },
    { id: "tr-73", name: "Şırnak", x: 888, y: 319, region: "Güneydoğu", isCoastal: false, neighbors: ["Mardin", "Siirt", "Hakkari"] },
    { id: "tr-79", name: "Kilis", x: 595, y: 374, region: "Güneydoğu", isCoastal: false, neighbors: ["Gaziantep"] },
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
