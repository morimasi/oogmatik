
import { getRandomInt } from './helpers';

// Helper: Check constraints
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

const getRangeFromDigits = (digits: number) => {
    if (digits <= 0) return null; // Use manual range
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return { min, max };
};

// Main Drill Generator with Deep Constraints
export const generateMathDrillSet = (
    count: number,
    opType: 'add' | 'sub' | 'mult' | 'div' | 'mixed',
    settings: { 
        min: number, 
        max: number, 
        digit1: number,
        digit2: number,
        allowCarry: boolean, 
        allowBorrow: boolean, 
        allowRemainder: boolean,
        forceResultMax?: number
    }
) => {
    const operations = [];
    const opsList = opType === 'mixed' ? ['add', 'sub', 'mult', 'div'] : [opType];

    // Determine ranges based on digits if provided, else fall back to min/max
    const range1 = getRangeFromDigits(settings.digit1) || { min: settings.min, max: settings.max };
    const range2 = getRangeFromDigits(settings.digit2) || { min: settings.min, max: settings.max };

    for (let i = 0; i < count; i++) {
        const currentOp = opsList[getRandomInt(0, opsList.length - 1)];
        let n1, n2, ans, symbol;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            
            n1 = getRandomInt(range1.min, range1.max);
            n2 = getRandomInt(range2.min, range2.max);

            if (currentOp === 'add') {
                symbol = '+';
                if (!settings.allowCarry && hasCarry(n1, n2)) continue;
                if (settings.forceResultMax && (n1 + n2 > settings.forceResultMax)) continue;
                
                ans = n1 + n2;
                valid = true;
            } else if (currentOp === 'sub') {
                symbol = '-';
                if (n1 < n2) [n1, n2] = [n2, n1]; // Ensure positive
                // If strict digits set, ensure swapped result respects digits (optional, but good for consistency)
                
                if (!settings.allowBorrow && hasBorrow(n1, n2)) continue;
                ans = n1 - n2;
                valid = true;
            } else if (currentOp === 'mult') {
                symbol = 'x';
                // For multiplication, keep result manageable if not expert
                if (settings.forceResultMax && (n1 * n2 > settings.forceResultMax)) continue;
                ans = n1 * n2;
                valid = true;
            } else if (currentOp === 'div') {
                symbol = '÷';
                // Division logic:
                // n1 = Dividend (Bölünen), n2 = Divisor (Bölen)
                // Usually we generate Quotient and Divisor to find Dividend.
                // But if strict digits are requested for Dividend and Divisor, we must adhere.
                
                // Case 1: Strict Digits for n1 and n2
                if (settings.digit1 > 0 && settings.digit2 > 0) {
                    // Try random generation
                    if (n2 === 0) n2 = 1;
                    if (!settings.allowRemainder && n1 % n2 !== 0) continue;
                    ans = Math.floor(n1 / n2);
                    valid = true;
                } else {
                    // Case 2: Constructive (easier)
                    // Generate divisor (n2) and quotient, calc dividend (n1)
                    n2 = getRandomInt(range2.min, Math.min(range2.max, 20)); // Limit divisor size for standard drills
                    const quotient = getRandomInt(1, 20);
                    const remainder = settings.allowRemainder ? getRandomInt(1, n2-1) : 0;
                    n1 = n2 * quotient + remainder;
                    
                    // Check if n1 fits requested range/digits
                    if (n1 >= range1.min && n1 <= range1.max) {
                        ans = quotient;
                        valid = true;
                    }
                }
            }
        }
        operations.push({ n1, n2, symbol, ans, id: i });
    }
    return operations;
};
