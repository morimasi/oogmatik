import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions, FinancialMarketData } from '../../types';

export const generateFinancialMarket = async (options: GeneratorOptions): Promise<FinancialMarketData> => {
    const difficulty = options.difficulty || 'Orta';
    const currency = options.currency || 'TRY';
    const useCents = options.useCents === true;
    const budgetLimit = options.budgetLimit || 100;
    const cartSize = options.cartSize || 2;
    const taskCount = options.itemCount || 4; // Kaç farklı alışveriş görevi olacak
    const student = options.studentContext;

    let currencySymbol = '₺';
    if (currency === 'USD') currencySymbol = '$';
    if (currency === 'EUR') currencySymbol = '€';

    let mathRulesInstruction = `Fiyatlar SADECE TAM SAYI olmalıdır (Örn: 5 ${currencySymbol}, 12 ${currencySymbol}). Kuruşlu veya ondalıklı ifadeler KESİNLİKLE KULLANMA.`;
    if (useCents) {
        mathRulesInstruction = `Fiyatlar ONDALIKLI SAYI (Kuruş/Cent) OLABİLİR (Örn: 5.50 ${currencySymbol}, 12.75 ${currencySymbol}). Matematiksel toplama çıkarma hesapları ONDALIKLARI desteklemelidir.`;
    }

    let studentInstruction = '';
    if (student) {
        studentInstruction = `Öğrenci Profili: ${student.age} yaşında, ${student.grade} sınıf. Öğrencinin yaşına uygun ve eğlenceli dükkan konseptleri (Kitapçı, Oyuncakçı, Bakkal vs) seç.`;
    }

    const prompt = `
Sen diskalkulisi (matematik öğrenme güçlüğü) olan çocuklara alışveriş, bütçe yönetimi ve para üstü(change) konularını öğreten bir yapay zekasın.
Görev: ${budgetLimit} ${currencySymbol} bütçe limitine ve verilen yönergelere uyarak eğlenceli bir "Pazar Yeri/Dükkan" simülasyonu üret.

PARAMETRELER:
- Zorluk: ${difficulty}
- Para Birimi: ${currencySymbol}
- Bütçe Limiti (Öğrencinin Başlangıç Parası): ${budgetLimit} ${currencySymbol}
- Görev (Task) Sayısı: Tam Olarak ${taskCount} Adet
- Her Görevdeki Sepet Büyüklüğü: ${cartSize} farklı ürün
- Matematik Kuralı: ${mathRulesInstruction}
${studentInstruction}

Görev Tanımı:
1. Eğlenceli bir mağaza (shopName) uydur (Örn: "Uzay Market", "Kitap Kurdu Kırtasiye").
2. "shelves" dizisinde markette satılan EN AZ 6-8 çeşit DİNAMİK ÜRÜN oluştur. 
   Ürün isimleri (name), fiyatları (price) tanımla. İkon olarak fontawesome class ver (örn: "fa-solid fa-apple-whole", "fa-solid fa-car").
3. "tasks" dizisinde çocuğun yapması gereken ALIŞVERİŞ GÖREVLERİNİ (instruction) ve sepetlerini üret.
   Ayrıca matematiksel 'beklenen_toplam_Tutar' (expectedTotal) ve 'beklenen_paraUstu' (expectedChange) değerlerini doğru hesaplayarak JSON'a KENDİN EKLE. 
4. Öğrencinin başlangıç "walletBalance" değerini ${budgetLimit} civarı (fakat sepetin toplamından BÜYÜK veya ona EŞİT) mantıklı bir sayı olarak ver. (Para üstü hesaplanabilmeli, bakiye eksiye düşmemeli).

UYARI:
- JSON üreteceksin, başka text YAZMA!
- ExpectedTotal = Sepetteki ürünlerin fiyatı * quantity (adedi) toplamı.
- ExpectedChange = walletBalance - expectedTotal. (Bunlar ondalıklıysa double formatta yaz, örn: 15.25. Para üstü negatif OLAMAZ!)

JSON Şablonu:
{
    "id": "market_puzzle",
    "activityType": "FINANCIAL_MARKET_CALCULATOR",
    "title": "Alışveriş Zamanı",
    "settings": {
        "difficulty": "${difficulty}",
        "currency": "${currency}",
        "useCents": ${useCents},
        "budgetLimit": ${budgetLimit}
    },
    "content": {
        "title": "Markete Gidiyoruz",
        "shopName": "Neşeli Bakkal",
        "walletBalance": ${budgetLimit},
        "shelves": [
            { "id": "U1", "name": "Elma", "price": 5${useCents ? '.50' : ''}, "category": "food", "icon": "fa-solid fa-apple-whole" },
            { "id": "U2", "name": "Süt", "price": 12, "category": "food", "icon": "fa-solid fa-bottle-droplet" }
        ],
        "tasks": [
            {
                "id": "T1",
                "instruction": "2 tane elma ve 1 şişe süt alırsan toplam ne kadar ödersin? Bakkala paranı verirsen, sana ne kadar para üstü kalır?",
                "cart": [
                    { "itemId": "U1", "quantity": 2 },
                    { "itemId": "U2", "quantity": 1 }
                ],
                "expectedTotal": 23, 
                "expectedChange": ${budgetLimit - 23} 
            }
        ]
    }
}
`;

    const parsedData = await generateCreativeMultimodal({
        prompt: prompt,
        temperature: 0.7,
    });

    return parsedData as FinancialMarketData;
};
