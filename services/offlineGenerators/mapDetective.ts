
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ 
 * 1000x500 ölçekli standart siyasi harita görseli için kalibre edildi.
 */
const CALIBRATED_CITIES = [
    { id: "tr-34", name: "İstanbul", x: 175, y: 115, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] },
    { id: "tr-06", name: "Ankara", x: 410, y: 215, region: "İç Anadolu", isCoastal: false, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"] },
    { id: "tr-35", name: "İzmir", x: 80, y: 310, region: "Ege", isCoastal: true, neighbors: ["Manisa", "Aydın", "Balıkesir"] },
    { id: "tr-07", name: "Antalya", x: 295, y: 440, region: "Akdeniz", isCoastal: true, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"] },
    { id: "tr-01", name: "Adana", x: 565, y: 420, region: "Akdeniz", isCoastal: true, neighbors: ["Mersin", "Niğde", "Kayseri", "Osmaniye", "Hatay"] },
    { id: "tr-61", name: "Trabzon", x: 735, y: 135, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Giresun", "Gümüşhane", "Bayburt"] },
    { id: "tr-25", name: "Erzurum", x: 855, y: 230, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl", "Erzincan", "Rize", "Bayburt"] },
    { id: "tr-65", name: "Van", x: 965, y: 325, region: "Doğu Anadolu", isCoastal: true, neighbors: ["Ağrı", "Iğdır", "Hakkari", "Şırnak", "Siirt", "Bitlis"] },
    { id: "tr-21", name: "Diyarbakır", x: 815, y: 365, region: "Güneydoğu", isCoastal: false, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman"] },
    { id: "tr-27", name: "Gaziantep", x: 655, y: 425, region: "Güneydoğu", isCoastal: false, neighbors: ["Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis", "Osmaniye"] },
    { id: "tr-55", name: "Samsun", x: 555, y: 110, region: "Karadeniz", isCoastal: true, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"] },
    { id: "tr-42", name: "Konya", x: 425, y: 385, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Aksaray", "Niğde", "Karaman", "Antalya", "Isparta", "Afyonkarahisar", "Eskişehir"] },
    { id: "tr-16", name: "Bursa", x: 215, y: 195, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"] },
    { id: "tr-58", name: "Sivas", x: 620, y: 220, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Kayseri", "Kahramanmaraş", "Malatya", "Erzincan", "Giresun", "Ordu", "Tokat"] },
    { id: "tr-48", name: "Muğla", x: 140, y: 415, region: "Ege", isCoastal: true, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"] },
    { id: "tr-22", name: "Edirne", x: 55, y: 65, region: "Marmara", isCoastal: false, neighbors: ["Kırklareli", "Tekirdağ", "Çanakkale"] },
    { id: "tr-31", name: "Hatay", x: 600, y: 490, region: "Akdeniz", isCoastal: true, neighbors: ["Adana", "Osmaniye", "Gaziantep"] },
    { id: "tr-10", name: "Balıkesir", x: 125, y: 230, region: "Marmara", isCoastal: true, neighbors: ["Çanakkale", "Bursa", "Kütahya", "Manisa", "İzmir"] },
    { id: "tr-09", name: "Aydın", x: 105, y: 370, region: "Ege", isCoastal: true, neighbors: ["İzmir", "Manisa", "Denizli", "Muğla"] },
    { id: "tr-44", name: "Malatya", x: 685, y: 315, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Erzincan", "Tunceli", "Elazığ", "Diyarbakır", "Adıyaman", "Kahramanmaraş"] },
    { id: "tr-67", name: "Zonguldak", x: 330, y: 110, region: "Karadeniz", isCoastal: true, neighbors: ["Düzce", "Bolu", "Karabük", "Bartın"] },
    { id: "tr-26", name: "Eskişehir", x: 315, y: 225, region: "İç Anadolu", isCoastal: false, neighbors: ["Bilecik", "Bolu", "Ankara", "Konya", "Afyonkarahisar", "Kütahya"] },
    { id: "tr-03", name: "Afyon", x: 285, y: 295, region: "Ege", isCoastal: false, neighbors: ["Kütahya", "Eskişehir", "Konya", "Isparta", "Burdur", "Denizli", "Uşak"] },
    { id: "tr-38", name: "Kayseri", x: 550, y: 285, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Sivas", "Kahramanmaraş", "Adana", "Niğde", "Nevşehir"] },
    { id: "tr-63", name: "Şanlıurfa", x: 740, y: 435, region: "Güneydoğu", isCoastal: false, neighbors: ["Gaziantep", "Adıyaman", "Diyarbakır", "Mardin"] },
    { id: "tr-47", name: "Mardin", x: 865, y: 440, region: "Güneydoğu", isCoastal: false, neighbors: ["Şanlıurfa", "Diyarbakır", "Batman", "Siirt", "Şırnak"] }
];

export const generateOfflineMapInstruction = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion, customInput } = options;
    const results: MapInstructionData[] = [];

    // 1. Odak Bölgeye Göre Şehir Havuzunu Filtrele
    const isRegionFocused = emphasizedRegion && emphasizedRegion !== 'all';
    const cityPool = isRegionFocused
        ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
        : CALIBRATED_CITIES;

    const safeCityPool = cityPool.length > 0 ? cityPool : CALIBRATED_CITIES;

    // 2. Aktif Yönerge Tiplerini Belirle
    const activeTypes = (mapInstructionTypes && mapInstructionTypes.length > 0) 
        ? mapInstructionTypes 
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path'];

    const getAdvancedRule = () => {
        const type = getRandomItems(activeTypes, 1)[0];
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];
        const isAdvanced = difficulty === 'Zor' || difficulty === 'Uzman';

        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            if (isAdvanced) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, bu ilin ismindeki tüm ünlü harfleri sayarak haritanın altına not et.`;
            }
            return `${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE'];
            const color = colors[getRandomInt(0, colors.length - 1)];
            
            if (isAdvanced) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan bir şehri bulup ${color} boya. Eğer birden fazla varsa en büyüğünü seç.`;
            }
            return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bulup ${color} boya.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            if (isAdvanced) {
                return `${randomCity.region} bölgesinde yer alan, denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} ve isminde çift sayıda hece bulunan bir şehri bul ve adını yaz.`;
            }
            return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve daire içine al.`;
        }

        if (type === 'neighbor_path') {
            const potentialDestinations = CALIBRATED_CITIES.filter(c => c.id !== randomCity.id);
            const dest = potentialDestinations.length > 0 ? potentialDestinations[getRandomInt(0, potentialDestinations.length - 1)] : CALIBRATED_CITIES[0];
            
            if (isAdvanced) {
                return `${randomCity.name} ilinden yola çıkıp ${dest.name} iline doğru giderken geçmen gereken komşu illerden birini bul ve isminin üzerini çiz.`;
            }
            return `${randomCity.name} ilinden ${dest.name} iline doğru giderken geçtiğin bir şehri bul ve ismini boya.`;
        }

        return "Haritadaki en büyük şehri bul ve üzerine bir çarpı (X) koy.";
    };

    for (let p = 0; p < worksheetCount; p++) {
        const instructions: string[] = [];
        const count = itemCount || (difficulty === 'Başlangıç' ? 6 : difficulty === 'Orta' ? 8 : 12);

        for (let i = 0; i < count; i++) {
            instructions.push(getAdvancedRule());
        }

        results.push({
            title: `Harita Dedektifi: ${emphasizedRegion === 'all' ? 'Türkiye' : emphasizedRegion + ' Bölgesi'} Analizi`,
            instruction: `${difficulty} Seviyesi: Haritadaki şehirleri ve bölgeleri inceleyerek yönergeleri hatasız uygula.`,
            pedagogicalNote: `Bu çalışma; görsel tarama, uzamsal konumlandırma ve yönerge takip becerilerini ${difficulty} düzeyinde tetikler.`,
            imageBase64: customInput, // KULLANICI GÖRSELİNİ AKTAR
            cities: isRegionFocused ? safeCityPool.map(c => ({ ...c })) : CALIBRATED_CITIES.map(c => ({ ...c })),
            instructions,
            settings: {
                showCityNames: showCityNames !== undefined ? showCityNames : true,
                markerStyle: (markerStyle as any) || 'circle',
                difficulty
            }
        });
    }

    return results;
};
