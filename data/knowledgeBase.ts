
// BURSA DİSLEKSİ AI - AKILLI VERİ HAVUZU (KNOWLEDGE BASE)
// Bu dosya, basit string listeleri yerine yapılandırılmış veri içerir.

export interface WordItem {
    text: string;
    syllables: string[];
    difficulty: 1 | 2 | 3 | 4; // 1: Başlangıç, 4: Uzman
    tags: string[];
    imagePrompt?: string; // İngilizce karşılığı (Görsel üretim için)
}

export const KNOWLEDGE_BASE: Record<string, WordItem[]> = {
    animals: [
        { text: "kedi", syllables: ["ke", "di"], difficulty: 1, tags: ["evcil", "memeli"], imagePrompt: "cat" },
        { text: "köpek", syllables: ["kö", "pek"], difficulty: 1, tags: ["evcil", "memeli"], imagePrompt: "dog" },
        { text: "fil", syllables: ["fil"], difficulty: 1, tags: ["vahşi", "büyük"], imagePrompt: "elephant" },
        { text: "zürafa", syllables: ["zü", "ra", "fa"], difficulty: 2, tags: ["vahşi", "uzun"], imagePrompt: "giraffe" },
        { text: "karınca", syllables: ["ka", "rın", "ca"], difficulty: 2, tags: ["böcek", "küçük"], imagePrompt: "ant" },
        { text: "ahtapot", syllables: ["ah", "ta", "pot"], difficulty: 3, tags: ["deniz", "yumuşakça"], imagePrompt: "octopus" },
        { text: "bukalemun", syllables: ["bu", "ka", "le", "mun"], difficulty: 4, tags: ["sürüngen", "renkli"], imagePrompt: "chameleon" },
        { text: "suaygırı", syllables: ["su", "ay", "gı", "rı"], difficulty: 3, tags: ["vahşi", "su"], imagePrompt: "hippo" },
    ],
    fruits_veggies: [
        { text: "elma", syllables: ["el", "ma"], difficulty: 1, tags: ["meyve", "kırmızı"], imagePrompt: "apple" },
        { text: "muz", syllables: ["muz"], difficulty: 1, tags: ["meyve", "sarı"], imagePrompt: "banana" },
        { text: "çilek", syllables: ["çi", "lek"], difficulty: 2, tags: ["meyve", "yaz"], imagePrompt: "strawberry" },
        { text: "karnabahar", syllables: ["kar", "na", "ba", "har"], difficulty: 4, tags: ["sebze", "kış"], imagePrompt: "cauliflower" },
        { text: "maydanoz", syllables: ["may", "da", "noz"], difficulty: 3, tags: ["sebze", "yeşil"], imagePrompt: "parsley" },
    ],
    school: [
        { text: "kalem", syllables: ["ka", "lem"], difficulty: 1, tags: ["kırtasiye"], imagePrompt: "pencil" },
        { text: "kitap", syllables: ["ki", "tap"], difficulty: 1, tags: ["kırtasiye"], imagePrompt: "book" },
        { text: "tebeşir", syllables: ["te", "be", "şir"], difficulty: 3, tags: ["sınıf"], imagePrompt: "chalk" },
        { text: "laboratuvar", syllables: ["la", "bo", "ra", "tu", "var"], difficulty: 4, tags: ["mekan"], imagePrompt: "science lab" },
    ],
    abstract: [
        { text: "sevgi", syllables: ["sev", "gi"], difficulty: 2, tags: ["duygu"], imagePrompt: "heart love" },
        { text: "cesaret", syllables: ["ce", "sa", "ret"], difficulty: 3, tags: ["kavram"], imagePrompt: "bravery lion" },
        { text: "özgürlük", syllables: ["öz", "gür", "lük"], difficulty: 3, tags: ["kavram"], imagePrompt: "freedom bird" },
        { text: "sorumluluk", syllables: ["so", "rum", "lu", "luk"], difficulty: 4, tags: ["değer"], imagePrompt: "responsibility" },
    ]
};

// Renklerin CSS ve Türkçe adları
export const COLORS_DB = [
    { name: 'KIRMIZI', hex: '#EF4444', difficulty: 1 },
    { name: 'MAVİ', hex: '#3B82F6', difficulty: 1 },
    { name: 'SARI', hex: '#EAB308', difficulty: 1 },
    { name: 'YEŞİL', hex: '#22C55E', difficulty: 1 },
    { name: 'TURUNCU', hex: '#F97316', difficulty: 2 },
    { name: 'MOR', hex: '#A855F7', difficulty: 2 },
    { name: 'PEMBE', hex: '#EC4899', difficulty: 2 },
    { name: 'TURKUAZ', hex: '#06B6D4', difficulty: 3 },
    { name: 'LİLA', hex: '#C4B5FD', difficulty: 3 },
    { name: 'LACİVERT', hex: '#1E3A8A', difficulty: 3 },
    { name: 'GRİ', hex: '#6B7280', difficulty: 2 },
    { name: 'SİYAH', hex: '#000000', difficulty: 1 }
];
