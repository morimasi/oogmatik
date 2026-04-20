
import { GeneratorOptions, FinancialMarketData } from '../../types';

export const generateOfflineFinancialMarketCalculator = async (options: GeneratorOptions): Promise<FinancialMarketData[]> => {
    const { worksheetCount, difficulty } = options;

    return Array.from({ length: worksheetCount }, () => ({
        id: 'finance_' + Date.now(),
        activityType: 'FINANCIAL_MARKET_CALCULATOR' as any,
        title: "Pazar Yeri & Finans",
        instruction: "Ürünlerin fiyatlarını inceleyin ve sepet toplamını hesaplayın.",
        currency: '₺',
        marketItems: [
            { id: '1', name: 'Elma', price: 10, unit: 'kg', icon: 'apple' },
            { id: '2', name: 'Ekmek', price: 8, unit: 'adet', icon: 'bread' },
            { id: '3', name: 'Süt', price: 25, unit: 'litre', icon: 'milk' }
        ],
        transactions: [
            {
                customerName: "Ayşe Hanım",
                cart: [{ itemId: '1', quantity: 2 }, { itemId: '2', quantity: 3 }],
                payment: 50
            }
        ],
        settings: {
            difficulty: difficulty || 'Orta',
            currency: 'TRY',
            budgetLimit: 100
        }
    } as any));
};
