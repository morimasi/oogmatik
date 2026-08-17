
import { GeneratorOptions, FinancialMarketData, FinancialMarketItem } from '../../types';
import { shuffle } from './helpers';

const MARKET_THEMES = {
    grocery: {
        shopName: "Bereket Süpermarket",
        title: "Pazar Yeri & Mutfak Alışverişi",
        items: [
            { id: 'g1', name: 'Organik Elma', price: 15, category: 'food', icon: 'fa-solid fa-apple-whole', unit: 'kg' },
            { id: 'g2', name: 'Taze Ekmek', price: 10, category: 'food', icon: 'fa-solid fa-bread-slice', unit: 'adet' },
            { id: 'g3', name: 'Süt (1L)', price: 28, category: 'food', icon: 'fa-solid fa-bottle-water', unit: 'kutu' },
            { id: 'g4', name: 'Peynir (500g)', price: 85, category: 'food', icon: 'fa-solid fa-cheese', unit: 'paket' },
            { id: 'g5', name: 'Zeytin (1kg)', price: 120, category: 'food', icon: 'fa-solid fa-bowl-food', unit: 'kg' },
            { id: 'g6', name: 'Bal (400g)', price: 150, category: 'food', icon: 'fa-solid fa-jar', unit: 'kavanoz' },
            { id: 'g7', name: 'Portakal', price: 20, category: 'food', icon: 'fa-solid fa-lemon', unit: 'kg' },
            { id: 'g8', name: 'Yumurta (10Lı)', price: 45, category: 'food', icon: 'fa-solid fa-egg', unit: 'koli' }
        ]
    },
    stationery: {
        shopName: "Bilge Kırtasiye",
        title: "Okul & Kırtasiye Dünyası",
        items: [
            { id: 's1', name: 'Çizgili Defter', price: 35, category: 'stationery', icon: 'fa-solid fa-book-open', unit: 'adet' },
            { id: 's2', name: 'Kurşun Kalem Seti', price: 25, category: 'stationery', icon: 'fa-solid fa-pencil', unit: 'paket' },
            { id: 's3', name: 'Boya Kalemi (12Lı)', price: 65, category: 'stationery', icon: 'fa-solid fa-palette', unit: 'kutu' },
            { id: 's4', name: 'Okul Çantası', price: 350, category: 'stationery', icon: 'fa-solid fa-briefcase', unit: 'adet' },
            { id: 's5', name: 'Silgi & Kalemtıraş', price: 18, category: 'stationery', icon: 'fa-solid fa-eraser', unit: 'set' },
            { id: 's6', name: 'Cetrel Takımı', price: 30, category: 'stationery', icon: 'fa-solid fa-ruler-combined', unit: 'set' },
            { id: 's7', name: 'Sulu Boya', price: 55, category: 'stationery', icon: 'fa-solid fa-brush', unit: 'kutu' },
            { id: 's8', name: 'Makas', price: 22, category: 'stationery', icon: 'fa-solid fa-scissors', unit: 'adet' }
        ]
    },
    bakery: {
        shopName: "Tatlı Fırın & Pastane",
        title: "Fırın & Pastane Alışverişi",
        items: [
            { id: 'b1', name: 'Tereyağlı Simit', price: 12, category: 'bakery', icon: 'fa-solid fa-cookie', unit: 'adet' },
            { id: 'b2', name: 'Kruvazan', price: 35, category: 'bakery', icon: 'fa-solid fa-bread-slice', unit: 'adet' },
            { id: 'b3', name: 'Çikolatalı Pasta', price: 280, category: 'bakery', icon: 'fa-solid fa-cake-candles', unit: 'adet' },
            { id: 'b4', name: 'Meyveli Tart', price: 45, category: 'bakery', icon: 'fa-solid fa-pie-chart', unit: 'dilim' },
            { id: 'b5', name: 'Poğaça', price: 15, category: 'bakery', icon: 'fa-solid fa-cookie-bite', unit: 'adet' },
            { id: 'b6', name: 'Sıcak Çay / Kahve', price: 20, category: 'bakery', icon: 'fa-solid fa-mug-hot', unit: 'fincan' },
            { id: 'b7', name: 'Dondurma (Külah)', price: 30, category: 'bakery', icon: 'fa-solid fa-ice-cream', unit: 'külah' },
            { id: 'b8', name: 'Kuru Pasta (kg)', price: 140, category: 'bakery', icon: 'fa-solid fa-box', unit: 'kg' }
        ]
    },
    toy_store: {
        shopName: "Hayal Oyuncakçı",
        title: "Oyuncak & Eğlence Dünyası",
        items: [
            { id: 't1', name: 'Akıl Oyunu (Puzzle)', price: 95, category: 'toy', icon: 'fa-solid fa-puzzle-piece', unit: 'kutu' },
            { id: 't2', name: 'Oyuncak Araba', price: 50, category: 'toy', icon: 'fa-solid fa-car', unit: 'adet' },
            { id: 't3', name: 'Peluş Ayı', price: 120, category: 'toy', icon: 'fa-solid fa-shield-cat', unit: 'adet' },
            { id: 't4', name: 'Basketbol Topu', price: 180, category: 'toy', icon: 'fa-solid fa-basketball', unit: 'adet' },
            { id: 't5', name: 'Lego Seti', price: 240, category: 'toy', icon: 'fa-solid fa-cubes', unit: 'kutu' },
            { id: 't6', name: 'Sihirli Oyun Hamuru', price: 40, category: 'toy', icon: 'fa-solid fa-icons', unit: 'set' },
            { id: 't7', name: 'Uçurtma', price: 35, category: 'toy', icon: 'fa-solid fa-paper-plane', unit: 'adet' },
            { id: 't8', name: 'Satranç Takımı', price: 110, category: 'toy', icon: 'fa-solid fa-chess-knight', unit: 'kutu' }
        ]
    }
};

