
// ... (Proverbs ve Sayings dizileri aynı kalıyor) ...
export const PROVERBS = ["Damlaya damlaya göl olur.", "Sakla samanı, gelir zamanı."]; 
export const SAYINGS = ["Hayatta en hakiki mürşit ilimdir."];

export interface StoryTemplate {
    id: string;
    level: 'Başlangıç' | 'Orta' | 'Zor';
    titleTemplate: string;
    textTemplate: string; 
    variables: { [key: string]: string[]; };
    questions: { q: string; aKey: string; distractors: string[]; }[];
    // Yeni Alanlar
    vocabulary?: { word: string; definition: string; }[];
    creativeTask?: string;
    // Eski Alanlar (Gerekirse korunabilir ama kullanılmayacak)
    fiveW1H_keys?: any; 
    imagePromptTemplate: string;
}

export const COHERENT_STORY_TEMPLATES: StoryTemplate[] = [
    {
        id: 'kayip_esya',
        level: 'Başlangıç',
        titleTemplate: "{character}'in Kayıp {object}'ı",
        textTemplate: "{character} o gün çok heyecanlıydı. Çünkü okula en sevdiği {object}'ını götürecekti. {character}, okula geldiğinde {object}'ını çantasına koyduğunu sandı. Teneffüs zili çaldı ve bahçeye çıktı. Arkadaşı {friend} ile oynamaya başladı. Bir süre sonra {object}'ını göstermek istedi ama çantasında bulamadı! Çok üzüldü. {friend} ona yardım etmeye karar verdi. Birlikte sınıfı aradılar. Sonunda {object}'ı {location}ın altında buldular. {character} çok sevindi ve arkadaşına teşekkür etti.",
        variables: {
            character: ["Ali", "Ayşe", "Mert", "Zeynep"],
            object: ["kırmızı top", "mavi kalem", "oyuncak araba"],
            friend: ["Cem", "Selin", "Efe"],
            location: ["öğretmen masası", "arka sıra", "kitaplık"]
        },
        questions: [
            { q: "Hikayenin kahramanı kimdir?", aKey: "character", distractors: ["Öğretmen", "Müdür", "Kedi"] },
            { q: "Kahraman neyi kaybetmiştir?", aKey: "object", distractors: ["Ayakkabısını", "Montunu", "Silgisini"] },
            { q: "Eşyayı nerede buldular?", aKey: "location", distractors: ["Bahçede", "Kantinde", "Evde"] }
        ],
        vocabulary: [
            { word: "Heyecanlı", definition: "Çok sevinçli veya telaşlı olma durumu." },
            { word: "Teneffüs", definition: "Ders aralarında verilen dinlenme zamanı." },
            { word: "Karar", definition: "Bir işi yapmaya kesin olarak niyetlenmek." }
        ],
        creativeTask: "Kaybolan eşyanın resmini çiz ve yanına onu bulan arkadaşını ekle.",
        imagePromptTemplate: "Children in a classroom looking for a {object} under a {location}, cartoon style"
    },
    {
        id: 'doga_yuruyusu',
        level: 'Orta',
        titleTemplate: "{place}'daki Sürpriz",
        textTemplate: "{character}, hafta sonu ailesiyle birlikte {place}'a yürüyüşe gitti. Doğayı çok seviyordu. Yürürken yerdeki çöpleri fark etti ve çok üzüldü. Yanında getirdiği boş poşeti çıkardı. Ailesiyle birlikte etraftaki {trash} atıklarını topladılar. Bir süre sonra {place} tertemiz olmuştu. Tam o sırada bir {animal} ortaya çıktı ve sanki onlara teşekkür eder gibi baktı. {character}, doğa için faydalı bir şey yapmanın mutluluğunu yaşadı.",
        variables: {
            character: ["Kerem", "Asya", "Bora"],
            place: ["orman", "sahil", "göl kenarı"],
            trash: ["plastik şişe", "kağıt", "kutu"],
            animal: ["tavşan", "kaplumbağa", "kirpi"]
        },
        questions: [
            { q: "{character} nereye gitti?", aKey: "place", distractors: ["Sinemaya", "Alışverişe", "Eve"] },
            { q: "Yerde ne görünce üzüldü?", aKey: "trash", distractors: ["Taşlar", "Çiçekler", "Böcekler"] },
            { q: "Sonunda hangi hayvanı gördü?", aKey: "animal", distractors: ["Ayı", "Kurt", "Aslan"] }
        ],
        vocabulary: [
            { word: "Doğa", definition: "İnsan eli değmemiş, bitkiler ve hayvanların yaşadığı çevre." },
            { word: "Faydalı", definition: "İşe yarayan, yararı olan." },
            { word: "Atık", definition: "Kullanıldıktan sonra atılan madde, çöp." }
        ],
        creativeTask: "Sen doğayı korumak için ne yapardın? Bir slogan bul ve afişini çiz.",
        imagePromptTemplate: "Child cleaning trash in a {place}, watching a {animal}, educational illustration"
    }
];
