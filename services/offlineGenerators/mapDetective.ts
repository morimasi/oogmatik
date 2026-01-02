
import { GeneratorOptions, MapInstructionData } from '../../types';
import { getRandomInt, shuffle, getRandomItems } from './helpers';

/**
 * TÜRKİYE İDARİ HARİTA KOORDİNAT SİSTEMİ (1000x500 ölçekli gerçekçi harita için)
 */
const CALIBRATED_CITIES = [
    { id: "tr-34", name: "İstanbul", x: 170, y: 105, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] },
    { id: "tr-06", name: "Ankara", x: 385, y: 195, region: "İç Anadolu", isCoastal: false, neighbors: ["Bolu", "Çankırı", "Kırıkkale", "Kırşehir", "Aksaray", "Konya", "Eskişehir"] },
    { id: "tr-35", name: "İzmir", x: 65, y: 290, region: "Ege", isCoastal: true, neighbors: ["Manisa", "Aydın", "Balıkesir"] },
    { id: "tr-07", name: "Antalya", x: 265, y: 410, region: "Akdeniz", isCoastal: true, neighbors: ["Muğla", "Burdur", "Isparta", "Konya", "Karaman", "Mersin"] },
    { id: "tr-01", name: "Adana", x: 535, y: 400, region: "Akdeniz", isCoastal: true, neighbors: ["Mersin", "Niğde", "Kayseri", "Osmaniye", "Hatay"] },
    { id: "tr-61", name: "Trabzon", x: 720, y: 115, region: "Karadeniz", isCoastal: true, neighbors: ["Rize", "Giresun", "Gümüşhane", "Bayburt"] },
    { id: "tr-25", name: "Erzurum", x: 840, y: 195, region: "Doğu Anadolu", isCoastal: false, neighbors: ["Artvin", "Ardahan", "Kars", "Ağrı", "Muş", "Bingöl", "Erzincan", "Rize", "Bayburt"] },
    { id: "tr-65", name: "Van", x: 955, y: 300, region: "Doğu Anadolu", isCoastal: true, neighbors: ["Ağrı", "Iğdır", "Hakkari", "Şırnak", "Siirt", "Bitlis"] },
    { id: "tr-21", name: "Diyarbakır", x: 800, y: 345, region: "Güneydoğu", isCoastal: false, neighbors: ["Elazığ", "Bingöl", "Muş", "Batman", "Mardin", "Şanlıurfa", "Adıyaman"] },
    { id: "tr-27", name: "Gaziantep", x: 635, y: 405, region: "Güneydoğu", isCoastal: false, neighbors: ["Kahramanmaraş", "Adıyaman", "Şanlıurfa", "Kilis", "Osmaniye"] },
    { id: "tr-55", name: "Samsun", x: 545, y: 95, region: "Karadeniz", isCoastal: true, neighbors: ["Sinop", "Çorum", "Amasya", "Tokat", "Ordu"] },
    { id: "tr-42", name: "Konya", x: 410, y: 350, region: "İç Anadolu", isCoastal: false, neighbors: ["Ankara", "Aksaray", "Niğde", "Karaman", "Antalya", "Isparta", "Afyonkarahisar", "Eskişehir"] },
    { id: "tr-16", name: "Bursa", x: 200, y: 175, region: "Marmara", isCoastal: true, neighbors: ["İstanbul", "Yalova", "Kocaeli", "Sakarya", "Bilecik", "Kütahya", "Balıkesir"] },
    { id: "tr-58", name: "Sivas", x: 610, y: 195, region: "İç Anadolu", isCoastal: false, neighbors: ["Yozgat", "Kayseri", "Kahramanmaraş", "Malatya", "Erzincan", "Giresun", "Ordu", "Tokat"] },
    { id: "tr-48", name: "Muğla", x: 125, y: 385, region: "Ege", isCoastal: true, neighbors: ["Aydın", "Denizli", "Burdur", "Antalya"] },
    { id: "tr-22", name: "Edirne", x: 45, y: 55, region: "Marmara", isCoastal: false, neighbors: ["Kırklareli", "Tekirdağ", "Çanakkale"] },
    { id: "tr-31", name: "Hatay", x: 575, y: 460, region: "Akdeniz", isCoastal: true, neighbors: ["Adana", "Osmaniye", "Gaziantep"] }
];