const CUSTOMERS = ['Ayşe Hanım', 'Mehmet Bey', 'Selin Öğretmen', 'Caner Dayı', 'Elif Teyze', 'Deniz Müdür'];

export const generateOfflineFinancialMarketCalculator = async (options: GeneratorOptions): Promise<FinancialMarketData[]> => {
    const { worksheetCount = 1, difficulty } = options;
    const customSettings = (options as any).financialMarket || {};

    const currency = customSettings.currency || 'TRY';
    const useCents = customSettings.useCents ?? false;
    const budgetLimit = customSettings.budgetLimit || (difficulty === 'Kolay' ? 100 : 500);
    const themeKey = (customSettings.marketTheme || 'grocery') as keyof typeof MARKET_THEMES;
    const selectedTheme = MARKET_THEMES[themeKey] || MARKET_THEMES.grocery;
    const taskCount = customSettings.taskCount || (difficulty === 'Kolay' ? 3 : 4);
    const enableDiscounts = customSettings.enableDiscounts ?? (difficulty === 'Zor');

    const activities: FinancialMarketData[] = [];

    for (let w = 0; w < worksheetCount; w++) {
        const shelves: FinancialMarketItem[] = selectedTheme.items.map(item => {
            let price = item.price;
            if (budgetLimit <= 100) price = Math.max(5, Math.floor(price / 3));
            if (useCents) price += Math.random() > 0.5 ? 0.50 : 0.75;
            return { ...item, category: item.category as any, price };
        });

        const tasks: any[] = [];
        const walletBalance = Math.ceil(budgetLimit * 0.8 / 10) * 10;

        for (let t = 0; t < taskCount; t++) {
            const customerName = CUSTOMERS[t % CUSTOMERS.length];
            const itemCountInCart = Math.min(shelves.length, Math.floor(Math.random() * 2) + 2); // 2-3 çeşit ürün
            const selectedItems = shuffle([...shelves]).slice(0, itemCountInCart);

            const cart = selectedItems.map(item => ({
                itemId: item.id,
                quantity: Math.floor(Math.random() * 2) + 1 // 1-2 adet
            }));

            let expectedTotal = cart.reduce((sum, cItem) => {
                const prod = shelves.find(s => s.id === cItem.itemId);
                return sum + (prod ? prod.price * cItem.quantity : 0);
            }, 0);

            let discountAmount = 0;
            if (enableDiscounts && expectedTotal > 50) {
                discountAmount = Math.floor(expectedTotal * 0.1); // %10 İndirim
                expectedTotal -= discountAmount;
            }

            const possiblePayments = [20, 50, 100, 200, 500].filter(p => p >= expectedTotal);
            const givenMoney = possiblePayments.length > 0 ? possiblePayments[0] : Math.ceil(expectedTotal / 50) * 50;
            const expectedChange = Math.max(0, givenMoney - expectedTotal);

            const itemNames = cart.map(c => {
                const prod = shelves.find(s => s.id === c.itemId);
                return `${c.quantity} ${prod?.unit || 'adet'} ${prod?.name}`;
            }).join(' ve ');

            const instruction = `${customerName}, sepetine ${itemNames} ekledi. Kasiyere ${givenMoney} ${currency === 'TRY' ? '₺' : currency} verdi. Ödenecek toplam tutarı ve alınacak para üstünü hesaplayınız.`;

            tasks.push({
                id: `task_${t + 1}`,
                customerName,
                instruction,
                cart,
                givenMoney,
                expectedTotal,
                expectedChange,
                discountAmount: discountAmount > 0 ? discountAmount : undefined
            });
        }

        activities.push({
            id: 'finance_' + Date.now() + '_' + w,
            activityType: 'FINANCIAL_MARKET_CALCULATOR' as any,
            title: selectedTheme.title,
            instruction: "Aşağıdaki market rafındaki ürün fiyatlarını inceleyiniz. Fişlerdeki alışveriş tutarlarını ve para üstlerini hesaplayıp kutucuklara yazınız.",
            content: {
                title: selectedTheme.title,
                shopName: selectedTheme.shopName,
                walletBalance,
                shelves,
                tasks
            },
            settings: {
                difficulty: (difficulty as any) || 'orta',
                currency,
                useCents,
                budgetLimit,
                marketTheme: themeKey,
                taskCount,
                enableDiscounts
            }
        } as any);
    }

    return activities;
};
