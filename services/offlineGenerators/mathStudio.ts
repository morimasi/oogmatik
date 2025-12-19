
import { MathStudioConfig, MathOperation, MathStudioData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

const hasCarry = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    const len = Math.max(s1.length, s2.length);
    let carry = 0;
    for (let i = 0; i < len; i++) {
        const d1 = parseInt(s1[i] || '0');
        const d2 = parseInt(s2[i] || '0');
        if (d1 + d2 + carry >= 10) return true;
        carry = Math.floor((d1 + d2 + carry) / 10);
    }
    return false;
};

const hasBorrow = (n1: number, n2: number): boolean => {
    const s1 = n1.toString().split('').reverse();
    const s2 = n2.toString().split('').reverse();
    for (let i = 0; i < s2.length; i++) {
        if (parseInt(s1[i]) < parseInt(s2[i])) return true;
    }
    return false;
};

export const generateMathStudioOffline = (config: MathStudioConfig): MathStudioData => {
    const operations: MathOperation[] = [];
    const count = config.itemCount || 20; // Will be passed as auto-calculated count from component
    
    // Explicit digit ranges
    const min1 = Math.pow(10, config.num1Digits - 1);
    const max1 = Math.pow(10, config.num1Digits) - 1;
    
    const min2 = Math.pow(10, config.num2Digits - 1);
    const max2 = Math.pow(10, config.num2Digits) - 1;

    for (let i = 0; i < count; i++) {
        const op = config.operations[getRandomInt(0, config.operations.length - 1)];
        let num1 = 0, num2 = 0, ans = 0, rem = 0, valid = false;
        let attempts = 0;

        while(!valid && attempts < 200) {
            attempts++;
            num1 = getRandomInt(min1, max1);
            num2 = getRandomInt(min2, max2);
            
            if (op === 'add') {
                if (!config.allowCarry && hasCarry(num1, num2)) continue;
                ans = num1 + num2;
                valid = true;
            } else if (op === 'sub') {
                // Ensure num1 >= num2 for non-negative result
                if (num1 < num2) {
                    // Try to swap if swapping fits the digit constraints
                    // (e.g. if both are 2 digits, swap is fine. If num1 is 2 digits, num2 is 3, simple swap violates constraints)
                    // If num1Digits >= num2Digits is enforced by UI, then just skip if random gen violated it (rare if ranges are correct)
                    // But if num1Digits < num2Digits (e.g. 10 - 100), result is negative.
                    // We only support positive arithmetic for this level.
                    // Retry until num1 >= num2
                    continue; 
                }
                
                if (!config.allowBorrow && hasBorrow(num1, num2)) continue;
                ans = num1 - num2;
                valid = true;
            } else if (op === 'mult') {
                ans = num1 * num2;
                valid = true;
            } else if (op === 'div') {
                if (num2 === 0) continue;
                if (!config.allowRemainder) {
                    // Construct a clean division
                    // To keep digit constraints valid: 
                    // We need num1 (Dividend) to have num1Digits and num2 (Divisor) to have num2Digits.
                    // It's hard to force divisibility AND exact digit counts randomly.
                    // Strategy: Pick num2 (divisor) and 'answer' (quotient) such that num1 fits range.
                    
                    // Relaxed Strategy for Division in Drill Mode:
                    // Priority is the Divisor Digits (num2) and Dividend Digits (num1).
                    // We check if num1 % num2 == 0.
                    if (num1 % num2 !== 0) continue;
                }
                
                // Ensure Dividend >= Divisor
                if (num1 < num2) continue;
                
                ans = Math.floor(num1 / num2);
                rem = num1 % num2;
                valid = true;
            }
        }

        const unknownPos = config.findUnknown ? (['num1', 'num2', 'ans'][getRandomInt(0, 2)] as any) : 'ans';

        operations.push({ num1, num2, operator: op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mult' ? 'x' : '÷', answer: ans, remainder: rem, unknownPos });
    }

    return {
        title: "Matematik Çalışma Sayfası",
        instruction: "İşlemleri dikkatle yapınız.",
        pedagogicalNote: "İşlem akıcılığı ve sayı hissi çalışması.",
        operations,
        problems: []
    };
};