export const generateOfflineMapDetective = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, itemCount, mapInstructionTypes, showCityNames, markerStyle, emphasizedRegion } = options;
    const results: MapInstructionData[] = [];

    // Bölgeye göre şehir havuzunu filtrele
    const cityPool = (emphasizedRegion && emphasizedRegion !== 'all')
        ? CALIBRATED_CITIES.filter(c => c.region === emphasizedRegion)
        : CALIBRATED_CITIES;

    // Eğer filtreleme sonucu boşsa tüm listeyi kullan
    const safeCityPool = cityPool.length > 0 ? cityPool : CALIBRATED_CITIES;

    const activeTypes = (mapInstructionTypes && mapInstructionTypes.length > 0) 
        ? mapInstructionTypes 
        : ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path'];

    const getAdvancedRule = () => {
        const type = getRandomItems(activeTypes, 1)[0];
        const randomCity = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];

        // Zorluk bazlı karmaşıklık ayarı
        const complexityPrefix = difficulty === 'Zor' || difficulty === 'Uzman' ? 'Hızlıca analiz ederek: ' : '';

        if (type === 'spatial_logic') {
            const directions = ['KUZEYİNDEKİ', 'GÜNEYİNDEKİ', 'DOĞUSUNDAKİ', 'BATISINDAKİ'];
            const dir = directions[getRandomInt(0, 3)];
            return `${complexityPrefix}${randomCity.name} ilinin hemen ${dir} komşu ili bul ve üzerine bir YILDIZ çiz.`;
        }

        if (type === 'linguistic_geo') {
            const chars = ['A', 'B', 'M', 'S', 'T', 'İ', 'K'];
            const char = chars[getRandomInt(0, chars.length - 1)];
            const colors = ['MAVİYE', 'KIRMIZIYA', 'SARIYA', 'YEŞİLE'];
            const color = colors[getRandomInt(0, colors.length - 1)];
            return `İsminde "${char}" harfi geçen ve ${randomCity.region} bölgesinde olan bir ili bulup ${color} boya.`;
        }

        if (type === 'attribute_search') {
            const isCoastal = Math.random() > 0.5;
            return `${randomCity.region} bölgesinde yer alan ve denize kıyısı ${isCoastal ? 'OLAN' : 'OLMAYAN'} bir ili bul ve daire içine al.`;
        }

        if (type === 'neighbor_path') {
            const dest = safeCityPool[getRandomInt(0, safeCityPool.length - 1)];
            return `${randomCity.name} ilinden yola çıkıp ${dest.name} iline doğru en kısa yoldan giderken geçtiğin ilk büyük şehri bul ve ismini boya.`;
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
            title: "Harita Dedektifi: Uzamsal Analiz",
            instruction: "Aşağıdaki profesyonel coğrafi yönergeleri dikkatle oku. Harita üzerindeki konumları ve sınırları analiz ederek her görevi tamamla.",
            pedagogicalNote: `Bu çalışma; ${emphasizedRegion === 'all' ? 'Türkiye geneli' : emphasizedRegion + ' bölgesi'} odaklı görsel tarama ve uzamsal konumlandırma becerilerini tetikler.`,
            cities: CALIBRATED_CITIES.map(c => ({ ...c })),
            instructions,
            settings: {
                showCityNames: showCityNames !== undefined ? showCityNames : false,
                markerStyle: (markerStyle as any) || 'circle',
                difficulty
            }
        });
    }

    return results;
};
