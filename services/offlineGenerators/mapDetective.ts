
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ (1000x500 ölçekli gerçekçi harita için kalibre edildi)
 */
const CALIBRATED_CITIES = [
    { id: "tr-34", name: "İstanbul", x: 175, y: 105, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] },
    { id: "tr-06", name: "Ankara", x: 405, y: 205, region: "İç Anadolu", isCoastal: false, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"] },
    { id: "tr-35", name: "İzmir", x: 75, y: 310, region: "Ege", isCoastal: true, neighbors: ["Manisa", "Aydın", "Balıkesir"] },
    { id: "tr-07", name: "Antalya", x: 285, y: 440, region: "Akdeniz", isCoastal: true, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"] },
    { id: "tr-01", name: "Adana", x: 555, y: 420, region: "Akdeniz", isCoastal: true, neighbors: ["Mersin", "Niğde", "Kayseri", "Osmaniye", "Hatay"] },
    { id: "tr-61", name: "Trabzon", x: 735, y: 130, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Giresun", "Gümüşhane", "Bayburt"] },
    { id: "tr-25", name: "Erzurum", x: 860, y: 220, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl", "Erzincan", "Rize", "Bayburt"] },
    { id: "tr-65", name: "Van", x: 970, y: 320, region: "Doğu Anadolu", isCoastal: true, neighbors: ["Ağrı", "Iğdır", "Hakkari", "Şırnak", "Siirt", "Bitlis"] },
    { id: "tr-21", name: "Diyarbakır", x: 820, y: 370, region: "Güneydoğu", isCoastal: false, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman"] },
    { id: "tr-27", name: "Gaziantep", x: 650, y: 430, region: "Güneydoğu", isCoastal: false, neighbors: ["Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis", "Osmaniye"] },
    { id: "tr-55", name: "Samsun", x: 555, y: 105, region: "Karadeniz", isCoastal: true, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"] },
    { id: "tr-42", name: "Konya", x: 420, y: 380, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Aksaray", "Niğde", "Karaman", "Antalya", "Isparta", "Afyonkarahisar", "Eskişehir"] },
    { id: "tr-16", name: "Bursa", x: 210, y: 185, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"] },
    { id: "tr-58", name: "Sivas", x: 625, y: 215, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Kayseri", "Kahramanmaraş", "Malatya", "Erzincan", "Giresun", "Ordu", "Tokat"] },
    { id: "tr-48", name: "Muğla", x: 135, y: 410, region: "Ege", isCoastal: true, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"] },
    { id: "tr-22", name: "Edirne", x: 50, y: 60, region: "Marmara", isCoastal: false, neighbors: ["Kırklareli", "Tekirdağ", "Çanakkale"] },
    { id: "tr-31", name: "Hatay", x: 590, y: 490, region: "Akdeniz", isCoastal: true, neighbors: ["Adana", "Osmaniye", "Gaziantep"] },
    { id: "tr-10", name: "Balıkesir", x: 120, y: 220, region: "Marmara", isCoastal: true, neighbors: ["Çanakkale", "Bursa", "Kütahya", "Manisa", "İzmir"] },
    { id: "tr-09", name: "Aydın", x: 100, y: 360, region: "Ege", isCoastal: true, neighbors: ["İzmir", "Manisa", "Denizli", "Muğla"] },
    { id: "tr-44", name: "Malatya", x: 680, y: 310, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Sivas", "Erzincan", "Tunceli", "Elazığ", "Diyarbakır", "Adıyaman", "Kahramanmaraş"] }
];

export const generateOfflineMapDetective = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion } = options;
    const results: MapInstructionData[] = [];

    // 1. Şehir Havuzunu Filtrele (Bölge Ayarı)
    const cityPool = (emphasizedRegion && emphasizedRegion !== 'all')
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

        // Zorluk bazlı karmaşıklık öneki
        const isAdvanced = difficulty === 'Zor' || difficulty === 'Uzman';

        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            if (isAdvanced) {
                return `${randomCity.name} ilinin ${dir} komşu ili bul, bu ilin ismindeki tüm ünlü harfleri sayarak altına yaz.`;
            }
            return `${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE'];
            const color = colors[getRandomInt(0, colors.length - 1)];
            
            if (isAdvanced) {
                return `İsminde "${char}" harfi ile başlayan ve ${randomCity.region} bölgesinde yer alan EN BÜYÜK şehri bulup ${color} boya.`;
            }
            return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bulup ${color} boya.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            if (isAdvanced) {
                return `${randomCity.region} bölgesinde yer alan, denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} ve isminde çift sayıda hece bulunan şehri bul.`;
            }
            return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve daire içine al.`;
        }

        if (type === 'neighbor_path') {
            const potentialDestinations = safeCityPool.filter(c => c.id !== randomCity.id);
            const dest = potentialDestinations.length > 0 ? potentialDestinations[getRandomInt(0, potentialDestinations.length - 1)] : CALIBRATED_CITIES[0];
            
            if (isAdvanced) {
                return `${randomCity.name} ilinden yola çıkıp ${dest.name} iline doğru giderken geçmen gereken 2. ili bul ve isminin üzerini çiz.`;
            }
            return `${randomCity.name} ilinden yola çıkıp ${dest.name} iline doğru giderken geçtiğin ilk büyük şehri bul ve ismini boya.`;
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
            title: `Harita Dedektifi: ${emphasizedRegion === 'all' ? 'Türkiye' : emphasizedRegion} Analizi`,
            instruction: `${difficulty} Seviyesi: Harita üzerindeki konumları ve sınırları analiz ederek her görevi tamamla.`,
            pedagogicalNote: `Bu çalışma; görsel tarama, uzamsal konumlandırma ve yönerge takip becerilerini ${difficulty} düzeyinde tetikler.`,
            cities: CALIBRATED_CITIES.map(c => ({ ...c })),
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
