const fs = require('fs');
const path = require('path');

const cityCoords = [
    { "plate": "01", "name": "Adana", "x": 516, "y": 329 },
    { "plate": "02", "name": "Adıyaman", "x": 659, "y": 307 },
    { "plate": "03", "name": "Afyonkarahisar", "x": 255, "y": 254 },
    { "plate": "04", "name": "Ağrı", "x": 919, "y": 181 },
    { "plate": "05", "name": "Amasya", "x": 518, "y": 115 },
    { "plate": "06", "name": "Ankara", "x": 345, "y": 180 },
    { "plate": "07", "name": "Antalya", "x": 259, "y": 376 },
    { "plate": "08", "name": "Artvin", "x": 834, "y": 83 },
    { "plate": "09", "name": "Aydın", "x": 106, "y": 294 },
    { "plate": "10", "name": "Balıkesir", "x": 106, "y": 151 },
    { "plate": "11", "name": "Bilecik", "x": 232, "y": 146 },
    { "plate": "12", "name": "Bingöl", "x": 775, "y": 221 },
    { "plate": "13", "name": "Bitlis", "x": 872, "y": 249 },
    { "plate": "14", "name": "Bolu", "x": 305, "y": 117 },
    { "plate": "15", "name": "Burdur", "x": 216, "y": 329 },
    { "plate": "16", "name": "Bursa", "x": 177, "y": 143 },
    { "plate": "17", "name": "Çanakkale", "x": 48, "y": 129 },
    { "plate": "18", "name": "Çankırı", "x": 402, "y": 115 },
    { "plate": "19", "name": "Çorum", "x": 470, "y": 117 },
    { "plate": "20", "name": "Denizli", "x": 172, "y": 305 },
    { "plate": "21", "name": "Diyarbakır", "x": 768, "y": 279 },
    { "plate": "22", "name": "Edirne", "x": 52, "y": 50 },
    { "plate": "23", "name": "Elazığ", "x": 711, "y": 236 },
    { "plate": "24", "name": "Erzincan", "x": 725, "y": 187 },
    { "plate": "25", "name": "Erzurum", "x": 814, "y": 146 },
    { "plate": "26", "name": "Eskişehir", "x": 273, "y": 181 },
    { "plate": "27", "name": "Gaziantep", "x": 602, "y": 352 },
    { "plate": "28", "name": "Giresun", "x": 666, "y": 122 },
    { "plate": "29", "name": "Gümüşhane", "x": 711, "y": 136 },
    { "plate": "30", "name": "Hakkâri", "x": 971, "y": 316 },
    { "plate": "31", "name": "Hatay", "x": 547, "y": 403 },
    { "plate": "32", "name": "Isparta", "x": 257, "y": 295 },
    { "plate": "33", "name": "Mersin", "x": 419, "y": 381 },
    { "plate": "34", "name": "İstanbul", "x": 173, "y": 67 },
    { "plate": "35", "name": "İzmir", "x": 75, "y": 232 },
    { "plate": "36", "name": "Kars", "x": 892, "y": 110 },
    { "plate": "37", "name": "Kastamonu", "x": 415, "y": 62 },
    { "plate": "38", "name": "Kayseri", "x": 527, "y": 257 },
    { "plate": "39", "name": "Kırklareli", "x": 104, "y": 29 },
    { "plate": "40", "name": "Kırşehir", "x": 432, "y": 207 },
    { "plate": "41", "name": "Kocaeli", "x": 220, "y": 93 },
    { "plate": "42", "name": "Konya", "x": 365, "y": 294 },
    { "plate": "43", "name": "Kütahya", "x": 194, "y": 195 },
    { "plate": "44", "name": "Malatya", "x": 661, "y": 258 },
    { "plate": "45", "name": "Manisa", "x": 116, "y": 228 },
    { "plate": "46", "name": "Kahramanmaraş", "x": 587, "y": 304 },
    { "plate": "47", "name": "Mardin", "x": 803, "y": 335 },
    { "plate": "48", "name": "Muğla", "x": 129, "y": 351 },
    { "plate": "49", "name": "Muş", "x": 846, "y": 216 },
    { "plate": "50", "name": "Nevşehir", "x": 462, "y": 236 },
    { "plate": "51", "name": "Niğde", "x": 462, "y": 303 },
    { "plate": "52", "name": "Ordu", "x": 608, "y": 111 },
    { "plate": "53", "name": "Rize", "x": 784, "y": 93 },
    { "plate": "54", "name": "Sakarya", "x": 250, "y": 104 },
    { "plate": "55", "name": "Samsun", "x": 533, "y": 75 },
    { "plate": "56", "name": "Siirt", "x": 863, "y": 292 },
    { "plate": "57", "name": "Sinop", "x": 479, "y": 50 },
    { "plate": "58", "name": "Sivas", "x": 599, "y": 190 },
    { "plate": "59", "name": "Tekirdağ", "x": 97, "y": 70 },
    { "plate": "60", "name": "Tokat", "x": 566, "y": 131 },
    { "plate": "61", "name": "Trabzon", "x": 729, "y": 103 },
    { "plate": "62", "name": "Tunceli", "x": 719, "y": 211 },
    { "plate": "63", "name": "Şanlıurfa", "x": 702, "y": 335 },
    { "plate": "64", "name": "Uşak", "x": 184, "y": 245 },
    { "plate": "65", "name": "Van", "x": 936, "y": 238 },
    { "plate": "66", "name": "Yozgat", "x": 490, "y": 188 },
    { "plate": "67", "name": "Zonguldak", "x": 320, "y": 71 },
    { "plate": "68", "name": "Aksaray", "x": 416, "y": 262 },
    { "plate": "69", "name": "Bayburt", "x": 749, "y": 137 },
    { "plate": "70", "name": "Karaman", "x": 384, "y": 361 },
    { "plate": "71", "name": "Kırıkkale", "x": 415, "y": 171 },
    { "plate": "72", "name": "Batman", "x": 821, "y": 281 },
    { "plate": "73", "name": "Şırnak", "x": 888, "y": 319 },
    { "plate": "74", "name": "Bartın", "x": 355, "y": 52 },
    { "plate": "75", "name": "Ardahan", "x": 885, "y": 73 },
    { "plate": "76", "name": "Iğdır", "x": 950, "y": 150 },
    { "plate": "77", "name": "Yalova", "x": 183, "y": 109 },
    { "plate": "78", "name": "Karabük", "x": 362, "y": 77 },
    { "plate": "79", "name": "Kilis", "x": 595, "y": 374 },
    { "plate": "80", "name": "Osmaniye", "x": 547, "y": 338 },
    { "plate": "81", "name": "Düzce", "x": 293, "y": 97 }
];

const filePath = path.join(__dirname, 'services/offlineGenerators/mapDetective.ts');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const newLines = lines.map(line => {
    // try to match { id: "tr-34", name: "İstanbul", x: 175, y: 115, region: "Marmara", isCoastal: true, neighbors: ["Tekirdağ", "Kocaeli"] }
    const match = line.match(/(.*)\{ id: "(tr-\d{2})", name: "([^"]+)", x: \d+, y: \d+, (.*)\}(,?)(.*)/);
    if (match) {
        const prefix = match[1];
        const id = match[2];
        const plateStr = id.split('-')[1];
        const name = match[3];
        const rest = match[4];
        const comma = match[5];
        const suffix = match[6];

        const newCoord = cityCoords.find(c => c.plate === plateStr);
        if (newCoord) {
            return `${prefix}{ id: "${id}", name: "${name}", x: ${newCoord.x}, y: ${newCoord.y}, ${rest}}${comma}${suffix}`;
        }
    }
    return line;
});

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Update complete.');
